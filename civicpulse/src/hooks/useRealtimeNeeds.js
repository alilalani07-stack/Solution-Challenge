import { useState, useEffect } from 'react'
import { subscribeToNeeds } from '../adapters/needsAdapter'

export function useRealtimeNeeds(filters = []) {
  const [needs, setNeeds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const unsub = subscribeToNeeds(filters, (data) => {
      setNeeds(data)
      setLoading(false)
    })
    return () => unsub && unsub()
  }, [JSON.stringify(filters)])

  return { needs, loading }
}
