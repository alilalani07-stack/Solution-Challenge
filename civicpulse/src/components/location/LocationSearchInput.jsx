import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, X, Loader2 } from 'lucide-react'
import { useLocationSearch } from '../../hooks/useLocationSearch'
import { T } from '../../styles/tokens'

export default function LocationSearchInput({ onSelect, placeholder = 'Search for a location...', className = '' }) {
  const { query, setQuery, results, loading, error, clear } = useLocationSearch(300)
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (results.length > 0 || error) setShowDropdown(true)
  }, [results, error])

  const handleSelect = useCallback((item) => {
    setQuery(item.shortName || item.displayName)
    setShowDropdown(false)
    onSelect?.({
      displayName: item.displayName,
      shortName: item.shortName,
      lat: item.lat,
      lng: item.lng,
    })
  }, [onSelect, setQuery])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && highlightIndex >= 0 && results[highlightIndex]) {
      e.preventDefault()
      handleSelect(results[highlightIndex])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }, [highlightIndex, results, handleSelect])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <Search 
          size={18} 
          style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: T.textTertiary, pointerEvents: 'none' }} 
        />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setHighlightIndex(-1) }}
          onFocus={() => { if (results.length > 0) setShowDropdown(true) }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px 40px 12px 40px',
            backgroundColor: T.white,
            border: `1.5px solid ${T.border}`,
            borderRadius: T.radiusMd,
            fontSize: '14px',
            fontFamily: '"DM Sans", sans-serif',
            color: T.textPrimary,
            outline: 'none',
            transition: '0.15s ease-in-out',
            boxShadow: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = T.primary
            e.target.style.boxShadow = `0 0 0 4px ${T.primary}10`
          }}
          onBlur={(e) => {
            e.target.style.borderColor = T.border
            e.target.style.boxShadow = 'none'
          }}
        />
        
        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {loading && (
            <Loader2 size={16} style={{ color: T.primary, animation: 'spin 1s linear infinite' }} />
          )}
          {query && !loading && (
            <button
              onClick={() => { clear(); setShowDropdown(false) }}
              style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: T.textTertiary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDropdown && (results.length > 0 || error) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            style={{
              position: 'absolute',
              zIndex: 50,
              width: '100%',
              marginTop: '8px',
              backgroundColor: T.white,
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusLg,
              boxShadow: T.shadowLg,
              maxHeight: '280px',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            {error ? (
              <div style={{ padding: '16px', fontSize: '13px', color: T.urgent, backgroundColor: `${T.urgent}05` }}>{error}</div>
            ) : (
              results.map((item, idx) => (
                <button
                  key={item.placeId || idx}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    border: 'none',
                    background: idx === highlightIndex ? T.surface2 : T.white,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                    borderBottom: idx !== results.length - 1 ? `1px solid ${T.border}50` : 'none'
                  }}
                >
                  <MapPin size={16} style={{ color: T.primary, marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: T.textPrimary, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.shortName}</p>
                    <p style={{ fontSize: '12px', color: T.textSecondary, margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.displayName}</p>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
