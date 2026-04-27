import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { bottomDrawerVariants } from '../../utils/motionVariants'
import { T } from '../../styles/tokens'

export default function Drawer({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' }}
            onClick={onClose}
          />
          <motion.div
            variants={bottomDrawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: T.surface, borderTopLeftRadius: T.radiusXl, borderTopRightRadius: T.radiusXl,
              boxShadow: T.shadowLg, maxHeight: '90vh', overflowY: 'auto', paddingBottom: 'env(safe-area-inset-bottom, 0px)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px' }}>
              <div style={{ width: '40px', height: '4px', backgroundColor: T.borderStrong, borderRadius: '9999px' }} />
            </div>
            {title && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: `1px solid ${T.border}` }}>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '18px', fontWeight: 700 }}>{title}</h3>
                <button
                  onClick={onClose}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div style={{ padding: '20px' }}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
