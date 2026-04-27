import { motion } from 'framer-motion'
import { AlertCircle, Clock } from 'lucide-react'
import Badge from '../ui/Badge'
import { timeAgo } from '../../utils/formatters'
import { getPriorityColor } from '../../utils/priorityScore'
import { T } from '../../styles/tokens'

export default function NeedReviewCard({ need, onSelect, selected }) {
  if (!need) return null

  const priorityColor = getPriorityColor(need.priority_score)
  const isEscalated = need.escalation_status === 'sla_exceeded'

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      style={{
        padding: '16px',
        borderRadius: T.radiusLg,
        border: `1px solid ${selected ? T.primary : isEscalated ? T.urgent : T.border}`,
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: selected ? `${T.primary}08` : isEscalated ? `${T.urgent}05` : T.white,
        boxShadow: selected ? T.shadowSm : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {selected && (
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: T.primary }} />
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontFamily: T.fontDisplay,
              fontSize: '14px',
              fontWeight: 800,
              backgroundColor: priorityColor.bg, 
              color: priorityColor.text,
              boxShadow: `inset 0 0 0 1px ${priorityColor.text}20`
            }}
          >
            {need.priority_score}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: T.textTertiary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</span>
            {isEscalated && (
              <span style={{ fontSize: '10px', fontWeight: 800, color: T.urgent, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={10} /> ESCALATED
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Badge value={need.urgency} />
          <p style={{ fontSize: '11px', color: T.textTertiary, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '4px' }}>
            <Clock size={10} /> {timeAgo(need.submitted_at)}
          </p>
        </div>
      </div>

      <h4 style={{ fontWeight: 700, fontSize: '14px', color: T.textPrimary, lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {need.summary}
      </h4>

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <Badge value={need.category} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', backgroundColor: T.surface2, borderRadius: T.radiusFull, fontSize: '10px', fontWeight: 600, color: T.textSecondary }}>
          <span style={{ color: T.textTertiary }}>Conf:</span> {Math.round(need.confidence * 100)}%
        </div>
      </div>
    </motion.div>
  )
}
