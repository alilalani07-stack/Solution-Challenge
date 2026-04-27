import React from 'react'
import { T } from '../../styles/tokens'

export default function Badge({ variant = 'status', value }) {
  const getStyles = () => {
    switch (String(value).toLowerCase()) {
      // Status
      case 'pending_review': return { background: `${T.warning}15`, color: T.warning }
      case 'open': return { background: `${T.primary}15`, color: T.primary }
      case 'matched': return { background: '#F3F0FF', color: '#7C3AED' }
      case 'active': return { background: `${T.success}15`, color: T.success }
      case 'resolved': return { background: `${T.success}15`, color: T.success }
      
      // Urgency
      case 'low': return { background: `${T.primary}15`, color: T.primary }
      case 'urgent': return { background: `${T.warning}15`, color: T.warning }
      case 'critical': return { background: `${T.urgent}15`, color: T.urgent }
      
      // Tier
      case '1': return { background: `${T.warning}15`, color: T.warning }
      case '2': return { background: T.surface3, color: T.textSecondary }
      case '3': return { background: T.surface3, color: T.textTertiary }
      
      default: return { background: T.surface3, color: T.textSecondary }
    }
  }

  const isCritical = String(value).toLowerCase() === 'critical'
  const isPulsing = String(value).toLowerCase() === 'urgent' || isCritical

  return (
    <span
      className={isCritical ? 'pulse-ring' : ''}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 12px',
        borderRadius: T.radiusFull,
        fontSize: '11px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
        ...getStyles()
      }}
    >
      {isPulsing && (
        <span style={{ 
          width: '6px', 
          height: '6px', 
          borderRadius: '50%', 
          backgroundColor: 'currentColor',
          marginRight: '4px',
          animation: 'pulse 1.5s infinite' 
        }} />
      )}
      {variant === 'tier' ? `Tier ${value}` : String(value || '').replace('_', ' ')}
    </span>
  )
}
