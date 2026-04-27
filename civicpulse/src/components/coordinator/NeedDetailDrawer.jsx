import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Clock, ShieldAlert, FileText } from 'lucide-react'
import Badge from '../ui/Badge'
import MapPreview from '../location/MapPreview'
import ProgressBar from '../ui/ProgressBar'
import { formatDateTime } from '../../utils/formatters'
import { getPriorityColor } from '../../utils/priorityScore'
import { T } from '../../styles/tokens'

export default function NeedDetailDrawer({ need, isOpen, onClose, children, isStaticPage = false }) {
  if (!need) return null

  const priorityColor = getPriorityColor(need.priority_score)

  const content = (
    <div style={{ position: 'relative', width: '100%', backgroundColor: T.surface, height: '100%', boxShadow: isStaticPage ? 'none' : T.shadowLg, borderLeft: isStaticPage ? 'none' : `1px solid ${T.border}`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: `1px solid ${T.border}`, backgroundColor: T.surface, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Badge type="status" value={need.status} />
          <span style={{ fontSize: '14px', fontFamily: 'monospace', color: T.textTertiary }}>{need.tracking_id}</span>
        </div>
        {!isStaticPage && (
          <button 
            onClick={onClose}
            style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer', transition: 'background-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = T.surface2}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {need.escalation_status && (
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: `${T.urgent}10`, border: `1px solid ${T.urgent}20`, borderRadius: T.radiusMd, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <ShieldAlert size={20} color={T.urgent} style={{ marginTop: '2px' }} />
            <div>
              <h4 style={{ fontWeight: 800, color: T.urgent, fontSize: '14px', margin: 0 }}>Escalated Request</h4>
              <p style={{ fontSize: '12px', color: T.urgent, opacity: 0.8, marginTop: '4px', margin: 0 }}>This request requires immediate coordinator intervention.</p>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: '24px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>{need.summary}</h2>
          <div style={{ backgroundColor: T.surface2, border: `1px solid ${T.border}`, padding: '16px', borderRadius: T.radiusMd, fontFamily: 'monospace', fontSize: '14px', color: T.textPrimary, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {need.raw_report}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, padding: '16px', borderRadius: T.radiusLg, boxShadow: T.shadowSm }}>
            <p style={{ fontSize: '11px', fontWeight: 800, color: T.textTertiary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Priority Score</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontFamily: T.fontDisplay, fontSize: '32px', fontWeight: 800, lineHeight: 1, color: priorityColor.text }}>
                {need.priority_score}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: T.textTertiary }}>/ 100</span>
            </div>
            <ProgressBar value={need.priority_score} max={100} color={priorityColor.text} />
          </div>
          
          <div style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, padding: '16px', borderRadius: T.radiusLg, boxShadow: T.shadowSm }}>
            <p style={{ fontSize: '11px', fontWeight: 800, color: T.textTertiary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>AI Confidence</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontFamily: T.fontDisplay, fontSize: '32px', fontWeight: 800, lineHeight: 1, color: T.textPrimary }}>
                {Math.round(need.confidence * 100)}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: T.textTertiary }}>%</span>
            </div>
            <ProgressBar value={Math.round(need.confidence * 100)} max={100} color={T.primary} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '12px', fontWeight: 800, color: T.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} /> Timeline
            </h3>
            <div style={{ backgroundColor: T.surface2, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, overflow: 'hidden', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: `1px solid ${T.border}` }}>
                <span style={{ color: T.textSecondary }}>Reported</span>
                <span style={{ fontWeight: 700 }}>{formatDateTime(need.submitted_at)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px' }}>
                <span style={{ color: T.textSecondary }}>Last Update</span>
                <span style={{ fontWeight: 700 }}>{formatDateTime(need.updated_at)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '12px', fontWeight: 800, color: T.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} /> Incident Location
            </h3>
            <div style={{ backgroundColor: T.surface2, borderRadius: T.radiusLg, border: `1px solid ${T.border}`, padding: '12px', marginBottom: '12px', fontSize: '14px', fontWeight: 600 }}>
              {need.location_hint}
            </div>
            {need.location_coords && (
              <div style={{ height: '220px', borderRadius: T.radiusLg, overflow: 'hidden', border: `1px solid ${T.border}` }}>
                <MapPreview lat={need.location_coords.lat} lng={need.location_coords.lng} height="100%" />
              </div>
            )}
          </div>
        </div>

        {children && (
          <div style={{ paddingTop: '24px', borderTop: `2px dashed ${T.border}` }}>
            {children}
          </div>
        )}
      </div>
    </div>
  )

  if (isStaticPage) return content

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', cursor: 'pointer' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ position: 'relative', width: '100%', maxWidth: '600px', height: '100%', boxShadow: T.shadowLg }}
          >
            {content}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
