import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import Button from './Button'
import { T } from '../../styles/tokens'

export default function EmptyState({
  icon: Icon = Inbox, title = 'Nothing here yet', description, actionLabel, onAction, style
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center', ...style }}
    >
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: T.surface3, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
        <Icon size={28} color={T.textTertiary} />
      </div>
      <h3 style={{ fontFamily: T.fontDisplay, fontSize: '18px', fontWeight: 700, color: T.textPrimary, marginBottom: '4px' }}>{title}</h3>
      {description && <p style={{ fontSize: '14px', color: T.textSecondary, maxWidth: '320px', lineHeight: 1.5 }}>{description}</p>}
      {actionLabel && onAction && (
        <div style={{ marginTop: '16px' }}>
          <Button onClick={onAction} variant="secondary" size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
