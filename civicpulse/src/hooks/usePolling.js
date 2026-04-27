import { useEffect, useRef } from 'react'

export function usePolling(callback, intervalMs = 30000, immediate = true) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (immediate) callbackRef.current()
    const interval = setInterval(() => callbackRef.current(), intervalMs)
    return () => clearInterval(interval)
  }, [intervalMs, immediate])
}