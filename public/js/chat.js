const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-message-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})



const autoscroll = () => {
    // New message element
    const $newMessage = $messages

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}



socket.on('message', (msg) => {
   
    const html = Mustache.render($messageTemplate, {username: msg.username, message: msg.text, createdAt: moment(msg.createdAt).format('YYYY-MM-DD h:mm a')})
    $messages.insertAdjacentHTML('beforebegin', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render($locationTemplate, {username: message.username, url: message.url, createdAt: moment(message.createdAt).format('YYYY-MM-DD h:mm a')})
    $messages.insertAdjacentHTML('beforebegin', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {

    const html = Mustache.render($sidebarTemplate, {room, users})
    $sidebar.innerHTML = html

} )
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const message = e.target.elements.message.value
$messageFormButton.setAttribute('disabled', 'disabled')

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
$messageFormInput.focus()
       
        if (error) {
            return  console.log(error)
        }
        console.log('Message delivered')
    })
})

$sendLocationButton.addEventListener('click', () => {
    
    if (!navigator.geolocation.getCurrentPosition) {
        return alert('Geo location not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        
        socket.emit("sendLocation", {
            latitude:  position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
           console.log('Location shared') 
        })
    })
})

socket.emit('join', {username, room}, (error) => {

    if (error) {
        alert('User alreaady in use')
        location.href = '/'
    }

})
// Example 1 strat
// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')
//     socket.emit('increment')
// })