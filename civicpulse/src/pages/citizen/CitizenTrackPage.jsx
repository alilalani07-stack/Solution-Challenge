import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { Search, ArrowLeft } from 'lucide-react'

import PageTransition from '../../components/layout/PageTransition'
import NeedTracker from '../../components/citizen/NeedTracker'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'

import { subscribeToNeeds } from '../../adapters/needsAdapter'
import { showError } from '../../components/ui/Toast'
import { T } from '../../styles/tokens'

export default function CitizenTrackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const initialId = (searchParams.get('id') || '').trim().toUpperCase()

  const [trackingId, setTrackingId] = useState(initialId)
  const [currentId, setCurrentId] = useState(initialId)
  const [need, setNeed] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(!!initialId)

  // Real-time subscription
  useEffect(() => {
    if (!currentId) return

    setLoading(true)

    try {
      const unsub = subscribeToNeeds(
        [{ field: 'tracking_id', op: '==', value: currentId }],
        (data) => {
          setNeed(data[0] || null)
          setLoading(false)
          setSearched(true)
        }
      )

      return () => unsub && unsub()
    } catch (err) {
      setLoading(false)
      showError('Failed to fetch request status.')
    }
  }, [currentId])

  const handleSearch = (e) => {
    if (e) e.preventDefault()
    if (!trackingId.trim()) return
    setCurrentId(trackingId.trim().toUpperCase())
  }

  return (
    <PageTransition>
      <div
        style={{
          backgroundColor: T.surface2,
          minHeight: '100vh',
          padding: '32px 0'
        }}
      >
        <div style={{ maxWidth: '896px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* BACK BUTTON */}
          <button
            onClick={() => navigate('/citizen')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: T.textSecondary,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              marginBottom: '24px'
            }}
          >
            <ArrowLeft size={16} /> Back to Hub
          </button>

          {/* SEARCH CARD */}
          <div
            style={{
              backgroundColor: T.surface,
              borderRadius: T.radiusXl,
              boxShadow: T.shadowSm,
              border: `1px solid ${T.border}`,
              padding: '32px',
              marginBottom: '32px'
            }}
          >
            <h1
              style={{
                fontFamily: T.fontDisplay,
                fontSize: '24px',
                fontWeight: 700,
                marginBottom: '8px'
              }}
            >
              Track Request Status
            </h1>

            <p
              style={{
                color: T.textSecondary,
                fontSize: '14px',
                marginBottom: '24px'
              }}
            >
              Enter the tracking ID you received when submitting your request.
              The status will update automatically as our team works on it.
            </p>

            <form
              onSubmit={handleSearch}
              style={{ display: 'flex', gap: '12px', maxWidth: '448px' }}
            >
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="Tracking ID"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  style={{
                    textTransform: 'uppercase',
                    fontFamily: 'monospace'
                  }}
                />
              </div>

              <Button type="submit" loading={loading} icon={Search}>
                Track
              </Button>
            </form>
          </div>

          {/* CONTENT */}
          {loading && !need ? (
            <div
              style={{ padding: '40px', textAlign: 'center' }}
              className="shimmer"
            >
              Syncing live status...
            </div>
          ) : need ? (
            <NeedTracker need={need} />
          ) : searched && !loading ? (
            <div
              style={{
                backgroundColor: T.surface,
                borderRadius: T.radiusXl,
                border: `1px solid ${T.border}`,
                padding: '32px'
              }}
            >
              <EmptyState
                icon={Search}
                title="Request Not Found"
                description={`We couldn't find a request matching "${currentId}". Please double-check the ID or try again in a few moments.`}
              />
            </div>
          ) : null}

        </div>
      </div>
    </PageTransition>
  )
}