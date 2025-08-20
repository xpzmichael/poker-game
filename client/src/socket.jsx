import { io } from 'socket.io-client'

// Auto-detect server URL from current page location
const getServerUrl = () => {
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const port = '3000' // Your server port
  
  const serverUrl = `${protocol}//${hostname}:${port}`
  console.log('Auto-detected server URL:', serverUrl)
  
  return serverUrl
}

const socket = io(getServerUrl(), {
  withCredentials: true,
  transports: ['websocket', 'polling'] // Added polling as fallback
})


export default socket
