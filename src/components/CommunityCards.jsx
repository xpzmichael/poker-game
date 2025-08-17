import React from 'react'

export default function CommunityCards({ community }) {
  return (
    <div className="mt-6 text-center text-xl p-4 bg-black/30 rounded-lg">
      Community Cards: {community?.length ? community.join(' ') : '(none)'}
    </div>
  )
}
