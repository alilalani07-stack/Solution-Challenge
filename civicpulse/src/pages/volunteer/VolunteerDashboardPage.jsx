import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayCircle, CheckCircle2, Zap, MapPin, Star } from 'lucide-react'
import MapPreview from '../../components/location/MapPreview'

import PageTransition from '../../components/layout/PageTransition'
import Tabs from '../../components/ui/Tabs'
import StatCard from '../../components/ui/StatCard'
import EmptyState from '../../components/ui/EmptyState'
import ResolutionForm from '../../components/volunteer/ResolutionForm'
import Modal from '../../components/ui/Modal'

import { useSession } from '../../hooks/useSession'
import { useVolunteerTasks } from '../../hooks/useVolunteerTasks'
import {
  acceptTask,
  declineTask,
  submitResolution,
  setVolunteerAvailability,
} from '../../adapters/volunteerAdapter'

import { showSuccess, showError } from '../../components/ui/Toast'
import { T } from '../../styles/tokens'
import useIsMobile from '../../hooks/useIsMobile'

// ── Coord normaliser ──────────────────────────────────────────────────────────
function normalizeCoords(task) {
  if (!task) return null
  // ✅ Check all possible coordinate field names
  const c = task.coords || task.location_coords || task.locationCoords || task.geo || null
  if (!c) return null
  if (Array.isArray(c) && c.length >= 2) return { lat: Number(c[0]), lng: Number(c[1]) }
  if (typeof c === 'string') {
    const parts = c.split(',').map(n => parseFloat(n.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return { lat: parts[0], lng: parts[1] }
    // Extract from "(lat, lng)" format
    const match = c.match(/\(([-\d.]+),\s*([-\d.]+)\)/)
    if (match) {
      const lat = parseFloat(match[1])
      const lng = parseFloat(match[2])
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
    }
  }
  if (c && typeof c === 'object' && c.lat != null && c.lng != null) return { lat: Number(c.lat), lng: Number(c.lng) }
  return null
}

// ── Derived state helper ──────────────────────────────────────────────────────
function getState(task) {
  const s = task.match_status || task.status || ''
  if (['resolved', 'completed', 'closed', 'declined', 'rejected', 'under_review'].includes(s)) return 'completed'
  if (['active', 'accepted', 'in_progress'].includes(s)) return 'active'
  return 'pending'
}

function getUrgencyStyle(urgency) {
  const u = typeof urgency === 'number' ? urgency : 5
  if (u >= 8) return { bg: '#FEE2E2', color: '#DC2626', label: 'CRITICAL' }
  if (u >= 6) return { bg: '#FEF3C7', color: '#D97706', label: 'HIGH' }
  return { bg: '#D1FAE5', color: '#059669', label: 'LOW' }
}

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusTag({ status, verified }) {  // ✅ Added verified prop
  const STYLES = {
    pending: { label: 'Pending', bg: '#EFF6FF', color: '#3B82F6' },
    open: { label: 'Open', bg: '#EFF6FF', color: '#3B82F6' },
    recommended: { label: 'Recommended', bg: '#EFF6FF', color: '#3B82F6' },
    accepted: { label: 'Active', bg: '#D1FAE5', color: '#059669' },
    active: { label: 'Active', bg: '#D1FAE5', color: '#059669' },
    in_progress: { label: 'Active', bg: '#D1FAE5', color: '#059669' },
    resolved: { label: 'Resolved', bg: '#D1FAE5', color: '#059669' },
    completed: { label: 'Completed', bg: '#D1FAE5', color: '#059669' },
    // ✅ Updated: Show "Verified" when resolved + verified
    under_review: { 
      label: verified ? 'Verified' : 'Under Review', 
      bg: verified ? '#D1FAE5' : '#FEF3C7', 
      color: verified ? '#059669' : '#D97706' 
    },
    declined: { label: 'Declined', bg: '#FEE2E2', color: '#DC2626' },
    rejected: { label: 'Rejected', bg: '#FEE2E2', color: '#DC2626' },
    closed: { label: 'Closed', bg: '#F3F4F6', color: '#6B7280' },
  }
  const cfg = STYLES[status] || { label: status || 'Unknown', bg: '#F3F4F6', color: '#6B7280' }
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 100, fontSize: 11,
      fontWeight: 700, background: cfg.bg, color: cfg.color,
      textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0,
    }}>
      {cfg.label}
    </span>
  )
}

// ── Task card ───────────────────────────────────────────────────────────────
function TaskCard({ task, onAccept, onDecline, onResolve }) {
  const state = getState(task)
  const urgency = getUrgencyStyle(task.urgency)
  const status = task.match_status || task.status || 'pending'

  return (
    <div style={{
      background: T.white, borderRadius: 18, padding: 20,
      border: `1px solid ${T.border}`, boxShadow: T.shadowSm,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
        <h4 style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, flex: 1, margin: 0 }}>
          {task.title || task.summary || 'Volunteer Task'}
        </h4>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: urgency.bg, color: urgency.color }}>
            {urgency.label}
          </span>
          <StatusTag status={status} verified={task.verified} /> 
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 12, lineHeight: 1.5, margin: '0 0 12px 0' }}>
        {task.description || task.raw_report || 'No description available'}
      </p>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 10, fontSize: 12, color: T.textTertiary, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={12} />
          {task.location || task.location_hint || 'Unknown location'}
        </span>
        {task.category && (
          <span style={{ background: T.surface2, padding: '2px 8px', borderRadius: 6, textTransform: 'capitalize' }}>
            {task.category}
          </span>
        )}
      </div>

      {/* Actions */}
{state === 'pending' && (
  <div style={{ display: 'flex', gap: 10 }}>
    <button
      onClick={(e) => { e.stopPropagation(); onAccept(task) }}  // ✅ Added e.stopPropagation()
      style={{ flex: 1, padding: '11px 16px', background: T.primary, color: '#fff', border: 0, borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
    >
      Accept
    </button>
    <button
      onClick={(e) => { e.stopPropagation(); onDecline(task) }}  // ✅ Added e.stopPropagation()
      style={{ flex: 1, padding: '11px 16px', background: T.surface2, color: T.textSecondary, border: 0, borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
    >
      Decline
    </button>
  </div>
)}

{state === 'active' && (
  <button
    onClick={(e) => { e.stopPropagation(); onResolve(task) }}  // ✅ Added e.stopPropagation()
    style={{ width: '100%', padding: '11px 16px', background: T.success, color: '#fff', border: 0, borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
  >
    ✓ Mark as Resolved
  </button>
)}

      {state === 'completed' && (
  <div style={{
    padding: '10px 16px', borderRadius: 12, textAlign: 'center', fontWeight: 700, fontSize: 13,
    // ✅ Updated: Check verified field for resolved tasks
    background: (status === 'declined' || status === 'rejected') ? '#FEE2E2' 
              : (status === 'under_review' && !task.verified) ? '#FEF3C7' 
              : '#D1FAE5',
    color: (status === 'declined' || status === 'rejected') ? '#DC2626' 
          : (status === 'under_review' && !task.verified) ? '#D97706'  
          : '#059669',
  }}>
    {status === 'declined' || status === 'rejected'
      ? '✕ Task Declined'
      : status === 'under_review' && !task.verified  // ✅ Check verified field
      ? '⏳ Pending Verification'
      : '✓ Verified & Closed'}
  </div>
)}
    </div>
  )
}

// ── Map panel (right column, desktop only) ────────────────────────────────────
function TaskMapPanel({ task }) {
  // ✅ Universal coordinate extractor — works for ALL task states
  const getCoords = (t) => {
    if (!t) return null
    
    // Try every possible coordinate field name in order of likelihood
    const candidates = [
      t.coords,
      t.location_coords,
      t.locationCoords,
      t.geo,
      t.coordinates,
      t.latlng,
      t.lat_lng,
      t.position,
      // Fallback: parse from location_hint if it contains coords
      t.location_hint,
      t.location,
      t.raw_location
    ]
    
    for (const c of candidates) {
      if (!c) continue
      
      // Array format: [lat, lng]
      if (Array.isArray(c) && c.length >= 2) {
        const lat = Number(c[0]), lng = Number(c[1])
        if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
      }
      
      // String format: "lat, lng" or "(lat, lng)" or "Place (lat, lng)"
      if (typeof c === 'string') {
        // Extract from parentheses: "Place (17.385, 78.4867)"
        const parenMatch = c.match(/\(([-\d.]+),\s*([-\d.]+)\)/)
        if (parenMatch) {
          const lat = parseFloat(parenMatch[1]), lng = parseFloat(parenMatch[2])
          if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
        }
        // Extract from plain CSV: "17.385, 78.4867"
        const csvMatch = c.match(/^([-\d.]+),\s*([-\d.]+)$/)
        if (csvMatch) {
          const lat = parseFloat(csvMatch[1]), lng = parseFloat(csvMatch[2])
          if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
        }
      }
      
      // Object format: { lat: ..., lng: ... }
      if (c && typeof c === 'object' && c.lat != null && c.lng != null) {
        const lat = Number(c.lat), lng = Number(c.lng)
        if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
      }
    }
    
    return null
  }

  const coords = getCoords(task)
  const center = coords || { lat: 17.385, lng: 78.4867 } // fallback: Hyderabad

  return (
    <div style={{
      background: T.white, borderRadius: 18, padding: 16,
      border: `1px solid ${T.border}`, boxShadow: T.shadowSm,
    }}>
      <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14, color: T.textPrimary }}>
        {task ? `📍 ${task.title || task.summary || 'Task Location'}` : 'Location Preview'}
      </div>
      <div style={{ borderRadius: 14, overflow: 'hidden', height: 220 }}>
        <MapPreview
          lat={center.lat}
          lng={center.lng}
          zoom={coords ? 15 : 11}
          showSingleMarker={!!coords}  // ✅ Show pin whenever we have valid coords
          singleMarkerColor="#ef4444"
          height="220px"
        />
      </div>
      {task?.location || task?.location_hint ? (
        <p style={{ fontSize: 12, color: T.textSecondary, marginTop: 8, marginBottom: 0 }}>
          {task.location || task.location_hint}
        </p>
      ) : null}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function VolunteerDashboardPage() {
  const { user, setSession } = useSession()
  const navigate = useNavigate()
  const isMobile = useIsMobile(1024)
  const { pending, active, completed, loading } = useVolunteerTasks(user?.uid)

  const [activeTab, setActiveTab] = useState('pending')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showResolution, setShowResolution] = useState(false)
  const [isAvailable, setIsAvailable] = useState(user?.availability ?? true)
  const [availLoading, setAvailLoading] = useState(false)

  const currentList = activeTab === 'pending' ? pending : activeTab === 'active' ? active : completed
  const mapTask = selectedTask || currentList[0] || null

  const handleToggleAvailability = useCallback(async (val) => {
    if (val === isAvailable || availLoading) return
    setAvailLoading(true)
    try {
      await setVolunteerAvailability(user?.uid, val)
      setIsAvailable(val)
      setSession({ role: 'volunteer', user: { ...user, availability: val } })
      showSuccess(val ? 'You are now available for tasks' : 'You are set as Away')
    } catch {
      showError('Failed to update availability')
    } finally {
      setAvailLoading(false)
    }
  }, [isAvailable, availLoading, user, setSession])

  const handleAccept = useCallback(async (task) => {
    try {
      const isMatch = !task.is_recommendation
      await acceptTask(task.id, user?.uid, isMatch)
      showSuccess('Task accepted!')
      setSelectedTask(null)
      setActiveTab('active')
    } catch (err) {
      showError('Failed to accept task: ' + (err?.message || ''))
    }
  }, [user?.uid])

  const handleDecline = useCallback(async (task) => {
    try {
      const isMatch = !task.is_recommendation
      await declineTask(task.id, user?.uid, isMatch)
      showSuccess('Task declined')
      setSelectedTask(null)
    } catch {
      showError('Failed to decline task')
    }
  }, [user?.uid])

  // ✅ FIXED: Use need_id || id for recommendations
  const handleResolveSubmit = useCallback(async (data) => {
    if (!selectedTask) return
    try {
      // For recommendations, need_id = task.id; for matches, use separate need_id
      const needId = selectedTask.need_id || selectedTask.id
      await submitResolution(selectedTask.id, needId, data)
      showSuccess('Task resolved!')
      setSelectedTask(null)
      setShowResolution(false)
      setActiveTab('completed')
    } catch {
      showError('Failed to submit resolution')
    }
  }, [selectedTask])

  return (
    <PageTransition>
      <div style={{ background: T.surface2, minHeight: '100vh', padding: isMobile ? 14 : 28 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>

          {/* Profile header */}
          <div style={{
            background: T.white, borderRadius: 20, padding: 20,
            marginBottom: 24, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
            border: `1px solid ${T.border}`, boxShadow: T.shadowSm, gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: T.primary, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 20, flexShrink: 0,
              }}>
                {(user?.name || 'V').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>
                  {user?.name || 'Volunteer'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {(user?.skills || []).slice(0, 3).map(s => (
                    <span key={s} style={{
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                      background: T.surface2, color: T.textSecondary,
                      padding: '2px 8px', borderRadius: 100,
                    }}>{s}</span>
                  ))}
                  {user?.rating != null && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      background: `${T.success}15`, color: T.success,
                      padding: '2px 8px', borderRadius: 100,
                      display: 'flex', alignItems: 'center', gap: 3,
                    }}>
                      <Star size={9} fill="currentColor" /> {user.rating}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Availability toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: T.surface2, padding: '4px',
              borderRadius: 100, border: `1px solid ${T.border}`,
              opacity: availLoading ? 0.6 : 1,
              pointerEvents: availLoading ? 'none' : 'auto',
              flexShrink: 0,
            }}>
              {[
                { val: true, label: 'Available', activeColor: T.success },
                { val: false, label: 'Away', activeColor: T.surface3 },
              ].map(({ val, label, activeColor }) => (
                <button
                  key={label}
                  onClick={() => handleToggleAvailability(val)}
                  style={{
                    padding: '7px 18px', borderRadius: 100, border: 'none',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    background: isAvailable === val ? activeColor : 'transparent',
                    color: isAvailable === val ? (val ? '#fff' : T.textPrimary) : T.textSecondary,
                    boxShadow: isAvailable === val ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(3,1fr)' : 'repeat(3,1fr)',
            gap: 16, marginBottom: 24,
          }}>
            <StatCard value={pending.length} label="Pending" icon={Zap} color={T.primary} />
            <StatCard value={active.length} label="Active" icon={PlayCircle} color={T.warning} />
            <StatCard value={completed.length} label="Completed" icon={CheckCircle2} color={T.success} />
          </div>

          {/* Away banner */}
          {!isAvailable && (
            <div style={{
              background: '#FEF3C7', border: '1px solid #FCD34D',
              borderRadius: 12, padding: '12px 20px', marginBottom: 20,
              fontSize: 14, fontWeight: 600, color: '#92400E',
            }}>
              ⚠️ You are set as Away. Set yourself as Available to receive new task matches.
            </div>
          )}

          {/* Main grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr',
            gap: 22, alignItems: 'start',
          }}>
            {/* Task list */}
            <div>
              <Tabs
                tabs={[
                  { id: 'pending', label: 'Recommended', icon: Zap, count: pending.length },
                  { id: 'active', label: 'Active', icon: PlayCircle, count: active.length },
                  { id: 'completed', label: 'History', icon: CheckCircle2 },
                ]}
                activeTab={activeTab}
                onTabChange={t => { setActiveTab(t); setSelectedTask(null) }}
              />

              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {loading ? (
                  [0, 1, 2].map(i => (
                    <div key={i} style={{ height: 140, background: T.surface2, borderRadius: 18, opacity: 0.6 }} />
                  ))
                ) : currentList.length === 0 ? (
                  <EmptyState
                    title={
                      activeTab === 'pending' ? 'No recommendations yet' :
                      activeTab === 'active' ? 'No active tasks' :
                      'No history yet'
                    }
                    description={
                      activeTab === 'pending' && !isAvailable
                        ? 'Set yourself as Available to receive tasks.'
                        : 'Tasks will appear here automatically.'
                    }
                  />
                ) : (
                  <AnimatePresence mode="popLayout">
                    {currentList.map(task => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        onClick={() => setSelectedTask(prev => prev?.id === task.id ? null : task)}
                        style={{ cursor: 'pointer' }}
                      >
                        <TaskCard
                          task={task}
                          onAccept={handleAccept}
                          onDecline={handleDecline}
                          onResolve={t => { setSelectedTask(t); setShowResolution(true) }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Map — sticky on desktop */}
            {!isMobile && (
              <div style={{ position: 'sticky', top: 20 }}>
                <TaskMapPanel task={mapTask} />
              </div>
            )}
          </div>
        </div>

        {/* Resolution modal */}
        {showResolution && selectedTask && (
          <Modal isOpen onClose={() => setShowResolution(false)} title="Resolve Task">
            <ResolutionForm
              task={selectedTask}
              onSubmit={handleResolveSubmit}
              onCancel={() => setShowResolution(false)}
            />
          </Modal>
        )}
      </div>
    </PageTransition>
  )
}