import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { T } from '../../styles/tokens'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const sizeWidth = {
    sm: '384px',
    md: '512px',
    lg: '672px',
    xl: '896px',
    full: '90vw',
  }[size] || '512px'

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'relative', backgroundColor: T.surface, borderRadius: T.radiusXl, boxShadow: T.shadowLg, width: '100%', maxWidth: sizeWidth,
              maxHeight: '85vh', overflowY: 'auto'
            }}
          >
            {title && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: `1px solid ${T.border}`, position: 'sticky', top: 0, backgroundColor: T.surface, zIndex: 10, borderTopLeftRadius: T.radiusXl, borderTopRightRadius: T.radiusXl }}>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '18px', fontWeight: 700 }}>{title}</h3>
                <button
                  onClick={onClose}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div style={{ padding: '24px' }}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
