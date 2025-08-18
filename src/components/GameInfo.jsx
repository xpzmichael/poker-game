import React from 'react'

export default function GameInfo({ gameState }) {
  const potText = () => {
    if (gameState.phase === 'waiting') {
      return 'Waiting for game to start...'
    }
    const pot = gameState.pot || 0
    let text = `Pot: $${pot}`
    if (gameState.sidePots?.length) {
      const sidePotTotal = gameState.sidePots.reduce((s, p) => s + p.amount, 0)
      text += ` (+ $${sidePotTotal} in side pots)`
    }
    text += ` | Current Bet: $${gameState.currentBet || 0}`
    return text
  }

  return (
    <section className="bg-poker-table/90 backdrop-blur p-4 rounded-xl2 shadow-soft">
      <div className="grid grid-cols-1 gap-6 items-center">
        <div className="font-bold text-center">
          <span className='text-white/80 text-base'>
            Phase:&nbsp;
          </span>
          <span className='text-poker-yellow text-lg'>
            {gameState.phase || 'waiting'}
          </span>
        </div>
        <div className="text-sm sm:text-base text-center">{potText()}</div>
        <div className="text-sm sm:text-base text-center">Blinds: $10 / $20</div>
      </div>
    </section>
  )
}
