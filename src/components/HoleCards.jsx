import React from 'react'
import PokerCard from './PokerCard'

export default function HoleCards({ holeCards }) {
  if (!holeCards?.length) return null

  return (
    <section className="bg-poker-table/90 backdrop-blur p-3 rounded-lg shadow-soft flex flex-col items-center justify-center">
      <h3 className="text-lg mb-2 text-center">Your Cards</h3>
      <div className="flex gap-3 justify-center items-center">
        {holeCards.map((card, i) => (
          <PokerCard key={i} card={card} />
        ))}
      </div>
    </section>
  )
}
