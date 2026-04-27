import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function Select({
  label, options = [], value, onChange, error, placeholder = 'Select...', className = '', id,
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-') || 'select'

  const selected = options.find(o => o.value === value)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className={`relative ${className}`} ref={ref}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <button
        id={selectId}
        type="button"
        onClick={() => setOpen(!open)}
        className={`
          w-full px-4 py-3 bg-surface border rounded-[var(--radius-md)] text-left
          flex items-center justify-between transition-all duration-200 text-sm cursor-pointer
          ${open ? 'border-primary shadow-focus' : 'border-border hover:border-border-strong'}
          ${error ? 'border-urgent!' : ''}
        `}
      >
        <span className={selected ? 'text-text-primary' : 'text-text-tertiary'}>
          {selected ? selected.label : placeholder}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-text-tertiary" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-[var(--radius-md)]
                       shadow-lg overflow-hidden max-h-[200px] overflow-y-auto"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false) }}
                className={`
                  w-full px-4 py-2.5 text-left text-sm transition-colors cursor-pointer
                  flex items-center gap-2
                  ${value === opt.value ? 'bg-primary-light text-primary font-medium' : 'text-text-primary hover:bg-surface-2'}
                `}
              >
                {opt.icon && <span>{opt.icon}</span>}
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-urgent text-xs mt-1.5 ml-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
