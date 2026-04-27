import { useState, useEffect } from 'react'
import { subscribeToCollection } from '../services/firestoreService'
import { isFirebaseConfigured } from '../firebase/config'
import { mockStore } from '../store/mockStore'

export function useRealtimeVolunteers() {
  const [volunteers, setVolunteers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    if (!isFirebaseConfigured) {
      // For demo, we assume volunteers are mostly static but we can still listen
      const unsub = mockStore.subscribe(() => {
        setVolunteers(mockStore.volunteers)
        setLoading(false)
      })
      return unsub
    }
    
    const unsub = subscribeToCollection('volunteers', [], (data) => {
      setVolunteers(data)
      setLoading(false)
    })
    return () => unsub && unsub()
  }, [])

  return { volunteers, loading }
}
