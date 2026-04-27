import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, ListChecks, Check, X, Zap, 
  ArrowLeft, Search, Filter, ShieldAlert,
  BarChart2, MapPin, Clock, Info, FileText
} from 'lucide-react'
import PageTransition from '../../components/layout/PageTransition'
import NeedReviewCard from '../../components/coordinator/NeedReviewCard'
import VolunteerMatchList from '../../components/coordinator/VolunteerMatchList'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import { useRealtimeNeeds } from '../../hooks/useRealtimeNeeds'
import { approveNeed, approveAndTriggerMatch, rejectNeed, verifyResolution } from '../../adapters/coordinatorAdapter'
import { assignVolunteer } from '../../adapters/matchAdapter'
import { showSuccess, showError } from '../../components/ui/Toast'
import useIsMobile from '../../hooks/useIsMobile'
import { T } from '../../styles/tokens'

const formatDateTime = (date) => {
  if (!date) return 'N/A'
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

export default function CoordinatorReviewPage() {
  const isMobile = useIsMobile(1024)
  const { needs, loading: needsLoading } = useRealtimeNeeds()
  const [selectedNeed, setSelectedNeed] = useState(null)
  const [matches, setMatches] = useState(null)
  const [processing, setProcessing] = useState(false)

  const pendingReview = needs
  .filter(n => 
    n.status === 'pending_review' || 
    (n.status === 'resolved' && !n.verified) 
  )
  .sort((a, b) => b.priority_score - a.priority_score)

  useEffect(() => {
    if (!isMobile && pendingReview.length > 0 && !selectedNeed) {
      setSelectedNeed(pendingReview[0])
    }
  }, [pendingReview, isMobile])

  const handleApprove = async () => {
    try {
      setProcessing(true)
      await approveNeed(selectedNeed.id)
      showSuccess('Need approved.')
      setSelectedNeed(null)
      setMatches(null)
    } catch (err) { showError('Failed to approve.') }
    finally { setProcessing(false) }
  }

  const handleApproveAndMatch = async () => {
    try {
      setProcessing(true)
      const res = await approveAndTriggerMatch(selectedNeed.id)
      setMatches(res.matches)
      showSuccess('Need approved. Dispatching matching engine...')
    } catch (err) { showError('Matching failed.') }
    finally { setProcessing(false) }
  }

  const handleReject = async () => {
    try {
      setProcessing(true)
      await rejectNeed(selectedNeed.id)
      showSuccess('Need rejected.')
      setSelectedNeed(null)
      setMatches(null)
    } catch (err) { showError('Action failed.') }
    finally { setProcessing(false) }
  }

  const handleAssign = async (volunteerId, tier) => {
    try {
      setProcessing(true)
      await assignVolunteer(selectedNeed.id, volunteerId, tier)
      showSuccess('Volunteer assigned!')
      setSelectedNeed(null)
      setMatches(null)
    } catch (err) { showError('Assignment failed.') }
    finally { setProcessing(false) }
  }

  const handleVerifyResolution = async (approved) => {
    try {
      setProcessing(true)
      await verifyResolution(selectedNeed.id, approved, '')
      showSuccess(approved ? 'Resolution verified and closed.' : 'Task reopened for reassignment.')
      setSelectedNeed(null)
      setMatches(null)
    } catch (err) {
      showError('Action failed.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', height: isMobile ? 'auto' : 'calc(100vh - 120px)', gap: '24px', padding: isMobile ? '16px' : '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: T.fontDisplay, fontSize: '32px', fontWeight: 800, color: T.textPrimary }}>Review Queue</h1>
            <p style={{ color: T.textSecondary }}>Operational triage for incoming citizen requests.</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '24px', flex: 1, minHeight: 0 }}>
          
          {/* LEFT PANEL */}
          <div style={{ width: isMobile ? '100%' : '400px', display: 'flex', flexDirection: 'column', backgroundColor: T.surface2, borderRadius: T.radiusXl, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: `1px solid ${T.border}`, backgroundColor: T.white, display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ fontWeight: 800, fontSize: '15px' }}>Pending Triage ({pendingReview.length})</h2>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {needsLoading ? <div className="shimmer" style={{ height: '100px' }} /> : pendingReview.length === 0 ? <EmptyState title="Queue empty" /> : (
                pendingReview.map(need => (
                  <NeedReviewCard 
                    key={need.id}
                    need={need}
                    selected={selectedNeed?.id === need.id}
                    onSelect={() => { setSelectedNeed(need); setMatches(null); }}
                  />
                ))
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{ flex: 1, backgroundColor: T.white, borderRadius: T.radiusXl, border: `1px solid ${T.border}`, boxShadow: T.shadowLg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {!selectedNeed ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmptyState title="Select a request" />
              </div>
            ) : (
              <>
                <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
                  
                  {/* HEADER */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{ fontFamily: T.fontDisplay, fontSize: '28px', fontWeight: 800, lineHeight: 1.2 }}>
                        {selectedNeed.summary}
                      </h2>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <Badge value={selectedNeed.category} />
                        <Badge value={selectedNeed.urgency} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', padding: '12px', backgroundColor: T.surface2, borderRadius: T.radiusMd }}>
                      <span style={{ fontSize: '32px', fontWeight: 800 }}>{selectedNeed.priority_score}</span>
                      <span style={{ fontSize: '11px', color: T.textTertiary, textTransform: 'uppercase' }}>Priority</span>
                    </div>
                  </div>

                  {/* REPORT */}
                  <div style={{ backgroundColor: T.surface2, padding: '20px', borderRadius: T.radiusLg, border: `1px solid ${T.border}`, marginBottom: '32px' }}>
                    {selectedNeed.raw_report}
                  </div>

                  {/* META */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                    <div style={{ padding: '16px', border: `1px solid ${T.border}`, borderRadius: T.radiusLg }}>
                      <p style={{ fontSize: '11px', fontWeight: 700 }}>AI Confidence</p>
                      <ProgressBar value={selectedNeed.confidence * 100} color={T.primary} />
                      <p style={{ fontWeight: 800 }}>{Math.round(selectedNeed.confidence * 100)}%</p>
                    </div>
                    <div style={{ padding: '16px', border: `1px solid ${T.border}`, borderRadius: T.radiusLg }}>
                      <p style={{ fontSize: '11px', fontWeight: 700 }}>Time Since Report</p>
                      <p>{formatDateTime(selectedNeed.submitted_at)}</p>
                    </div>
                  </div>

                  {/* ✅ NEW: RESOLUTION BLOCK */}
                  {selectedNeed.status === 'resolved' && (
                    <div style={{
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #86EFAC',
                      borderRadius: T.radiusLg,
                      padding: '20px',
                      marginBottom: '32px'
                    }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: '#15803D', marginBottom: 12 }}>
                        ✓ Volunteer Resolution Report
                      </h4>

                      <p>{selectedNeed.resolution_notes || 'No outcome notes provided.'}</p>

                      {!selectedNeed.verified && (
                        <div style={{ marginTop: 10 }}>⏳ Pending coordinator verification</div>
                      )}
                      {selectedNeed.verified && (
                        <div style={{ marginTop: 10 }}>✓ Verified by coordinator</div>
                      )}
                    </div>
                  )}

                  {/* MATCHES */}
                  {matches && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <VolunteerMatchList matches={matches} onAssign={handleAssign} />
                    </motion.div>
                  )}

                </div>

                {/* ✅ UPDATED BUTTON BLOCK */}
                <div style={{ padding: '20px 32px', borderTop: `1px solid ${T.border}`, display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  
                  {selectedNeed?.status === 'resolved' ? (
                    <>
                      <Button variant="ghost" onClick={() => handleVerifyResolution(false)} disabled={processing}>
                        ↩ Reopen Task
                      </Button>
                      <Button onClick={() => handleVerifyResolution(true)} disabled={processing}>
                        ✓ Verify & Close
                      </Button>
                    </>
                  ) : !matches ? (
                    <>
                      <Button variant="ghost" onClick={handleReject} disabled={processing}>
                        Reject
                      </Button>
                      <Button variant="outline" onClick={handleApprove} disabled={processing}>
                        Approve to Pool
                      </Button>
                      <Button onClick={handleApproveAndMatch} disabled={processing}>
                        Approve & Match
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" onClick={() => setMatches(null)}>
                      Cancel Matching
                    </Button>
                  )}

                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}