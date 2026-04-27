import { MapPin, Clock, Check } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { getCategoryById } from '../../constants/categories'
import { getUrgencyById } from '../../constants/urgencyLevels'
import { timeAgo } from '../../utils/formatters'
import MatchScoreBadge from './MatchScoreBadge'
import { T } from '../../styles/tokens'

export default function TaskCard({ task, onAccept, onDecline, onResolve, onView }) {
  if (!task || !task.need) return null

  const need = task.need
  const category = getCategoryById(need.category) || { label: 'General', color: T.primary, icon: '💡' }
  const urgency = getUrgencyById(need.urgency) || { label: 'Low', color: T.primary, bg: T.primaryLight }

  return (
    <Card 
      hoverable 
      padding="16px"
      onClick={() => onView?.(task)}
      style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: urgency.color }} />
      <div style={{ paddingLeft: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Badge variant="status" value={need.category} />
            {task.tier && <Badge variant="tier" value={task.tier} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MatchScoreBadge score={task.match_score} />
          </div>
        </div>

        <h3 style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '18px', marginBottom: '8px', color: T.textPrimary, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {need.summary}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', fontWeight: 500, color: T.textSecondary, marginTop: 'auto', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} color={T.primary} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{need.location_hint}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} color={T.textTertiary} />
            {timeAgo(need.submitted_at)}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
          {task.status === 'pending' && (
            <>
              <div style={{ flex: 1 }}><Button size="sm" fullWidth onClick={() => onAccept(task.id)}>Accept</Button></div>
              <div style={{ flex: 1 }}><Button size="sm" fullWidth variant="secondary" onClick={() => onDecline(task.id)}>Decline</Button></div>
            </>
          )}
          {task.status === 'accepted' && (
            <div style={{ flex: 1 }}><Button size="sm" fullWidth icon={Check} onClick={() => onResolve(task)} style={{ backgroundColor: T.success, color: T.white }}>Mark as Resolved</Button></div>
          )}
        </div>
      </div>
    </Card>
  )
}
