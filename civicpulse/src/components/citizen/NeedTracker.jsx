import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, AlertCircle, Phone } from 'lucide-react'
import Timeline from '../ui/Timeline'
import Badge from '../ui/Badge'
import Card from '../ui/Card'
import { formatDate, timeAgo } from '../../utils/formatters'
import { getCategoryById } from '../../constants/categories'
import { getUrgencyById } from '../../constants/urgencyLevels'
import { T } from '../../styles/tokens'
import useIsMobile from '../../hooks/useIsMobile'

export default function NeedTracker({ need }) {
  const isMobile = useIsMobile(768)
  
  const steps = useMemo(() => {
    if (!need) return []

    const statusMap = {
      'pending_review': 1,
      'open': 1,
      'matched': 2,
      'active': 3,
      'resolved': 4
    }

    const currentStepIndex = statusMap[need.status] || 0

    return [
      {
        id: 'submitted',
        label: 'Request Submitted',
        description: 'We have received your details.',
        timestamp: formatDate(need.submitted_at),
        completed: true,
      },
      {
        id: 'review',
        label: 'Under Review & Processing',
        description: need.status === 'pending_review' ? 'Our AI is structuring your request.' : 'Approved and looking for volunteers.',
        timestamp: need.status !== 'pending_review' ? formatDate(need.updated_at) : null,
        completed: currentStepIndex > 1,
        current: currentStepIndex === 1,
      },
      {
        id: 'matched',
        label: 'Matched with Volunteer',
        description: need.assigned_volunteer_id ? 'A volunteer has been assigned to help you.' : 'Searching for nearby available volunteers...',
        timestamp: currentStepIndex >= 2 ? formatDate(need.updated_at) : null,
        completed: currentStepIndex > 2,
        current: currentStepIndex === 2,
      },
      {
        id: 'active',
        label: 'Help In Progress',
        description: 'Volunteer is working on your request.',
        timestamp: currentStepIndex >= 3 ? formatDate(need.updated_at) : null,
        completed: currentStepIndex > 3,
        current: currentStepIndex === 3,
      },
      {
        id: 'resolved',
        label: 'Resolved',
        description: need.resolution_notes || 'The request has been marked as completed.',
        timestamp: need.resolved_at ? formatDate(need.resolved_at) : null,
        completed: currentStepIndex === 4,
        current: currentStepIndex === 4,
      }
    ]
  }, [need])

  if (!need) return null

  const category = getCategoryById(need.category) || { label: 'General', color: T.primary, icon: '💡' }
  const urgency = getUrgencyById(need.urgency) || { label: 'Low', color: T.primary, bg: T.primaryLight }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: '32px' }}>
      
      {/* Left: Timeline */}
      <Card padding="32px">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '32px', paddingBottom: '24px', borderBottom: `1px solid ${T.border}` }}>
          <div>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Status Updates</h2>
            <p style={{ fontSize: '14px', color: T.textSecondary }}>
              Tracking ID: <span style={{ fontFamily: 'monospace', fontWeight: 500, color: T.textPrimary }}>{need.tracking_id}</span>
            </p>
          </div>
          <Badge variant="status" value={need.status} />
        </div>

        <Timeline steps={steps} style={{ marginLeft: '8px' }} />

        {/* ✅ ACTIVE STATE BLOCK (ADDED ONLY) */}
        {need.status === 'active' && (
          <div style={{
            marginTop: 20, padding: 20,
            borderRadius: 16, background: '#EFF6FF',
            border: '1px solid #93C5FD'
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1D4ED8', marginBottom: 6 }}>
              🤝 A volunteer is on their way
            </h3>
            <p style={{ fontSize: 13, color: '#1E40AF' }}>
              Your request has been accepted by a volunteer. They are currently working on it.
            </p>
          </div>
        )}

        {/* ✅ RESOLVED STATE BLOCK (ADDED ONLY) */}
        {need.status === 'resolved' && (
          <div style={{
            marginTop: 20,
            padding: 20,
            borderRadius: 16,
            background: '#F0FDF4',
            border: '1px solid #86EFAC'
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#15803D', marginBottom: 12 }}>
              ✓ Your request has been resolved
            </h3>
            {need.resolution_notes && (
              <p style={{ fontSize: 14, color: '#14532D', lineHeight: 1.6, marginBottom: 12 }}>
                {need.resolution_notes}
              </p>
            )}
            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#166534', fontWeight: 600 }}>
              {need.volunteers_helped && (
                <span>👥 {need.volunteers_helped} people helped</span>
              )}
              {need.verified && (
                <span>✓ Verified by coordinator</span>
              )}
              {!need.verified && (
                <span style={{ color: '#92400E' }}>⏳ Awaiting coordinator verification</span>
              )}
            </div>
          </div>
        )}

        {need.escalation_status && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: '32px', padding: '16px', backgroundColor: T.urgentLight, border: `1px solid rgba(255, 68, 68, 0.2)`, borderRadius: T.radiusLg, display: 'flex', alignItems: 'flex-start', gap: '12px' }}
          >
            <AlertCircle size={20} color={T.urgent} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: T.urgent }}>Elevated Priority</p>
              <p style={{ fontSize: '12px', color: 'rgba(255, 68, 68, 0.8)', marginTop: '4px' }}>
                This request has been escalated to our coordination team to ensure faster matching.
              </p>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Right: Details & Volunteer Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Card padding="20px">
          <h3 style={{ fontWeight: 700, fontSize: '14px', color: T.textSecondary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Request Details</h3>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: category.color ? category.color + '20' : T.primaryLight, color: category.color || T.primary }}>
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{category.icon}</span>
            </div>
            <div>
              <p style={{ fontWeight: 500, fontSize: '14px', color: T.textPrimary }}>{category.label}</p>
              <p style={{ fontSize: '12px', color: T.textTertiary }}>Category</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: urgency.bg, color: urgency.color }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
            </div>
            <div>
              <p style={{ fontWeight: 500, fontSize: '14px', color: T.textPrimary }}>{urgency.label}</p>
              <p style={{ fontSize: '12px', color: T.textTertiary }}>Urgency</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: T.surface3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textSecondary, flexShrink: 0 }}>
              <MapPin size={14} />
            </div>
            <div>
              <p style={{ fontWeight: 500, fontSize: '14px', color: T.textPrimary, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{need.location_hint}</p>
              <p style={{ fontSize: '12px', color: T.textTertiary }}>Location</p>
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${T.border}` }}>
            <p style={{ fontSize: '14px', color: T.textSecondary, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              "{need.raw_report}"
            </p>
            <p style={{ fontSize: '12px', color: T.textTertiary, marginTop: '8px' }}>
              Submitted {timeAgo(need.submitted_at)}
            </p>
          </div>
        </Card>

        {(need.status === 'matched' || need.status === 'active' || need.status === 'resolved') && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card padding="20px" style={{ backgroundColor: 'rgba(235, 240, 255, 0.3)', border: `1px solid rgba(0, 87, 255, 0.2)` }}>
              <h3 style={{ fontWeight: 700, fontSize: '14px', color: T.primary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                Assigned Volunteer
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.white, fontWeight: 700, boxShadow: T.shadowSm }}>
                  V
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: T.textPrimary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Volunteer <Badge variant="tier" value={need.match_tier || 1} />
                  </p>
                  <p style={{ fontSize: '12px', color: T.textSecondary }}>Verified Member</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, color: T.textSecondary, backgroundColor: T.surface, borderRadius: T.radiusMd, padding: '8px', border: `1px solid ${T.border}` }}>
                <Phone size={14} color={T.primary} />
                They will contact you soon
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}