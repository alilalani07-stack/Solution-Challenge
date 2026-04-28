import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import PageTransition from '../../components/layout/PageTransition'
import NeedSubmitForm from '../../components/citizen/NeedSubmitForm'
import SubmitSuccess from '../../components/citizen/SubmitSuccess'
import { submitNeed } from '../../adapters/needsAdapter'
import { showError } from '../../components/ui/Toast'
import { T } from '../../styles/tokens'

export default function CitizenSubmitPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submittedId, setSubmittedId] = useState(null)

  const handleSubmit = async (data) => {
    try {
      setLoading(true)
      const result = await submitNeed(data)
      setSubmittedId(result.tracking_id)
    } catch (err) {
      console.error('Submit error:', err)
      showError('Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div style={{ backgroundColor: T.surface2, minHeight: '100vh', padding: '32px 0' }}>
        <div style={{ maxWidth: '896px', margin: '0 auto', padding: '0 24px' }}>
          {!submittedId && (
            <button 
              onClick={() => navigate(-1)} 
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500,
                color: T.textSecondary, cursor: 'pointer', background: 'none', border: 'none', marginBottom: '24px'
              }}
            >
              <ArrowLeft size={16} /> Cancel
            </button>
          )}

          {submittedId ? (
            <SubmitSuccess trackingId={submittedId} />
          ) : (
            <NeedSubmitForm onSubmit={handleSubmit} loading={loading} />
          )}
        </div>
      </div>
    </PageTransition>
  )
}