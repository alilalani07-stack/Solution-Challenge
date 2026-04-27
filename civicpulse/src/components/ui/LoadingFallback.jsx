import { motion } from 'framer-motion'

export default function LoadingFallback() {
  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#F8F9FB',
      gap: '24px'
    }}>
      <div style={{ position: 'relative', width: '64px', height: '64px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: '64px', height: '64px', borderRadius: '50%',
            border: '4px solid #E5E7EB', borderTopColor: '#0057FF'
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            position: 'absolute', inset: '16px', borderRadius: '50%',
            backgroundColor: '#0057FF10', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0057FF' }} />
        </motion.div>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <p style={{ 
          fontSize: '16px', fontWeight: 700, color: '#0F1117', 
          fontFamily: '"DM Sans", sans-serif', marginBottom: '4px' 
        }}>
          Syncing Operations
        </p>
        <p style={{ 
          fontSize: '13px', color: '#6B7280', 
          fontFamily: '"DM Sans", sans-serif' 
        }}>
          Preparing your control center...
        </p>
      </div>
    </div>
  )
}
