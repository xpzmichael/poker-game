import React from 'react'

export default function Players({ player_name, players, currentPlayerSeat, dealerSeat, phase }) {
  if (!players || players.length === 0) {
    return <div className="text-center text-white/80">No players yet</div>
  }

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {players.map((p) => {
        const classes = [
          'min-w-[120px]',
          'text-center',
          'p-3',
          'rounded-lg',
          'bg-white/10',
          'shadow-soft',
          'backdrop-blur'
        ]

        const status = []
        if (p.name === player_name) classes.push('border-1', 'border-poker-yellow')
        if (p.folded) classes.push('opacity-60')
        if (p.allIn) classes.push('ring-3', 'text-amber-300')

        if (phase === 'waiting') {
          if (p.ready) status.push('👍 Ready')
        } else {
          if (p.seat === dealerSeat) status.push('🔴 Dealer')
          if (p.folded) status.push('❌ Folded')
          if (p.allIn) status.push('⭐ All-in')
          if (p.seat === currentPlayerSeat) {status.push(<span className="swing-x text-amber-300">👈 Turn</span>)}
        }

        return (
          <div key={`${p.seat}-${phase}-${currentPlayerSeat}`} className={classes.join(' ')}>
            <div className="text-base font-semibold">{p.name}</div>
            {p.name === player_name && <div className="text-xs sm:text-sm text-white/80"> (👤 You)</div>}
            <div className="text-sm sm:text-base text-white">Chips: ${p.chips}</div>
            <div className="text-sm sm:text-base text-white">Bet: ${p.betThisRound}</div>
            <div className="text-xs sm:text-sm text-white mt-2 flex flex-col items-center gap-1">
              {status.map((s, i) => (
                <div key={i}>{s}</div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
