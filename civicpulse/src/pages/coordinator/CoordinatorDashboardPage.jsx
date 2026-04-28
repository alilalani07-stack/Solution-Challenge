import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router'
import {
  Home, ListChecks, Activity,
  CheckCircle2, Search,
  AlertTriangle,
} from 'lucide-react'
import PageTransition from '../../components/layout/PageTransition'
import NeedDetailDrawer from '../../components/coordinator/NeedDetailDrawer'
import MapPreview from '../../components/location/MapPreview'
import Badge from '../../components/ui/Badge'
import MetricsDashboard from '../../components/coordinator/MetricsDashboard'
import EmptyState from '../../components/ui/EmptyState'
import { useRealtimeNeeds } from '../../hooks/useRealtimeNeeds'
import { useRealtimeVolunteers } from '../../hooks/useRealtimeVolunteers'
import { usePolling } from '../../hooks/usePolling'
import { fetchDashboardMetrics } from '../../adapters/coordinatorAdapter'
import { T } from '../../styles/tokens'
import useIsMobile from '../../hooks/useIsMobile'

const VIEW_MODES = [
  { id: 'overview',     label: 'Overview',      icon: Home },
  { id: 'triage',       label: 'Triage Queue',  icon: ListChecks },
  { id: 'active',       label: 'Active Ops',    icon: Activity },
  { id: 'escalated',    label: 'Escalations',   icon: AlertTriangle },
  { id: 'resolutions',  label: 'Verification',  icon: CheckCircle2 },
]

export default function CoordinatorDashboardPage() {
  const isMobile = useIsMobile(1024)
  const { needs, loading: needsLoading } = useRealtimeNeeds()
  const { volunteers } = useRealtimeVolunteers()

  const [metrics, setMetrics]             = useState(null)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [selectedNeed, setSelectedNeed]   = useState(null)
  const [activeView, setActiveView]       = useState('overview')
  const [searchQuery, setSearchQuery]     = useState('')
  const [mapCenter, setMapCenter]         = useState({ lat: 20.5937, lng: 78.9629, zoom: 4 })

  usePolling(async () => {
    try {
      const m = await fetchDashboardMetrics()
      setMetrics(m)
      setMetricsLoading(false)
    } catch (err) {
      console.error('Metrics fetch error:', err)
      setMetricsLoading(false)
    }
  }, 30000)

  const filteredNeeds = useMemo(() => {
  let result = [...needs]

  // ✅ STRENGTHENED: Explicitly filter by status for each view
  if (activeView === 'triage') {
    result = result.filter(n => {
      const isPendingReview = n.status === 'pending_review'
      // 🔍 Debug log for triage view
      if (!isPendingReview && n.confidence >= 0.85) {
        console.warn(`⚠️ High-confidence task ${n.tracking_id} (confidence: ${n.confidence}) has status "${n.status}" — should be "open"`)
      }
      return isPendingReview
    })
  }
  else if (activeView === 'active') {
    result = result.filter(n => ['open', 'matched', 'active'].includes(n.status))
  }
  else if (activeView === 'escalated') {
    result = result.filter(n => n.escalation_status && n.status !== 'resolved')
  }
  else if (activeView === 'resolutions') {
    result = result.filter(n => n.status === 'under_review' && !n.verified)
  }

  // Search filter
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    result = result.filter(
      n => n.summary?.toLowerCase().includes(q) || n.tracking_id?.toLowerCase().includes(q)
    )
  }

  // Sort by priority
  return result.sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
}, [needs, activeView, searchQuery])

  // Define handleRowClick BEFORE handleMarkerClick so it's in scope
  const handleRowClick = useCallback((need) => {
    setSelectedNeed(need)
    if (need?.location_coords?.lat && need?.location_coords?.lng) {
      setMapCenter({
        lat:  need.location_coords.lat,
        lng:  need.location_coords.lng,
        zoom: 13,
      })
    }
  }, [])

  // Marker click: look up the need and delegate to handleRowClick
  const handleMarkerClick = useCallback((needId) => {
    const need = filteredNeeds.find(n => n.id === needId)
    if (need) handleRowClick(need)
  }, [filteredNeeds, handleRowClick])

  const mapMarkers = useMemo(() => {
    return filteredNeeds
      .filter(n => n.location_coords?.lat != null && n.location_coords?.lng != null)
      .map(need => ({
        id:      need.id,
        lat:     need.location_coords.lat,
        lng:     need.location_coords.lng,
        color:   need.escalation_status
                   ? T.urgent
                   : need.status === 'active'
                   ? T.success
                   : T.primary,
        pulsing: need.priority_score > 80 || !!need.escalation_status,
        popup:   need.summary || need.tracking_id || 'Need',
        onClick: handleMarkerClick,
      }))
  }, [filteredNeeds, handleMarkerClick])

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: isMobile ? '16px' : '32px' }}>

        {/* Metrics */}
        <MetricsDashboard metrics={metrics} loading={metricsLoading} />

        {/* View mode tabs + search */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center',
          justifyContent: 'space-between', gap: '16px',
          backgroundColor: T.white, padding: '16px',
          borderRadius: T.radiusLg, border: `1px solid ${T.border}`,
          boxShadow: T.shadowSm,
        }}>
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
            {VIEW_MODES.map(view => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px', borderRadius: T.radiusFull,
                  border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 700, transition: 'all 0.2s',
                  backgroundColor: activeView === view.id ? T.primary : 'transparent',
                  color:           activeView === view.id ? T.white  : T.textSecondary,
                  whiteSpace: 'nowrap',
                }}
              >
                <view.icon size={16} />
                {view.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={16} style={{
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', color: T.textTertiary,
              pointerEvents: 'none',
            }} />
            <input
              placeholder="Search operational feed..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 12px 8px 36px',
                borderRadius: T.radiusMd,
                border: `1px solid ${T.border}`,
                fontSize: '14px', width: '240px', outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Main grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 400px',
          gap: '24px', minHeight: '600px',
        }}>

          {/* Left — operational feed table */}
          <div style={{
            backgroundColor: T.white, border: `1px solid ${T.border}`,
            borderRadius: T.radiusLg, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              padding: '16px', borderBottom: `1px solid ${T.border}`,
              backgroundColor: T.surface2, display: 'flex', justifyContent: 'space-between',
            }}>
              <h3 style={{ fontWeight: 800, fontSize: '15px', margin: 0 }}>Live Operational Feed</h3>
              <span style={{ fontSize: '12px', color: T.textTertiary }}>{filteredNeeds.length} items</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {needsLoading ? (
                <div style={{ padding: '24px', color: T.textSecondary }}>Syncing with field…</div>
              ) : filteredNeeds.length === 0 ? (
                <div style={{ padding: '40px' }}>
                  <EmptyState title="No items match this filter" />
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{
                      textAlign: 'left', color: T.textSecondary,
                      fontSize: '11px', textTransform: 'uppercase',
                      borderBottom: `1px solid ${T.border}`,
                    }}>
                      <th style={{ padding: '12px 16px' }}>Priority</th>
                      <th style={{ padding: '12px 16px' }}>Incident Summary</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNeeds.map(need => (
                      <tr
  key={`${need.id}-${need.status}`} 
  onClick={() => handleRowClick(need)}
  style={{
    borderBottom: `1px solid ${T.border}`,
    cursor: 'pointer', 
    transition: 'background 0.1s',
    backgroundColor: selectedNeed?.id === need.id ? `${T.primary}08` : 'transparent',
  }}
  onMouseEnter={e => { if (selectedNeed?.id !== need.id) e.currentTarget.style.backgroundColor = T.surface2 }}
  onMouseLeave={e => { e.currentTarget.style.backgroundColor = selectedNeed?.id === need.id ? `${T.primary}08` : 'transparent' }}
>
                        <td style={{
                          padding: '16px', fontWeight: 800,
                          color: (need.priority_score || 0) > 80 ? T.urgent : T.textPrimary,
                        }}>
                          {need.priority_score ?? '—'}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ fontWeight: 700, marginBottom: 2 }}>{need.summary || 'No summary'}</div>
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

          {/* Right — map + audit log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Map */}
            <div style={{
              height: '380px',
              backgroundColor: T.white,
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusLg,
              overflow: 'hidden',
              boxShadow: T.shadowSm,
              position: 'relative',
            }}>
              {/* Legend */}
              <div style={{
                position: 'absolute', top: 10, left: 10, zIndex: 10,
                backgroundColor: 'rgba(255,255,255,0.92)',
                borderRadius: 10, padding: '6px 10px',
                fontSize: 11, fontWeight: 600,
                border: `1px solid ${T.border}`,
                display: 'flex', flexDirection: 'column', gap: 4,
                backdropFilter: 'blur(4px)',
                pointerEvents: 'none',
              }}>
                <span style={{ color: T.primary    }}>● Open / Pending</span>
                <span style={{ color: T.success    }}>● Active</span>
                <span style={{ color: T.urgent     }}>● Escalated</span>
                <span style={{ color: T.textTertiary, fontStyle: 'italic', marginTop: 2 }}>Click a pin to view details</span>
              </div>

              <MapPreview
                lat={mapCenter.lat}
                lng={mapCenter.lng}
                zoom={mapCenter.zoom}
                markers={mapMarkers}
                selectedId={selectedNeed?.id}
                height="380px"
              />
            </div>

            {/* Audit log */}
            <div style={{
              flex: 1, backgroundColor: T.surface2,
              borderRadius: T.radiusLg, padding: '16px',
              border: `1px solid ${T.border}`,
            }}>
              <h4 style={{
                fontSize: '12px', fontWeight: 700,
                color: T.textTertiary, textTransform: 'uppercase',
                marginBottom: '12px', margin: '0 0 12px 0',
              }}>
                System Audit Log
              </h4>
              <div style={{ fontSize: '12px', color: T.textSecondary, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {needs.slice(0, 8).map(n => (
                  <div key={n.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: T.primary, fontWeight: 700, flexShrink: 0 }}>LIVE</span>
                    <span style={{ color: T.textSecondary }}>
                      {n.tracking_id || n.id} → <strong>{n.status}</strong>
                    </span>
                  </div>
                ))}
                {needs.length === 0 && (
                  <span style={{ color: T.textTertiary, fontStyle: 'italic' }}>No activity yet</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detail drawer — slides in from the right when a need is selected
            (either from the table row click or a map marker click)           */}
        <NeedDetailDrawer
          isOpen={!!selectedNeed}
          onClose={() => setSelectedNeed(null)}
          need={selectedNeed}
        />
      </div>
    </PageTransition>
  )
}