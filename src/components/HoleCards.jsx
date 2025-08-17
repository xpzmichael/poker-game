import React from 'react'

export default function HoleCards({ holeCards }) {
  if (!holeCards?.length) return null
  return (
    <section className="bg-poker-table/90 backdrop-blur p-3 rounded-lg shadow-soft">
      <div className="text-lg">Your Cards: {holeCards.join(' ')}</div>
    </section>
  )
}
