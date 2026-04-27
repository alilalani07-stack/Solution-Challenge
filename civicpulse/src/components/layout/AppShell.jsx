import { T } from '../../styles/tokens'
import Sidebar from './Sidebar'

export default function AppShell({ children }) {
  return (
    <div style={{
      display: 'flex',
      width: '100%',
      minHeight: '100vh',
      backgroundColor: T.surface2,
    }}>
      {/* Fixed sidebar */}
      <aside style={{
        position: 'fixed',
        top: 0, left: 0,
        width: T.sidebarW,
        height: '100vh',
        backgroundColor: T.white,
        borderRight: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        overflowY: 'auto',
      }}>
        <Sidebar />
      </aside>

      {/* Content area pushed right of sidebar */}
      <div style={{
        marginLeft: T.sidebarW,
        flex: 1,
        minHeight: '100vh',
        backgroundColor: T.surface2,
        overflowY: 'auto',
      }}>
        {children}
      </div>
    </div>
  )
}
