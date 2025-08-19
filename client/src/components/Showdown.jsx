import React from 'react'
import PokerCard from './PokerCard'

export default function Showdown({ showdown }) {
  if (!showdown) return null
  console.log(showdown)

  return (
    <section className="bg-yellow-200/15 text-yellow-50 p-4 rounded-lg shadow-soft">
      <h3 className="text-lg font-semibold">🏆 Showdown Results</h3>

      {showdown.winners && (
        <div className="mt-2">
          <strong>Winners:</strong>
          {showdown.winners.map((w, i) => (
            <div key={i}>
              🎉 {w.name} — {w.handName} {w.amount ? `(${w.amount})` : ''}
            </div>
          ))}
        </div>
      )}

      {showdown.ranks && (
        <div className="mt-2 space-y-3">
          <strong>All Hands:</strong>
          {showdown.ranks.map((r, i) => (
            <div key={i} className="mt-1">
              <div className="font-medium">
                {r.name}: {r.handName}
              </div>

              {r.cards && (
                <div className="flex gap-1 mt-1">
                  {r.cards.map((c, j) => (
                    <div key={j} className="scale-75 origin-top-left">
                      <PokerCard card={c} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
