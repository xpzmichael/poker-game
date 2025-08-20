import { useEffect } from 'react'
import socket from '../socket'

export default function usePokerSocket({ addLog, setGameState, setPrivateState, setValidActions }) {
  useEffect(() => {
    addLog('Welcome to Poker Game!')
    addLog('Enter your name and click "Join Game" to start playing.')

    socket.on('connect', () => addLog('Connected to server', 'success'))
    socket.on('disconnect', () => addLog('Disconnected from server', 'error'))

    socket.on('room_state', (state) => setGameState({ ...state }))
    socket.on('private_state', (state) => {
      setPrivateState(state)
      setValidActions(state?.validActions || [])
    })
    socket.on('showdown', (results) => {
      addLog('Showdown received', 'success')
      setGameState((gs) => ({ ...gs, showdown: results }))
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('room_state')
      socket.off('private_state')
      socket.off('showdown')
    }
  }, [addLog, setGameState, setPrivateState, setValidActions])
}
