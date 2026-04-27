import { T } from '../../styles/tokens'
import BottomNav from './BottomNav'

export default function MobileShell({ children }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      minHeight: '100vh',
      backgroundColor: T.surface2,
    }}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: T.bottomNavH,
      }}>
        {children}
      </div>
      <nav style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: T.bottomNavH,
        backgroundColor: T.white,
        borderTop: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
      }}>
        <BottomNav />
      </nav>
    </div>
  )
}
