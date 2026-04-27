import { motion } from 'framer-motion'

export default function ProgressBar({ value = 0, max = 100, color = '#0057FF', height = 6, className = '', showLabel = false }) {
  const pct = Math.min(Math.round((value / max) * 100), 100)

  return (
    <div className={className}>
      <div className="bg-surface-3 rounded-full overflow-hidden" style={{ height }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-text-secondary mt-1 text-right">{pct}%</p>
      )}
    </div>
  )
}
