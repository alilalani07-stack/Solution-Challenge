import { useState, useEffect } from 'react'
import { subscribeToVolunteerTasks } from '../adapters/volunteerAdapter'

export function useVolunteerTasks(volunteerId) {
  const [tasks, setTasks] = useState([])
  const [pending, setPending] = useState([])
  const [active, setActive] = useState([])
  const [completed, setCompleted] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!volunteerId) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    const unsub = subscribeToVolunteerTasks(volunteerId, (data) => {
      setTasks(data || [])
      
      // Categorize tasks with flexible status matching
      const pendingTasks = (data || []).filter(t => {
        const status = t.status || t.match_status
        return status === 'pending' || status === 'open' || status === 'recommended'
      })
      
      const activeTasks = (data || []).filter(t => {
        const status = t.status || t.match_status
        return status === 'accepted' || status === 'active' || status === 'in_progress'
      })
      
      // ✅ FIXED: Include 'declined' and 'rejected' in completed filter
      const completedTasks = (data || []).filter(t => {
        const status = t.status || t.match_status
        return status === 'resolved' || 
               status === 'completed' || 
               status === 'closed' ||
               status === 'declined' ||        // ✅ Added for declined tasks
               status === 'rejected' ||        // ✅ Safety fallback
               t.match_status === 'resolved' ||
               t.match_status === 'completed' ||
               t.match_status === 'declined' || // ✅ Added for match_status variant
               t.match_status === 'rejected'
      })
      
      setPending(pendingTasks)
      setActive(activeTasks)
      setCompleted(completedTasks)
      setLoading(false)
    })
    
    return () => {
      if (unsub && typeof unsub === 'function') {
        unsub()
      }
    }
  }, [volunteerId])

  return { tasks, pending, active, completed, loading }
}