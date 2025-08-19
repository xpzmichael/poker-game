import socket from '../socket'

export const joinGame = (name, setPlayerId, setPlayerName, addLog) => {
  if (!name || name.trim() === '') return addLog('Please enter your name', 'error')

  socket.emit('join', { name }, (response) => {
    if (response.ok) {
      setPlayerId(response.playerId)
      setPlayerName(response.playerName)
      addLog(`Joined as ${response.playerName}`, 'success')
    } else {
      addLog(`Failed to join: ${response.error}`, 'error')
    }
  })
}

export const startHand = (addLog) => {
  socket.emit('start_hand', (r) =>
    r.ok ? addLog('New hand started', 'success') : addLog(`Failed to start hand: ${r.error}`, 'error')
  )
}

export const resetGame = (addLog) => {
  const password = window.prompt('Enter admin password to reset the game:')
  if (!password) return addLog('Reset cancelled: No password entered', 'error')

  socket.emit('reset_game', { password }, (r) =>
    r.ok ? addLog('Game reset', 'success') : addLog(`Failed to reset: ${r.error}`, 'error')
  )
}

export const playerAction = (action, amount = 0, addLog) => {
  socket.emit('action', { action, amount }, (r) =>
    r.ok || addLog(`Action failed: ${r.error}`, 'error')
  )
}

export const removeUnreadyPlayers = (addLog) => {
  const password = window.prompt('Enter admin password to remove unready players:')
  if (!password) return addLog('Removal cancelled: No password entered', 'error')

  socket.emit('remove_unready_players', { password }, (r) =>
    r.ok ? addLog('Unready players removed', 'success') : addLog(`Failed to remove unready players: ${r.error}`, 'error')
  )
}
