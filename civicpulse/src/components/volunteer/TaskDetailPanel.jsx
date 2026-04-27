import { motion } from 'framer-motion'
import { MapPin, Phone, Users, Clock, Info, Check, X } from 'lucide-react'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import MatchScoreBadge from './MatchScoreBadge'
import MapPreview from '../location/MapPreview'
import { getCategoryById } from '../../constants/categories'
import { getUrgencyById } from '../../constants/urgencyLevels'
import { formatDateTime } from '../../utils/formatters'
import { T } from '../../styles/tokens'

export default function TaskDetailPanel({ task, onAccept, onDecline, onResolve }) {
  if (!task || !task.need) return null

  const need = task.need
  const category = getCategoryById(need.category) || { label: 'General', color: T.primary, icon: '💡' }
  const urgency = getUrgencyById(need.urgency) || { label: 'Low', color: T.primary, bg: T.primaryLight }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: T.surface }}>
      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Badge variant="status" value={need.category} />
            <Badge variant="urgency" value={need.urgency} />
            <Badge variant="tier" value={task.tier || 1} />
          </div>
          <MatchScoreBadge score={task.match_score} />
        </div>

        <h2 style={{ fontFamily: T.fontDisplay, fontSize: '24px', fontWeight: 700, marginBottom: '16px', lineHeight: 1.2 }}>{need.summary}</h2>

        <div style={{ backgroundColor: T.surface2, padding: '16px', borderRadius: T.radiusMd, border: `1px solid ${T.border}`, marginBottom: '24px', fontSize: '14px', color: T.textSecondary, fontStyle: 'italic' }}>
          "{need.raw_report}"
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: T.surface3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textSecondary }}>
              <Users size={14} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: T.textTertiary }}>People</p>
              <p style={{ fontWeight: 600, fontSize: '14px' }}>{need.quantity} needed help</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: T.surface3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textSecondary }}>
              <Clock size={14} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: T.textTertiary }}>Submitted</p>
              <p style={{ fontWeight: 600, fontSize: '14px' }}>{formatDateTime(need.submitted_at)}</p>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '14px', color: T.textSecondary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} /> Location
          </h3>
          <div style={{ backgroundColor: T.surface, borderRadius: T.radiusMd, border: `1px solid ${T.border}`, padding: '12px', marginBottom: '12px', fontSize: '14px', fontWeight: 500 }}>
            {need.location_hint}
          </div>
          {need.location_coords && (
            <MapPreview lat={need.location_coords.lat} lng={need.location_coords.lng} height="160px" />
          )}
        </div>

        {task.status === 'accepted' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
             <h3 style={{ fontWeight: 700, fontSize: '14px', color: T.primary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={16} /> Citizen Contact
            </h3>
            <div style={{ backgroundColor: T.primaryLight, border: `1px solid rgba(0,87,255,0.2)`, borderRadius: T.radiusMd, padding: '16px' }}>
              {need.contact_phone ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: T.primary, color: T.white, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '18px' }}>{need.contact_phone}</p>
                    <p style={{ fontSize: '12px', color: T.primary }}>Call to coordinate</p>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '14px', fontWeight: 500, color: T.textSecondary }}>
                  No contact number provided. Please proceed to the location.
                </p>
              )}
            </div>
          </motion.div>
        )}

      </div>

      <div style={{ padding: '16px', borderTop: `1px solid ${T.border}`, backgroundColor: T.surface, boxShadow: '0 -4px 16px rgba(0,0,0,0.02)' }}>
        {task.status === 'pending' && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}><Button fullWidth variant="secondary" onClick={() => onDecline(task.id)} icon={X}>Decline</Button></div>
            <div style={{ flex: 1 }}><Button fullWidth onClick={() => onAccept(task.id)} icon={Check}>Accept Task</Button></div>
          </div>
        )}
        {task.status === 'accepted' && (
          <Button fullWidth size="lg" onClick={() => onResolve(task)} icon={Check} style={{ backgroundColor: T.success, color: T.white }}>
            Submit Resolution
          </Button>
        )}
        {task.status === 'resolved' && (
          <Button fullWidth variant="secondary" disabled>
            Task Completed
          </Button>
        )}
      </div>
    </div>
  )
}
