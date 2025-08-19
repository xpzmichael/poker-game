import React from 'react'

export default function EndRoundNote({ }) {
  return (
    <section className="bg-white/20 backdrop-blur p-3 mt-10 rounded-xl2 shadow-soft flex flex-col items-center justify-center">
      <span className="text-sm sm:text-base md:text-lg text-center">
        Last round game has ended, currently displayed cards are for
        <span className="text-base sm:text-lg text-yellow-100"> LAST ROUND</span>
        <span >.</span>
      </span>
    </section>
  )
}
