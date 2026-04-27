import React from 'react'
import { useNavigate, useLocation } from 'react-router'
import { T } from '../../styles/tokens'
import { useSession } from '../../hooks/useSession'
import { Home, ClipboardList, Settings, LogOut } from 'lucide-react'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { role, clearSession } = useSession()

  const handleLogout = () => {
    clearSession()
    navigate('/')
  }

  const getLinks = () => {
    if (role === 'coordinator') {
      return [
        { label: 'Dashboard', path: '/coordinator/dashboard', icon: Home },
        { label: 'Review Queue', path: '/coordinator/review', icon: ClipboardList },
      ]
    }
    if (role === 'volunteer') {
      return [
        { label: 'My Tasks', path: '/volunteer/dashboard', icon: ClipboardList },
      ]
    }
    return []
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '24px', borderBottom: `1px solid ${T.border}` }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: T.primary, fontFamily: T.fontDisplay }}>
          CivicPulse
        </h1>
        <p style={{ fontSize: '13px', color: T.textSecondary, marginTop: '4px' }}>
          {role === 'coordinator' ? 'Coordinator Panel' : 'Volunteer Portal'}
        </p>
      </div>

      <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {getLinks().map(link => {
          const isActive = location.pathname.startsWith(link.path)
          const Icon = link.icon
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px',
                borderRadius: T.radiusMd,
                border: 'none',
                background: isActive ? T.primaryLight : 'transparent',
                color: isActive ? T.primary : T.textSecondary,
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <Icon size={18} />
              {link.label}
            </button>
          )
        })}
      </nav>

      <div style={{ padding: '24px 16px', borderTop: `1px solid ${T.border}` }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px',
            borderRadius: T.radiusMd,
            border: 'none',
            background: 'transparent',
            color: T.urgent,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            width: '100%',
            textAlign: 'left'
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )
}
