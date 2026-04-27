export default function MatchScoreBadge({ score, size = 'md' }) {
  const isHigh = score >= 85
  const isMedium = score >= 70
  
  const color = isHigh ? '#00C48C' : isMedium ? '#0057FF' : '#FF9500'
  const sizeStyles = size === 'sm' ? { width: '24px', height: '24px', fontSize: '9px' } : size === 'lg' ? { width: '48px', height: '48px', fontSize: '14px' } : { width: '32px', height: '32px', fontSize: '12px' }
  
  const circumference = 2 * Math.PI * 14
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: color, ...sizeStyles }}>
        <svg style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)', width: '100%', height: '100%' }} viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="3" style={{ opacity: 0.2 }} />
          <circle 
            cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="3" 
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
            style={{ transition: 'all 1s ease-out' }}
          />
        </svg>
        <span>{score}</span>
      </div>
      {size !== 'sm' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F1117', lineHeight: 1 }}>Match</span>
          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Score</span>
        </div>
      )}
    </div>
  )
}
