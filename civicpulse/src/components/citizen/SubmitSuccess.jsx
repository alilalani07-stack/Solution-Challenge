import { motion } from 'framer-motion'
import { CheckCircle2, Copy, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import Button from '../ui/Button'
import { showSuccess } from '../ui/Toast'
import { T } from '../../styles/tokens'

export default function SubmitSuccess({ trackingId }) {
  const navigate = useNavigate()

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingId)
    showSuccess('Tracking ID copied to clipboard')
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ maxWidth: '448px', margin: '0 auto', textAlign: 'center', padding: '48px 0' }}
    >
      <div style={{ width: '96px', height: '96px', backgroundColor: T.successLight, borderRadius: '50%', margin: '0 auto 32px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px', color: T.success }}>
          <motion.path 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            d="M20 6L9 17l-5-5"
          />
        </svg>
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          style={{ position: 'absolute', bottom: '-8px', right: '-8px', backgroundColor: T.white, borderRadius: '50%', padding: '4px', boxShadow: T.shadowMd }}
        >
          <CheckCircle2 size={24} color={T.primary} />
        </motion.div>
      </div>

      <h2 style={{ fontFamily: T.fontDisplay, fontSize: '30px', fontWeight: 700, marginBottom: '16px', color: T.textPrimary }}>Request Received</h2>
      <p style={{ color: T.textSecondary, marginBottom: '32px', lineHeight: 1.5 }}>
        We've received your request and our AI is structuring it for the nearest volunteers. Keep this Tracking ID safe.
      </p>

      <div style={{ backgroundColor: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: '24px', marginBottom: '32px', boxShadow: T.shadowSm }}>
        <p style={{ fontSize: '14px', fontWeight: 500, color: T.textSecondary, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Tracking ID</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <code style={{ fontSize: '24px', fontWeight: 700, color: T.primary, letterSpacing: '2px' }}>{trackingId}</code>
          <button 
            onClick={handleCopy}
            style={{ padding: '8px', borderRadius: T.radiusSm, backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: T.textTertiary, transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = T.surface2; e.currentTarget.style.color = T.primary; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = T.textTertiary; }}
            aria-label="Copy tracking ID"
          >
            <Copy size={20} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Button 
          fullWidth 
          size="lg" 
          onClick={() => navigate(`/citizen/track?id=${trackingId}`)}
          iconRight={ArrowRight}
        >
          Track Request Status
        </Button>
        <Button 
          fullWidth 
          variant="ghost" 
          onClick={() => window.location.reload()}
        >
          Submit Another Request
        </Button>
      </div>
    </motion.div>
  )
}
