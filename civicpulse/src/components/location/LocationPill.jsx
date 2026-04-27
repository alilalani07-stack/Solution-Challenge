import { MapPin } from 'lucide-react'
import { T } from '../../styles/tokens'

export default function LocationPill({ location, style = {} }) {
  if (!location) return null

  return (
    <span style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '6px', 
      padding: '4px 10px', 
      backgroundColor: T.surface2, 
      borderRadius: T.radiusFull, 
      fontSize: '11px', 
      fontWeight: 700, 
      color: T.textSecondary,
      border: `1px solid ${T.border}50`,
      ...style 
    }}>
      <MapPin size={12} style={{ color: T.primary }} />
      <span style={{ 
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '180px'
      }}>{location}</span>
    </span>
  )
}
