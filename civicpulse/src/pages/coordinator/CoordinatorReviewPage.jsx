import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
import {
  approveNeed,
  approveAndTriggerMatch,
  rejectNeed,
  verifyResolution
} from '../../adapters/coordinatorAdapter'
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
    (n.status === 'under_review' && !n.verified)
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
    } catch (err) {
      showError('Failed to approve.')
    } finally {
      setProcessing(false)
    }
  }

  const handleApproveAndMatch = async () => {
    try {
      setProcessing(true)
      const res = await approveAndTriggerMatch(selectedNeed.id)
      setMatches(res.matches)
      showSuccess('Need approved. Dispatching matching engine...')
    } catch (err) {
      showError('Matching failed.')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    try {
      setProcessing(true)
      await rejectNeed(selectedNeed.id)
      showSuccess('Need rejected.')
      setSelectedNeed(null)
      setMatches(null)
    } catch (err) {
      showError('Action failed.')
    } finally {
      setProcessing(false)
    }
  }

  const handleAssign = async (volunteerId, tier) => {
    try {
      setProcessing(true)
      await assignVolunteer(selectedNeed.id, volunteerId, tier)
      showSuccess('Volunteer assigned!')
      setSelectedNeed(null)
      setMatches(null)
    } catch (err) {
      showError('Assignment failed.')
    } finally {
      setProcessing(false)
    }
  }

  const handleVerifyResolution = async (approved) => {
    try {
      setProcessing(true)
      await verifyResolution(selectedNeed.id, approved, '')
      showSuccess(
        approved
          ? 'Resolution verified and closed.'
          : 'Task reopened for reassignment.'
      )
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: isMobile ? 'auto' : 'calc(100vh - 120px)',
          gap: '24px',
          padding: isMobile ? '16px' : '32px'
        }}
      >
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: T.fontDisplay, fontSize: 32, fontWeight: 800 }}>
              Review Queue
            </h1>
            <p style={{ color: T.textSecondary }}>
              Operational triage for incoming citizen requests.
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 24,
          flex: 1,
          minHeight: 0
        }}>

          {/* LEFT PANEL */}
          <div style={{
            width: isMobile ? '100%' : 400,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: T.surface2,
            borderRadius: T.radiusXl,
            border: `1px solid ${T.border}`
          }}>
            <div style={{ padding: 16, borderBottom: `1px solid ${T.border}` }}>
              <h2>Pending Triage ({pendingReview.length})</h2>
            </div>

            <div style={{ padding: 16, overflowY: 'auto' }}>
              {needsLoading ? (
                <div className="shimmer" style={{ height: 100 }} />
              ) : pendingReview.length === 0 ? (
                <EmptyState title="Queue empty" />
              ) : (
                pendingReview.map(need => (
                  <NeedReviewCard
                    key={need.id}
                    need={need}
                    selected={selectedNeed?.id === need.id}
                    onSelect={() => {
                      setSelectedNeed(need)
                      setMatches(null)
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{
            flex: 1,
            backgroundColor: T.white,
            borderRadius: T.radiusXl,
            border: `1px solid ${T.border}`,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {!selectedNeed ? (
              <EmptyState title="Select a request" />
            ) : (
              <>
                <div style={{ padding: 32, overflowY: 'auto' }}>

                  <h2>{selectedNeed.summary}</h2>

                  {/* ✅ RESOLUTION BLOCK - FIX 1: Added spacing */}
                  {(selectedNeed.status === 'under_review' || selectedNeed.status === 'resolved') && (
                    <div style={{
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #86EFAC',
                      borderRadius: T.radiusLg,
                      padding: 20,
                      marginBottom: 32
                    }}>
                      <h4 style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#15803D',
                        marginBottom: 12,
                        textTransform: 'uppercase'
                      }}>
                        ✓ Volunteer Resolution Report
                      </h4>

                      {/* ✅ FIXED: Added explicit spacing styles */}
                      <p style={{ marginTop: 0, marginBottom: 12, lineHeight: 1.5 }}>
                        {selectedNeed.resolution_notes || 'No outcome notes provided.'}
                      </p>

                      {!selectedNeed.verified && (
                        <div style={{ marginTop: 8 }}>⏳ Pending coordinator verification</div>
                      )}
                      {selectedNeed.verified && (
                        <div style={{ marginTop: 8, color: '#15803D', fontWeight: 600 }}>✓ Verified & Closed by coordinator</div>
                      )}
                    </div>
                  )}

                  {/* MATCHES */}
                  {matches && (
                    <motion.div>
                      <VolunteerMatchList
                        matches={matches}
                        onAssign={handleAssign}
                      />
                    </motion.div>
                  )}
                </div>

                {/* ✅ BUTTON BLOCK */}
                <div style={{
                  padding: 20,
                  borderTop: `1px solid ${T.border}`,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 12
                }}>
                  {(selectedNeed?.status === 'under_review' || selectedNeed?.status === 'resolved') ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => handleVerifyResolution(false)}
                        disabled={processing}
                        style={{ color: T.urgent }}
                      >
                        ↩ Reopen Task
                      </Button>
                      <Button
                        onClick={() => handleVerifyResolution(true)}
                        disabled={processing}
                        style={{ backgroundColor: T.success }}
                      >
                        ✓ Verify & Close
                      </Button>
                    </>
                  ) : !matches ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={handleReject}
                        disabled={processing}
                        style={{ color: T.urgent }}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleApprove}
                        disabled={processing}
                      >
                        Approve to Pool
                      </Button>
                      <Button
                        onClick={handleApproveAndMatch}
                        disabled={processing}
                      >
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