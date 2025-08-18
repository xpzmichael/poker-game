import React, { useState, useEffect } from 'react'

export default function Controls({ onJoin, onStartHand, onReset, playerName, onAction, onRemoveUnreadyPlayers, validActions, gameState }) {
  const [name, setName] = useState(playerName || '')
  const [betAmount, setBetAmount] = useState('')
  const [hasJoined, setHasJoined] = useState(false)

  useEffect(() => {
    if (playerName) setName(playerName)
  }, [playerName])

  useEffect(() => {
    if (gameState.players && gameState.players.find((p) => p.name === name)) {
      setHasJoined(true)
    } else {
      setHasJoined(false)
    }
  }, [gameState.players, name])

  const hasGameStarted = gameState.phase !== 'waiting'
  const isMyTurn =
    gameState.currentPlayerSeat != null &&
    gameState.players &&
    gameState.players.find((p) => p.name === name && p.seat === gameState.currentPlayerSeat)

  const can = (action) => hasGameStarted && validActions?.find((a) => a.action === action)

  const btnBase =
  'inline-flex items-center rounded-md px-2.5 py-2 text-xs sm:px-3 sm:py-2 sm:text-sm ' +
  'font-semibold shadow-soft transition cursor-pointer ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-poker-yellow/70 focus-visible:ring-offset-2 focus-visible:ring-offset-poker-green ';

  const btnGreen = `${btnBase} bg-green-500 hover:bg-green-600 active:bg-green-700`;
  const btnGray = `${btnBase} bg-white/10 hover:bg-white/15`;
  const btnAmber = `${btnBase} bg-amber-500/90 hover:bg-amber-500/75 active:bg-amber-600/90`;
  const btnRed = `${btnBase} bg-red-500/70 hover:bg-red-500/50 active:bg-red-400/70`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 min-h-[44px]">
        {hasJoined ? (
          <span className="flex flex-wrap items-baseline gap-2 px-3 py-2">
            <span className="text-sm sm:text-base text-white/80">Welcome</span>
            <span className="text-xl sm:text-2xlfont-mono font-bold text-white leading-tight">{name}</span>
            <span className="text-sm sm:text-base text-white/80">, enjoy the game!</span>
          </span>
        ) : (
          <>
            <input
              className="px-2.5 py-2 text-xs sm:px-3 sm:py-2 sm:text-sm rounded-md bg-white/10 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-poker-yellow/60"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className={btnGreen} onClick={() => onJoin(name)}>Join Game</button>
          </>
        )}
      </div>

      {!hasGameStarted && hasJoined && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {
              gameState.players && gameState.players.find((p) => p.name === name && p.ready) && 
              <>
                <button className={btnGreen} onClick={onStartHand}>Start Hand</button>
                <button className={btnRed} onClick={onRemoveUnreadyPlayers}>Clear Unready Players</button>
              </>
            }
            <button className={btnRed} onClick={onReset}>Reset Game</button>
          </div>
          <button className={btnAmber} onClick={() => onAction('ready')}>
            {gameState.players && gameState.players.find((p) => p.name === name && p.ready)
              ? 'I am Ready 👍'
              : 'Click to Ready'}
          </button>
        </>
      )}

      {hasGameStarted && isMyTurn && (
        <div className="pt-1">
          <h3 className="text-lg text-yellow-300/90">Your Turn — Available Actions:</h3>
          <div className="my-2 flex flex-wrap gap-2">
            {can('fold') && (
              <button className={btnGray} onClick={() => onAction('fold')}>
                Fold
              </button>
            )}
            {can('check') && <button className={btnGray} onClick={() => onAction('check')}>Check</button>}
            {can('call') && (
              <button className={btnGray} onClick={() => onAction('call', can('call').amount || 0)}>
                Call ${can('call').amount ?? 0}
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 my-2">
            {can('bet') && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="w-28 px-3 py-2 rounded-md bg-white/10 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-poker-yellow/60"
                  placeholder="Amount"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0"
                />
                <button
                  className={btnGray}
                  onClick={() => {
                    const amount = parseInt(betAmount, 10) || 0
                    if (amount <= 0) return alert('Please enter a valid amount')
                    onAction('bet', amount)
                    setBetAmount('')
                  }}
                >
                  Bet
                </button>
              </div>
            )}
            {can('raise') && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="w-28 px-3 py-2 rounded-md bg-white/10 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-poker-yellow/60"
                  placeholder="Amount"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0"
                />
                <button
                  className={btnGray}
                  onClick={() => {
                    const amount = parseInt(betAmount, 10) || 0
                    if (amount <= 0) return alert('Please enter a valid amount')
                  onAction('raise', amount)
                  setBetAmount('')
                }}
                >
                  Raise
                </button>
              </div>
            )}
          </div>
          <div className="text-xs text-white/70 mt-1 space-x-3">
            {validActions && validActions.length > 0 ? validActions.map((a, i) => {
              if (a.action === 'bet')   return <span key={i}>Bet: ${a.minAmount}–${a.maxAmount}</span>
              if (a.action === 'raise') return <span key={i}>Raise: ${a.minAmount}–${a.maxAmount} (+${a.callAmount} to call)</span>
              return null
            }) : <span>No available actions</span>}
          </div>
        </div>
      )}
    </div>
  )
}
