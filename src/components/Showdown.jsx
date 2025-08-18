import React from 'react'

export default function Showdown({ showdown }) {
  if (!showdown) return null

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
        <div className="mt-2">
          <strong>All Hands:</strong>
          {showdown.ranks.map((r, i) => (
            <div key={i}>
              {r.name}: {r.handName}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
