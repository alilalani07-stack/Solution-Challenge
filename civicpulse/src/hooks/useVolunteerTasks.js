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

      // match_status is the single source of truth for a volunteer's view of a task.
      // The adapter guarantees match_status is set correctly on every task object,
      // so we never fall back to the raw `status` field here (which reflects the
      // need's own lifecycle and would cause misrouting).

      const pendingTasks = (data || []).filter(t =>
        t.match_status === 'pending' ||
        t.match_status === 'open' ||
        t.match_status === 'recommended'
      )

      const activeTasks = (data || []).filter(t =>
        t.match_status === 'accepted' ||
        t.match_status === 'active' ||
        t.match_status === 'in_progress'
      )

      // Completed = any terminal state. under_review means the volunteer submitted
      // a resolution and is waiting for coordinator verification.
      const completedTasks = (data || []).filter(t =>
        t.match_status === 'under_review' ||
        t.match_status === 'resolved' ||
        t.match_status === 'completed' ||
        t.match_status === 'closed' ||
        t.match_status === 'declined' ||
        t.match_status === 'rejected'
      )

      setPending(pendingTasks)
      setActive(activeTasks)
      setCompleted(completedTasks)
      setLoading(false)
    })

    return () => {
      if (unsub && typeof unsub === 'function') unsub()
    }
  }, [volunteerId])

  return { tasks, pending, active, completed, loading }
}