import { useState, useEffect, useRef, useCallback } from 'react'
import { searchLocations } from '../services/geocodingService'

export function useLocationSearch(debounceMs = 300) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (query.length < 3) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      try {
        const data = await searchLocations(query)
        setResults(data)
        setLoading(false)
      } catch (err) {
        setError('Location search unavailable — enter manually')
        setResults([])
        setLoading(false)
      }
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query, debounceMs])

  const clear = useCallback(() => {
    setQuery('')
    setResults([])
    setError(null)
  }, [])

  return { query, setQuery, results, loading, error, clear }
}
