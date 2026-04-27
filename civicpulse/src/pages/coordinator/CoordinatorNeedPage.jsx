import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import PageTransition from '../../components/layout/PageTransition'
import NeedDetailDrawer from '../../components/coordinator/NeedDetailDrawer'
import Button from '../../components/ui/Button'
import { fetchNeedById } from '../../adapters/needsAdapter'
import { T } from '../../styles/tokens'

export default function CoordinatorNeedPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [need, setNeed] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchNeedById(id)
        setNeed(data)
      } catch (err) {
        setNeed(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: T.primary, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!need) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', textAlign: 'center', padding: '24px' }}>
        <AlertCircle size={48} color={T.urgent} />
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>Request Not Found</h2>
          <p style={{ color: T.textSecondary, fontSize: '14px', maxWidth: '300px' }}>The tracking ID might be invalid or the request was removed from the database.</p>
        </div>
        <Button onClick={() => navigate('/coordinator/dashboard')}>Back to Dashboard</Button>
      </div>
    )
  }

  return (
    <PageTransition>
      <div style={{ backgroundColor: T.surface2, minHeight: '100%', padding: '24px' }}>
        <button 
          onClick={() => navigate('/coordinator/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: T.textSecondary, fontWeight: 700, fontSize: '14px', cursor: 'pointer', marginBottom: '24px' }}
        >
          <ArrowLeft size={16} /> Back to Operations
        </button>

        <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: T.white, borderRadius: T.radiusXl, border: `1px solid ${T.border}`, boxShadow: T.shadowLg, overflow: 'hidden' }}>
          {/* Reuse the drawer content by mounting it in a stable relative container */}
          <div style={{ position: 'relative', height: '100%', minHeight: '600px' }}>
            <NeedDetailDrawer 
              need={need} 
              isOpen={true} 
              onClose={() => navigate('/coordinator/dashboard')} 
              isStaticPage={true} // New prop to handle non-fixed positioning
            />
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
