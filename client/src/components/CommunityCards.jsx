import React from 'react'
import PokerCard from './PokerCard'

export default function CommunityCards({ community }) {
  return (
    <div className="mt-6 text-center">
      <h3 className="text-lg font-semibold mb-3">Community Cards</h3>
      <div className="flex justify-center gap-3">
        {community?.length ? (
          community.map((card, i) => <PokerCard key={i} card={card} />)
        ) : (
          <div className="italic text-gray-400">(none)</div>
        )}
      </div>
    </div>
  )
}
