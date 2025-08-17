import React from 'react'

export default function Players({ players, currentPlayerSeat, dealerSeat }) {
  if (!players || players.length === 0) {
    return <div className="text-center text-white/80">No players yet</div>
  }

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {players.map((p) => {
        const classes = [
          'min-w-[160px]',
          'text-center',
          'p-3',
          'rounded-lg',
          'bg-white/10',
          'shadow-soft',
          'backdrop-blur'
        ]
        const status = []
        if (p.seat === currentPlayerSeat) classes.push('border-2', 'border-poker-yellow')
        if (p.folded) classes.push('opacity-60')
        if (p.allIn) classes.push('ring-2', 'ring-orange-400')

        if (p.seat === dealerSeat) status.push('🔴 Dealer')
        if (p.folded) status.push('❌ Folded')
        if (p.allIn) status.push('⭐ All-in')
        if (p.seat === currentPlayerSeat) {status.push(<span className="swing-x text-amber-300">👈 Turn</span>)}


        return (
          <div key={p.seat} className={classes.join(' ')}>
            <div className="font-semibold">{p.name}</div>
            <div>Chips: ${p.chips}</div>
            <div>Bet: ${p.betThisRound}</div>
            <div className="text-sm text-white/80 mt-2 flex flex-col items-center gap-1">
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
