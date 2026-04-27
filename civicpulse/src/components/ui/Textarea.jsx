import { useState, forwardRef } from 'react'
import { motion } from 'framer-motion'

const Textarea = forwardRef(function Textarea(
  { label, error, maxLength, className = '', id, value = '', ...props },
  ref
) {
  const [focused, setFocused] = useState(false)
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-') || 'textarea'

  return (
    <div className={`relative ${className}`}>
      <textarea
        ref={ref}
        id={inputId}
        value={value}
        className={`
          w-full px-4 py-3 bg-surface border rounded-[var(--radius-md)] text-text-primary
          outline-none transition-all duration-200 font-[var(--font-body)]
          placeholder:text-text-tertiary text-sm resize-none min-h-[120px]
          ${focused ? 'border-primary shadow-focus' : 'border-border hover:border-border-strong'}
          ${error ? 'border-urgent! shadow-[0_0_0_3px_rgba(255,68,68,0.15)]' : ''}
        `}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={maxLength}
        {...props}
      />
      {label && (
        <label
          htmlFor={inputId}
          className={`
            absolute left-4 transition-all duration-200 pointer-events-none
            ${focused || value ? '-top-2.5 text-xs bg-surface px-1' : 'top-3 text-sm'}
            ${focused ? 'text-primary' : 'text-text-tertiary'}
            ${error ? 'text-urgent!' : ''}
          `}
        >
          {label}
        </label>
      )}
      <div className="flex justify-between mt-1.5">
        {error ? (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-urgent text-xs ml-1"
          >
            {error}
          </motion.p>
        ) : <span />}
        {maxLength && (
          <span className="text-xs text-text-tertiary mr-1">
            {(value || '').length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
})

export default Textarea