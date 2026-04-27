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

        {/* ✅ NEW: ACTIVE STATE BLOCK */}
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

        {/* ✅ NEW: RESOLVED STATE BLOCK */}
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

      {/* Right side unchanged */}
      {/* (kept exactly as-is) */}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* ...rest of your code unchanged */}
      </div>
    </div>
  )
}