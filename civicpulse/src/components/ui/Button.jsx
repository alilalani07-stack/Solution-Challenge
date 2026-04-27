import React, { useState } from 'react'
import { T } from '../../styles/tokens'

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  onClick,
  children,
  fullWidth,
  icon: Icon
}) {
  const [isHovered, setIsHovered] = useState(false)

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          background: isHovered ? '#E8EAED' : '#F0F2F5',
          color: '#0F1117',
        }
      case 'ghost':
        return {
          background: isHovered ? '#F0F2F5' : 'transparent',
          color: '#6B7280',
        }
      case 'danger':
        return {
          background: isHovered ? '#FF4444' : '#FFF0F0',
          color: isHovered ? '#FFFFFF' : '#FF4444',
        }
      case 'primary':
      default:
        return {
          background: isHovered ? '#0040CC' : '#0057FF',
          color: '#FFFFFF',
        }
    }
  }

  // Size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { padding: '8px 16px', fontSize: '13px' }
      case 'lg': return { padding: '14px 28px', fontSize: '16px' }
      case 'md':
      default: return { padding: '12px 20px', fontSize: '14px' }
    }
  }

  return (
    <button
      onClick={disabled || loading ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled || loading}
      style={{
        border: 'none',
        borderRadius: '10px',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        opacity: disabled || loading ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        ...getVariantStyles(),
        ...getSizeStyles(),
      }}
    >
      {loading ? (
        <>
          <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
          </svg>
          Loading...
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
          {children}
        </>
      )}
    </button>
  )
}
