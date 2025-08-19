import React, { useRef, useEffect } from 'react'

export default function Log({ logs }) {
  const ref = useRef()
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [logs])

  return (
    <section ref={ref} className="bg-black/60 h-48 overflow-y-auto p-3 rounded-lg mt-4 text-sm shadow-soft">
      {logs.map((l, i) => (
        <div
          key={i}
          className={
            l.type === 'error'
              ? 'text-red-300 font-semibold'
              : l.type === 'success'
              ? 'text-green-300 font-semibold'
              : 'text-white/90'
          }
        >
          [{l.timestamp}] {l.message}
        </div>
      ))}
    </section>
  )
}
