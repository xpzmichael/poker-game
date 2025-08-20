import React from 'react'

const SUIT_SYMBOLS = {
    h: '♥',
    d: '♦',
    s: '♠',
    c: '♣',
}

const SUIT_COLORS = {
    h: 'text-red-500',
    d: 'text-red-500',
    s: 'text-black',
    c: 'text-black',
}

export default function PokerCard({ card }) {
    if (!card) return null

    let rank = card.slice(0, -1).toUpperCase()
    if (rank === 'T') rank = '10'
    const suit = card.slice(-1).toLowerCase()
    const symbol = SUIT_SYMBOLS[suit] || '?'
    const colorClass = SUIT_COLORS[suit] || 'text-black'

    return (
        <div className="w-14 h-20 md:w-24 md:h-32 bg-white rounded-lg shadow-md border border-gray-300 relative flex items-center justify-center">
            {/* Top-left rank */}
            <span className={`absolute top-1 left-1 text-sm md:text-lg font-bold ${colorClass}`}>
                {rank}
            </span>

            {/* Suit symbol centered */}
            <span className={`text-2xl md:text-4xl ${colorClass}`}>{symbol}</span>

            {/* Bottom-right rank */}
            <span className={`absolute bottom-1 right-1 text-sm md:text-lg font-bold ${colorClass}`}>
                {rank}
            </span>
        </div>
    )
}
