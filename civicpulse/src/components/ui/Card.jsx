import React, { useState } from 'react'

export default function Card({ children, padding, shadow, hover, onClick, style }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #E8EAED',
        boxShadow: isHovered && hover 
          ? '0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)' 
          : '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transform: isHovered && hover ? 'translateY(-2px)' : 'none',
        padding: padding || '24px',
        ...style
      }}
    >
      {children}
    </div>
  )
}
