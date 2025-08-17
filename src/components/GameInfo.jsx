import React from 'react'

export default function GameInfo({ gameState }) {
  const potText = () => {
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
      <div className="grid md:grid-cols-3 gap-3 items-center">
        <div className="text-poker-yellow font-bold text-lg">Phase: {gameState.phase || 'waiting'}</div>
        <div className="text-center">{potText()}</div>
        <div className="md:text-right">Blinds: $10 / $20</div>
      </div>
    </section>
  )
}
