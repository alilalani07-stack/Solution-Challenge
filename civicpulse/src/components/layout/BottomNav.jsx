import React from 'react'
import { useNavigate, useLocation } from 'react-router'
import { T } from '../../styles/tokens'
import { useSession } from '../../hooks/useSession'
import { Home, ClipboardList, LogOut } from 'lucide-react'

export default function BottomNav() {
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
        { label: 'Home', path: '/coordinator/dashboard', icon: Home },
        { label: 'Review', path: '/coordinator/review', icon: ClipboardList },
      ]
    }
    if (role === 'volunteer') {
      return [
        { label: 'Tasks', path: '/volunteer/dashboard', icon: ClipboardList },
      ]
    }
    return []
  }

  const links = getLinks()

  return (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'center', height: '100%' }}>
      {links.map(link => {
        const isActive = location.pathname.startsWith(link.path)
        const Icon = link.icon
        return (
          <button
            key={link.path}
            onClick={() => navigate(link.path)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
              border: 'none', background: 'transparent',
              color: isActive ? T.primary : T.textSecondary,
              cursor: 'pointer',
              padding: '8px',
              minWidth: '64px'
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: '11px', fontWeight: isActive ? 600 : 500 }}>
              {link.label}
            </span>
          </button>
        )
      })}
      
      <button
        onClick={handleLogout}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          border: 'none', background: 'transparent',
          color: T.urgent,
          cursor: 'pointer',
          padding: '8px',
          minWidth: '64px'
        }}
      >
        <LogOut size={20} />
        <span style={{ fontSize: '11px', fontWeight: 500 }}>
          Logout
        </span>
      </button>
    </div>
  )
}
