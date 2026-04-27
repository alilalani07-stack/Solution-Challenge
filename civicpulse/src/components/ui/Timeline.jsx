import { motion } from 'framer-motion'
import { Check, Clock, Circle } from 'lucide-react'
import { T } from '../../styles/tokens'

export default function Timeline({ steps, style }) {
  return (
    <div style={{ position: 'relative', ...style }}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        const Icon = step.completed ? Check : step.current ? Clock : Circle

        return (
          <div key={step.id || i} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
            {/* Line */}
            {!isLast && (
              <div style={{ position: 'absolute', left: '15px', top: '32px', width: '2px', height: 'calc(100% - 8px)' }}>
                <div style={{ width: '100%', height: '100%', backgroundColor: T.border }} />
                {step.completed && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.15 }}
                    style={{ position: 'absolute', inset: 0, backgroundColor: T.success, transformOrigin: 'top' }}
                  />
                )}
              </div>
            )}

            {/* Node */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
              style={{
                width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 10,
                backgroundColor: step.completed ? T.success : step.current ? T.primary : T.surface3,
                color: step.completed || step.current ? T.white : T.textTertiary,
                border: step.completed || step.current ? 'none' : `1px solid ${T.border}`
              }}
            >
              <Icon size={14} />
            </motion.div>

            {/* Content */}
            <div style={{ paddingBottom: isLast ? '0' : '32px' }}>
              <p style={{ fontSize: '14px', fontWeight: 500, color: step.completed || step.current ? T.textPrimary : T.textTertiary }}>
                {step.label}
              </p>
              {step.timestamp && (
                <p style={{ fontSize: '12px', color: T.textTertiary, marginTop: '2px' }}>{step.timestamp}</p>
              )}
              {step.description && (
                <p style={{ fontSize: '12px', color: T.textSecondary, marginTop: '4px' }}>{step.description}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
