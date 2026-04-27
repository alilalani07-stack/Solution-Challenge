import { useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import { T } from '../../styles/tokens'

export default function LocationSearch({ value, onChange, error, placeholder = "Search for a location..." }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Mock location suggestions (in production, integrate with Google Places API or similar)
  const suggestions = [
    { label: 'Hyderabad, Telangana', coords: { lat: 17.3850, lng: 78.4867 } },
    { label: 'Bangalore, Karnataka', coords: { lat: 12.9716, lng: 77.5946 } },
    { label: 'Mumbai, Maharashtra', coords: { lat: 19.0760, lng: 72.8777 } },
    { label: 'Delhi', coords: { lat: 28.7041, lng: 77.1025 } },
    { label: 'Chennai, Tamil Nadu', coords: { lat: 13.0827, lng: 80.2707 } },
  ].filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSelect = (suggestion) => {
    onChange(suggestion)
    setSearchQuery('')
    setIsOpen(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: T.textSecondary, marginBottom: '8px' }}>
        Location
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
          color: T.textSecondary, pointerEvents: 'none'
        }}>
          <MapPin size={18} />
        </div>
        <input
          type="text"
          value={searchQuery || value || ''}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '12px 12px 12px 40px', borderRadius: T.radiusMd,
            border: `1px solid ${error ? T.danger : T.border}`, fontSize: '15px',
            outline: 'none', backgroundColor: T.surface
          }}
        />
        <div style={{
          position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
          color: T.textSecondary
        }}>
          <Search size={18} />
        </div>
      </div>
      
      {error && <p style={{ color: T.danger, fontSize: '12px', marginTop: '4px' }}>{error}</p>}

      {isOpen && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          backgroundColor: T.white, border: `1px solid ${T.border}`,
          borderRadius: T.radiusMd, marginTop: '4px', zIndex: 50,
          boxShadow: T.shadowLg, maxHeight: '200px', overflowY: 'auto'
        }}>
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(suggestion)}
              style={{
                width: '100%', padding: '10px 12px', textAlign: 'left',
                backgroundColor: 'transparent', border: 'none',
                cursor: 'pointer', fontSize: '14px', color: T.textPrimary,
                borderBottom: idx < suggestions.length - 1 ? `1px solid ${T.border}` : 'none'
              }}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}