import React, { useEffect, useState, useCallback } from 'react'
import socket from './socket'
import Controls from './components/Controls'
import Players from './components/Players'
import GameInfo from './components/GameInfo'
import CommunityCards from './components/CommunityCards'
import HoleCards from './components/HoleCards'
import Log from './components/Log'
import './index.css'

export default function App() {
  const [playerId, setPlayerId] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [gameState, setGameState] = useState({})
  const [privateState, setPrivateState] = useState({})
  const [validActions, setValidActions] = useState([])
  const [logs, setLogs] = useState([])

  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((l) => [...l, { message, type, timestamp }])
  }, [])

  useEffect(() => {
    addLog('Welcome to Poker Game!')
    addLog('Enter your name and click "Join Game" to start playing.')

    socket.on('connect', () => addLog('Connected to server', 'success'))
    socket.on('disconnect', () => addLog('Disconnected from server', 'error'))

    socket.on('room_state', (state) => setGameState(state))
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
  }, [addLog])

  const joinGame = (name) => {
    if (!name || name.trim() === '') return addLog('Please enter your name', 'error')
    socket.emit('join', { name }, (response) => {
      if (response.ok) {
        setPlayerId(response.playerId)
        setPlayerName(response.playerName)
        addLog(`Joined as ${response.playerName}`, 'success')
      } else addLog(`Failed to join: ${response.error}`, 'error')
    })
  }

  const startHand = () => {
    socket.emit('start_hand', (r) => (r.ok ? addLog('New hand started', 'success') : addLog(`Failed to start hand: ${r.error}`, 'error')))
  }
  const resetGame = () => {
    socket.emit('reset_game', (r) => (r.ok ? addLog('Game reset', 'success') : addLog(`Failed to reset: ${r.error}`, 'error')))
  }
  const playerAction = (action, amount = 0) => {
    socket.emit('action', { action, amount }, (r) => (r.ok ? addLog(`You ${action}${amount ? ` $${amount}` : ''}`, 'success') : addLog(`Action failed: ${r.error}`, 'error')))
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-wide">🃏 Poker Game 🃏</h1>
      </header>

      <section className="bg-poker-table/90 backdrop-blur rounded-xl2 p-4 shadow-table">
        <Controls
          onJoin={joinGame}
          onStartHand={startHand}
          onReset={resetGame}
          playerName={playerName}
          onAction={playerAction}
          validActions={validActions}
          gameState={gameState}
        />
      </section>

      <GameInfo gameState={gameState} />

      <section className="bg-poker-table/90 backdrop-blur rounded-xl2 p-5 shadow-table">
        <Players
          players={gameState.players || []}
          currentPlayerSeat={gameState.currentPlayerSeat}
          dealerSeat={gameState.dealerSeat}
        />
        <CommunityCards community={gameState.community || []} />
      </section>

      <HoleCards holeCards={privateState.holeCards || []} />

      {gameState.showdown && (
        <section className="bg-yellow-200/15 text-yellow-50 p-4 rounded-lg shadow-soft">
          <h3 className="text-lg font-semibold">🏆 Showdown Results</h3>
          {gameState.showdown.winners && (
            <div className="mt-2">
              <strong>Winners:</strong>
              {gameState.showdown.winners.map((w, i) => (
                <div key={i}>🎉 {w.name} — {w.handName} {w.amount ? `(${w.amount})` : ''}</div>
              ))}
            </div>
          )}
          {gameState.showdown.ranks && (
            <div className="mt-2">
              <strong>All Hands:</strong>
              {gameState.showdown.ranks.map((r, i) => (
                <div key={i}>{r.name}: {r.handName}</div>
              ))}
            </div>
          )}
        </section>
      )}

      <Log logs={logs} />
    </div>
  )
}
