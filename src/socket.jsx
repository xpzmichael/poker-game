import { io } from 'socket.io-client'

// Example if backend runs locally on port 3000:
const socket = io('http://localhost:3000', {
  withCredentials: true,
  transports: ['websocket'] // optional but can help avoid polling delays
})

export default socket
