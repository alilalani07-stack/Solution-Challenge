import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayCircle, CheckCircle2, Zap, MapPin, Star } from 'lucide-react'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'

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
  setVolunteerAvailability
} from '../../adapters/volunteerAdapter'

import { showSuccess, showError } from '../../components/ui/Toast'
import { T } from '../../styles/tokens'
import useIsMobile from '../../hooks/useIsMobile'

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || ''

// ── Helpers ──────────────────────────────────────────────────────────────────
function normalizeCoords(task) {
  const c = task?.coords || task?.location_coords || task?.locationCoords || null
  if (!c) return null
  if (Array.isArray(c) && c.length >= 2) return { lat: c[0], lng: c[1] }
  if (typeof c === 'string') {
    const parts = c.split(',').map(n => parseFloat(n.trim()))
    if (parts.length === 2 && !isNaN(parts[0])) return { lat: parts[0], lng: parts[1] }
  }
  if (typeof c === 'object' && c.lat && c.lng) return { lat: c.lat, lng: c.lng }
  return null
}

function getState(task) {
  const s = task.status || task.match_status
  if (['resolved', 'completed', 'closed', 'declined', 'rejected'].includes(s)) return 'completed'
  if (['active', 'accepted', 'in_progress'].includes(s)) return 'active'
  return 'pending'
}

function getUrgencyColor(urgency) {
  if (!urgency) return { bg: '#FEF3C7', color: '#D97706', label: 'MEDIUM' }
  const u = typeof urgency === 'number' ? urgency : 5
  if (u >= 8) return { bg: '#FEE2E2', color: '#DC2626', label: 'CRITICAL' }
  if (u >= 6) return { bg: '#FEF3C7', color: '#D97706', label: 'HIGH' }
  return { bg: '#D1FAE5', color: '#059669', label: 'LOW' }
}

// ── Map Component ─────────────────────────────────────────────────────────────
function TaskMap({ task }) {
  const coords = normalizeCoords(task)
  const defaultCenter = { lat: 17.3850, lng: 78.4867 } // Hyderabad

  if (!MAPS_KEY) {
    return (
      <div style={{
        height: 220, borderRadius: 16, background: T.surface2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: T.textSecondary, fontSize: 13, flexDirection: 'column', gap: 6
      }}>
        <MapPin size={20} color={T.textTertiary} />
        Add VITE_GOOGLE_MAPS_KEY to .env
      </div>
    )
  }

  return (
    <APIProvider apiKey={MAPS_KEY}>
      <div style={{ height: 220, borderRadius: 16, overflow: 'hidden' }}>
        <Map
          defaultCenter={coords || defaultCenter}
          defaultZoom={coords ? 14 : 11}
          mapId="civicpulse-volunteer"
          disableDefaultUI
          gestureHandling="cooperative"
          style={{ width: '100%', height: '100%' }}
        >
          {coords && (
            <AdvancedMarker position={coords} title={task?.title || 'Task Location'}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#ef4444', border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }} />
            </AdvancedMarker>
          )}
        </Map>
      </div>
    </APIProvider>
  )
}

// ── Status tag ────────────────────────────────────────────────────────────────
function StatusTag({ status }) {
  const map = {
    pending:    { label: 'Pending',    bg: '#EFF6FF', color: '#3B82F6' },
    open:       { label: 'Open',       bg: '#EFF6FF', color: '#3B82F6' },
    accepted:   { label: 'Active',     bg: '#D1FAE5', color: '#059669' },
    active:     { label: 'Active',     bg: '#D1FAE5', color: '#059669' },
    in_progress:{ label: 'Active',     bg: '#D1FAE5', color: '#059669' },
    resolved:   { label: 'Resolved',   bg: '#D1FAE5', color: '#059669' },
    completed:  { label: 'Completed',  bg: '#D1FAE5', color: '#059669' },
    declined:   { label: 'Declined',   bg: '#FEE2E2', color: '#DC2626' },
    rejected:   { label: 'Rejected',   bg: '#FEE2E2', color: '#DC2626' },
    closed:     { label: 'Closed',     bg: '#F3F4F6', color: '#6B7280' },
  }
  const cfg = map[status] || { label: status, bg: '#F3F4F6', color: '#6B7280' }
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 100, fontSize: 11,
      fontWeight: 700, background: cfg.bg, color: cfg.color,
      textTransform: 'uppercase', letterSpacing: '0.5px'
    }}>
      {cfg.label}
    </span>
  )
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onAccept, onDecline, onResolve }) {
  const state = getState(task)
  const urgency = getUrgencyColor(task.urgency)
  const status = task.status || task.match_status || 'pending'

  return (
    <div style={{
      background: T.white, borderRadius: 18, padding: 20,
      border: `1px solid ${T.border}`, boxShadow: T.shadowSm
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <h4 style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, flex: 1, marginRight: 10 }}>
          {task.title || task.summary || 'Volunteer Task'}
        </h4>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <span style={{
            padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
            background: urgency.bg, color: urgency.color
          }}>
            {urgency.label}
          </span>
          <StatusTag status={status} />
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: T.textSecondary, marginBottom: 12, lineHeight: 1.5 }}>
        {task.description || task.raw_report || 'No description available'}
      </p>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: T.textTertiary, marginBottom: 16 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={12} />
          {task.location || task.location_hint || 'Unknown location'}
        </span>
        {task.category && (
          <span style={{
            background: T.surface2, padding: '2px 8px',
            borderRadius: 6, textTransform: 'capitalize'
          }}>
            {task.category}
          </span>
        )}
      </div>

      {/* Actions */}
      {state === 'pending' && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => onAccept(task)}
            style={{
              flex: 1, padding: '11px 16px',
              background: T.primary, color: '#fff',
              border: 0, borderRadius: 12, fontWeight: 600,
              fontSize: 14, cursor: 'pointer'
            }}
          >
            Accept
          </button>
          <button
            onClick={() => onDecline(task)}
            style={{
              flex: 1, padding: '11px 16px',
              background: T.surface2, color: T.textSecondary,
              border: 0, borderRadius: 12, fontWeight: 600,
              fontSize: 14, cursor: 'pointer'
            }}
          >
            Decline
          </button>
        </div>
      )}

      {state === 'active' && (
        <button
          onClick={() => onResolve(task)}
          style={{
            width: '100%', padding: '11px 16px',
            background: T.success, color: '#fff',
            border: 0, borderRadius: 12, fontWeight: 600,
            fontSize: 14, cursor: 'pointer'
          }}
        >
          ✓ Mark as Resolved
        </button>
      )}

      {state === 'completed' && (
        <div style={{
          padding: '10px 16px', borderRadius: 12, textAlign: 'center',
          fontWeight: 700, fontSize: 13,
          background: status === 'declined' || status === 'rejected'
            ? '#FEE2E2' : '#D1FAE5',
          color: status === 'declined' || status === 'rejected'
            ? '#DC2626' : '#059669'
        }}>
          {status === 'declined' || status === 'rejected'
            ? '✕ Task Declined'
            : '✓ Completed'}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VolunteerDashboardPage() {
  const { user, setSession } = useSession()
  const navigate = useNavigate()
  const isMobile = useIsMobile(1024)
  const { pending, active, completed, loading } = useVolunteerTasks(user?.uid)

  const [activeTab, setActiveTab]         = useState('pending')
  const [selectedTask, setSelectedTask]   = useState(null)
  const [showResolution, setShowResolution] = useState(false)
  const [isAvailable, setIsAvailable]     = useState(user?.availability ?? true)
  const [availLoading, setAvailLoading]   = useState(false)

  const currentList =
    activeTab === 'pending'   ? pending :
    activeTab === 'active'    ? active  : completed

  const handleToggleAvailability = useCallback(async (val) => {
    if (val === isAvailable) return
    setAvailLoading(true)
    try {
      await setVolunteerAvailability(user?.uid, val)
      setIsAvailable(val)
      // Update session so profile reflects change
      setSession({ role: 'volunteer', user: { ...user, availability: val } })
      showSuccess(val ? 'You are now available for tasks' : 'You are now set as Away')
    } catch (err) {
      showError('Failed to update availability')
    } finally {
      setAvailLoading(false)
    }
  }, [isAvailable, user, setSession])

  const handleAccept = useCallback(async (task) => {
    try {
      const isMatch = !task.is_recommendation
      const taskId  = task.id || task.match_id
      await acceptTask(taskId, user?.uid, isMatch)
      showSuccess('Task accepted!')
      setSelectedTask(null)
      setActiveTab('active')
    } catch (err) {
      showError('Failed to accept task: ' + err.message)
    }
  }, [user])

  const handleDecline = useCallback(async (task) => {
    try {
      const isMatch = !task.is_recommendation
      const taskId  = task.id || task.match_id
      await declineTask(taskId, user?.uid, isMatch)
      showSuccess('Task declined')
      setSelectedTask(null)
      // stays in pending list until Firestore snapshot fires
    } catch (err) {
      showError('Failed to decline task')
    }
  }, [user])

  const handleResolveSubmit = useCallback(async (data) => {
    try {
      await submitResolution(selectedTask.id, selectedTask.need_id, data)
      showSuccess('Task resolved!')
      setSelectedTask(null)
      setShowResolution(false)
      setActiveTab('completed')
    } catch (err) {
      showError('Failed to submit resolution')
    }
  }, [selectedTask])

  const mapTask = selectedTask || currentList[0] || null

  return (
    <PageTransition>
      <div style={{ background: T.surface2, minHeight: '100vh', padding: isMobile ? 14 : 28 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>

          {/* ── Profile header ── */}
          <div style={{
            background: T.white, borderRadius: 20, padding: 20,
            marginBottom: 24, display: 'flex',
            justifyContent: 'space-between', alignItems: 'center',
            border: `1px solid ${T.border}`, boxShadow: T.shadowSm
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: T.primary, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 20
              }}>
                {user?.name?.charAt(0) || 'V'}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>
                  {user?.name || 'Volunteer'}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {user?.skills?.slice(0, 3).map(s => (
                    <span key={s} style={{
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                      background: T.surface2, color: T.textSecondary,
                      padding: '2px 8px', borderRadius: 100
                    }}>{s}</span>
                  ))}
                  {user?.rating && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      background: `${T.success}15`, color: T.success,
                      padding: '2px 8px', borderRadius: 100,
                      display: 'flex', alignItems: 'center', gap: 3
                    }}>
                      <Star size={9} fill="currentColor" /> {user.rating}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Availability toggle ── */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: T.surface2, padding: '5px 5px',
              borderRadius: 100, border: `1px solid ${T.border}`,
              opacity: availLoading ? 0.6 : 1,
              pointerEvents: availLoading ? 'none' : 'auto'
            }}>
              <button
                onClick={() => handleToggleAvailability(true)}
                style={{
                  padding: '7px 18px', borderRadius: 100, border: 'none',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: isAvailable ? T.success : 'transparent',
                  color: isAvailable ? '#fff' : T.textSecondary,
                  boxShadow: isAvailable ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                Available
              </button>
              <button
                onClick={() => handleToggleAvailability(false)}
                style={{
                  padding: '7px 18px', borderRadius: 100, border: 'none',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: !isAvailable ? T.surface3 : 'transparent',
                  color: !isAvailable ? T.textPrimary : T.textSecondary,
                  boxShadow: !isAvailable ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                Away
              </button>
            </div>
          </div>

          {/* ── Stats ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)',
            gap: 16, marginBottom: 26
          }}>
            <StatCard value={pending.length}   label="Pending"   icon={Zap}          color={T.primary} />
            <StatCard value={active.length}    label="Active"    icon={PlayCircle}    color={T.warning} />
            <StatCard value={completed.length} label="Completed" icon={CheckCircle2}  color={T.success} />
          </div>

          {/* ── Away banner ── */}
          {!isAvailable && (
            <div style={{
              background: '#FEF3C7', border: '1px solid #FCD34D',
              borderRadius: 12, padding: '12px 20px', marginBottom: 20,
              fontSize: 14, fontWeight: 600, color: '#92400E',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              ⚠️ You are set as Away. You won't receive new task matches until you set yourself as Available.
            </div>
          )}

          {/* ── Main grid ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr',
            gap: 22
          }}>
            {/* Task list */}
            <div>
              <Tabs
                tabs={[
                  { id: 'pending',   label: 'Recommended', icon: Zap,         count: pending.length },
                  { id: 'active',    label: 'Active',       icon: PlayCircle,  count: active.length },
                  { id: 'completed', label: 'History',      icon: CheckCircle2 },
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} style={{
                      height: 140, background: T.surface2,
                      borderRadius: 18, animation: 'pulse 1.5s infinite'
                    }} />
                  ))
                ) : currentList.length === 0 ? (
                  <EmptyState
                    title={activeTab === 'pending' ? 'No recommendations' : activeTab === 'active' ? 'No active tasks' : 'No history yet'}
                    description={activeTab === 'pending' ? (isAvailable ? 'New tasks will appear here automatically.' : 'Set yourself as Available to receive tasks.') : 'Tasks will appear here.'}
                  />
                ) : (
                  <AnimatePresence>
                    {currentList.map(task => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => setSelectedTask(task)}
                      >
                        <TaskCard
                          task={task}
                          onAccept={handleAccept}
                          onDecline={handleDecline}
                          onResolve={(t) => { setSelectedTask(t); setShowResolution(true) }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Map panel — desktop only */}
            {!isMobile && (
              <div style={{ position: 'sticky', top: 20 }}>
                <div style={{
                  background: T.white, borderRadius: 18, padding: 16,
                  border: `1px solid ${T.border}`, boxShadow: T.shadowSm
                }}>
                  <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>
                    {mapTask ? `📍 ${mapTask.title || 'Task Location'}` : 'Location Preview'}
                  </div>
                  <TaskMap task={mapTask} />
                  {mapTask?.location && (
                    <p style={{ fontSize: 12, color: T.textSecondary, marginTop: 8 }}>
                      {mapTask.location}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resolution modal */}
        {showResolution && (
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