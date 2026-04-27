import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { isFirebaseConfigured } from '../firebase/config'

const SessionContext = createContext(null)

const STORAGE_KEY = 'civicpulse_session'

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(session) {
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function SessionProvider({ children }) {
  const [session, setSessionState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDemoMode] = useState(!isFirebaseConfigured)

  // Re-hydrate session on mount
  useEffect(() => {
    const saved = loadSession()
    if (saved) {
      setSessionState(saved)
    }
    // Slight delay to simulate/handle initialization
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const setSession = useCallback((data) => {
    setSessionState(data)
    saveSession(data)
  }, [])

  const clearSession = useCallback(() => {
    setSessionState(null)
    saveSession(null)
  }, [])

  const value = useMemo(() => ({
    session,
    setSession,
    clearSession,
    isDemoMode,
    loading,
    isAuthenticated: !!session,
    role: session?.role || null,
    user: session?.user || null,
  }), [session, setSession, clearSession, isDemoMode, loading])

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSessionContext() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSessionContext must be used within SessionProvider')
  return ctx
}
