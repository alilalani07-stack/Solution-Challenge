import React, { useState, forwardRef } from 'react'

const Input = forwardRef(({ label, error, type = 'text', icon: Icon, ...props }, ref) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {label && (
        <label style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#6B7280',
          marginBottom: '6px'
        }}>
          {label}
        </label>
      )}
      
      <div style={{ position: 'relative', width: '100%' }}>
        {Icon && (
          <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref} // Attach the forwarded ref to the native input element
          type={type}
          {...props}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          style={{
            width: '100%',
            padding: '12px 16px',
            paddingLeft: Icon ? '44px' : '16px',
            border: `1.5px solid ${error ? '#FF4444' : isFocused ? '#0057FF' : '#E8EAED'}`,
            borderRadius: '10px',
            fontSize: '14px',
            fontFamily: "'DM Sans', sans-serif",
            background: 'white',
            color: '#0F1117',
            outline: 'none',
            transition: 'all 0.15s ease',
            boxShadow: isFocused && !error ? '0 0 0 3px rgba(0,87,255,0.12)' : 'none'
          }}
        />
      </div>

      {error && (
        <span style={{
          fontSize: '12px',
          color: '#FF4444',
          marginTop: '4px'
        }}>
          {error}
        </span>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input