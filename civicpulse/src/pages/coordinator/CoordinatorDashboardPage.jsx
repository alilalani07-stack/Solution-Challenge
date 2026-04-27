import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, ListChecks, Activity, ArrowRight, ShieldAlert, Zap, 
  Users as UsersIcon, FileText, CheckCircle2, Search, Filter, 
  AlertTriangle, History, MoreHorizontal
} from 'lucide-react'
import PageTransition from '../../components/layout/PageTransition'
import NeedReviewCard from '../../components/coordinator/NeedReviewCard'
import NeedDetailDrawer from '../../components/coordinator/NeedDetailDrawer'
import MapPreview from '../../components/location/MapPreview'
import Badge from '../../components/ui/Badge'
import MetricsDashboard from '../../components/coordinator/MetricsDashboard'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import { useRealtimeNeeds } from '../../hooks/useRealtimeNeeds'
import { useRealtimeVolunteers } from '../../hooks/useRealtimeVolunteers'
import { usePolling } from '../../hooks/usePolling' // ✅ added
import { fetchDashboardMetrics } from '../../adapters/coordinatorAdapter'
import { T } from '../../styles/tokens'
import useIsMobile from '../../hooks/useIsMobile'

const VIEW_MODES = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'triage', label: 'Triage Queue', icon: ListChecks },
  { id: 'active', label: 'Active Ops', icon: Activity },
  { id: 'escalated', label: 'Escalations', icon: AlertTriangle },
  { id: 'resolutions', label: 'Verification', icon: CheckCircle2 },
]

export default function CoordinatorDashboardPage() {
  const isMobile = useIsMobile(1024)
  const { needs, loading: needsLoading } = useRealtimeNeeds()
  const { volunteers, loading: volunteersLoading } = useRealtimeVolunteers()

  const [metrics, setMetrics] = useState(null)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [selectedNeed, setSelectedNeed] = useState(null)

  const [activeView, setActiveView] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629, zoom: 4 })

  // ✅ Replaced useEffect with usePolling
  usePolling(async () => {
    const m = await fetchDashboardMetrics()
    setMetrics(m)
    setMetricsLoading(false)
  }, 30000)

  const filteredNeeds = useMemo(() => {
    let result = needs

    if (activeView === 'triage') result = result.filter(n => n.status === 'pending_review')
    else if (activeView === 'active') result = result.filter(n => ['open', 'matched', 'active'].includes(n.status))
    else if (activeView === 'escalated') result = result.filter(n => n.escalation_status && n.status !== 'resolved')
    else if (activeView === 'resolutions') result = result.filter(n => n.status === 'resolved' && !n.verified)

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        n =>
          n.summary?.toLowerCase().includes(q) ||
          n.tracking_id?.toLowerCase().includes(q)
      )
    }

    return result.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
  }, [needs, activeView, searchQuery])

  const mapMarkers = useMemo(() => {
    return filteredNeeds.map(need => ({
      id: need.id,
      lat: need.location_coords?.lat || 20.5937,
      lng: need.location_coords?.lng || 78.9629,
      color: need.escalation_status
        ? T.urgent
        : need.status === 'active'
        ? T.success
        : T.primary,
      pulsing: need.priority_score > 80 || !!need.escalation_status,
      popup: `<b>${need.summary}</b>`
    }))
  }, [filteredNeeds])

  const handleRowClick = (need) => {
    setSelectedNeed(need)
    if (need.location_coords) {
      setMapCenter({
        lat: need.location_coords.lat,
        lng: need.location_coords.lng,
        zoom: 12
      })
    }
  }

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: isMobile ? '16px' : '32px' }}>
        <MetricsDashboard metrics={metrics} loading={metricsLoading} />

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', backgroundColor: T.white, padding: '16px', borderRadius: T.radiusLg, border: `1px solid ${T.border}`, boxShadow: T.shadowSm }}>
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
            {VIEW_MODES.map(view => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: T.radiusFull,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 700,
                  transition: 'all 0.2s',
                  backgroundColor: activeView === view.id ? T.primary : 'transparent',
                  color: activeView === view.id ? T.white : T.textSecondary
                }}
              >
                <view.icon size={16} />
                {view.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: T.textTertiary }} />
              <input 
                placeholder="Search operational feed..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  padding: '8px 12px 8px 36px',
                  borderRadius: T.radiusMd,
                  border: `1px solid ${T.border}`,
                  fontSize: '14px',
                  width: '240px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 400px', gap: '24px', minHeight: '600px' }}>
          <div style={{ backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', borderBottom: `1px solid ${T.border}`, backgroundColor: T.surface2, display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontWeight: 800, fontSize: '15px' }}>Live Operational Feed</h3>
              <span style={{ fontSize: '12px', color: T.textTertiary }}>{filteredNeeds.length} items active</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {needsLoading ? (
                <div style={{ padding: '24px' }} className="shimmer">Syncing with field...</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: T.textSecondary, fontSize: '11px', textTransform: 'uppercase', borderBottom: `1px solid ${T.border}` }}>
                      <th style={{ padding: '12px 16px' }}>Priority</th>
                      <th style={{ padding: '12px 16px' }}>Incident Summary</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNeeds.map(need => (
                      <tr 
                        key={need.id}
                        onClick={() => handleRowClick(need)}
                        style={{
                          borderBottom: `1px solid ${T.border}`,
                          cursor: 'pointer',
                          transition: '0.1s',
                          backgroundColor: selectedNeed?.id === need.id ? `${T.primary}05` : 'transparent'
                        }}
                      >
                        <td style={{ padding: '16px', fontWeight: 800, color: need.priority_score > 80 ? T.urgent : T.textPrimary }}>
                          {need.priority_score}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 700 }}>{need.summary}</div>
                          <div style={{ fontSize: '12px', color: T.textTertiary }}>{need.tracking_id}</div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <Badge type="status" value={need.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ height: '350px', backgroundColor: T.white, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, overflow: 'hidden', position: 'relative' }}>
              <MapPreview {...mapCenter} markers={mapMarkers} selectedId={selectedNeed?.id} height="100%" />
            </div>

            <div style={{ flex: 1, backgroundColor: T.surface2, borderRadius: T.radiusLg, padding: '16px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: T.textTertiary, textTransform: 'uppercase', marginBottom: '12px' }}>
                System Audit Log
              </h4>

              <div style={{ fontSize: '12px', color: T.textSecondary, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {needs.slice(0, 5).map(n => (
                  <div key={n.id} style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ color: T.primary, fontWeight: 700 }}>LIVE</span>
                    <span>Request {n.tracking_id} status updated to {n.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <NeedDetailDrawer
          isOpen={!!selectedNeed}
          onClose={() => setSelectedNeed(null)}
          need={selectedNeed}
        />
      </div>
    </PageTransition>
  )
}