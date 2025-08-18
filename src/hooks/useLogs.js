import { useState, useCallback } from 'react'

export default function useLogs() {
  const [logs, setLogs] = useState([])

  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((l) => [...l, { message, type, timestamp }])
  }, [])

  return { logs, addLog }
}
