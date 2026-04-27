import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { T } from '../../styles/tokens'

export default function StatCard({ icon: Icon, label, value, color, trend, trendLabel }) {
  const getRgba = (hex, alpha) => {
    if (!hex || typeof hex !== 'string') return `rgba(0, 0, 0, ${alpha})`;
    if (!hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const primaryColor = color || T.primary

  return (
    <div style={{
      background: T.white,
      borderRadius: T.radiusLg,
      border: `1px solid ${T.border}`,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'default'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: getRgba(primaryColor, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: primaryColor,
          boxShadow: `inset 0 0 0 1px ${getRgba(primaryColor, 0.1)}`
        }}>
          {Icon && <Icon size={22} />}
        </div>
        
        {trend !== undefined && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            padding: '4px 8px', 
            borderRadius: '999px', 
            fontSize: '12px', 
            fontWeight: 700,
            backgroundColor: trend >= 0 ? `${T.success}15` : `${T.urgent}15`,
            color: trend >= 0 ? T.success : T.urgent
          }}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '32px', fontWeight: 800, color: T.textPrimary, fontFamily: T.fontDisplay, letterSpacing: '-0.02em' }}>
          {value.toLocaleString()}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: T.textSecondary }}>
            {label}
          </span>
          {trendLabel && (
            <span style={{ fontSize: '11px', color: T.textTertiary, marginTop: '2px' }}>
              {trendLabel}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
