import React, { useState, useEffect } from 'react'

export default function Controls({ onJoin, onStartHand, onReset, playerName, onAction, validActions, gameState }) {
  const [name, setName] = useState(playerName || '')
  const [betAmount, setBetAmount] = useState('')

  useEffect(() => {
    if (playerName) setName(playerName)
  }, [playerName])

  const isMyTurn =
    gameState.currentPlayerSeat != null &&
    gameState.players &&
    gameState.players.find((p) => p.name === name && p.seat === gameState.currentPlayerSeat)

  const can = (action) => validActions?.find((a) => a.action === action)

  const btnBase =
    'inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-soft transition cursor-pointer ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-poker-yellow/70 focus-visible:ring-offset-2 focus-visible:ring-offset-poker-green ';

const btnGreen = `${btnBase} bg-green-500 hover:bg-green-600 active:bg-green-700`;
const btnGray = `${btnBase} bg-white/10 hover:bg-white/15`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="px-3 py-2 rounded-md bg-white/10 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-poker-yellow/60"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!!playerName}
        />
        <button className={btnGreen} onClick={() => onJoin(name)}>Join Game</button>
        <button className={btnGreen} onClick={onStartHand}>Start Hand</button>
        <button className={btnGreen} onClick={onReset}>Reset Game</button>
      </div>

      <div style={{ display: isMyTurn ? 'block' : 'none' }} className="pt-1">
        <h3 className="text-sm text-white/90">Your Turn — Available Actions:</h3>

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
          <input
            type="number"
            className="w-28 px-3 py-2 rounded-md bg-white/10 text-white placeholder-white/70 outline-none focus:ring-2 focus:ring-poker-yellow/60"
            placeholder="Amount"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            min="0"
          />
          {can('bet') && (
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
          )}
          {can('raise') && (
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
    </div>
  )
}
