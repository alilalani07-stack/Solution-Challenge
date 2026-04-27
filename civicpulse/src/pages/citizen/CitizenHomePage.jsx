import { useNavigate } from 'react-router'
import { PlusCircle, Search, ArrowLeft } from 'lucide-react'
import PageTransition from '../../components/layout/PageTransition'
import Card from '../../components/ui/Card'
import { T } from '../../styles/tokens'

export default function CitizenHomePage() {
  const navigate = useNavigate()

  const cardStyle = {
    padding: '24px',
    cursor: 'pointer',
    border: `1px solid transparent`,
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  }

  return (
    <PageTransition style={{ backgroundColor: T.surface2, minHeight: '100vh' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px' }}>
        <button 
          onClick={() => navigate('/start')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '14px', 
            fontWeight: 500, 
            color: T.textSecondary, 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            marginBottom: '32px',
            padding: 0
          }}
          onMouseEnter={e => e.currentTarget.style.color = T.textPrimary}
          onMouseLeave={e => e.currentTarget.style.color = T.textSecondary}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <h1 style={{ fontFamily: T.fontDisplay, fontSize: '30px', fontWeight: 700, marginBottom: '8px', color: T.textPrimary }}>Citizen Portal</h1>
        <p style={{ color: T.textSecondary, marginBottom: '40px' }}>Submit a new request for help or track an existing one.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <Card 
            hoverable 
            style={cardStyle}
            onClick={() => navigate('/citizen/submit')}
          >
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              backgroundColor: `${T.primary}15`, 
              color: T.primary, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '16px',
              transition: 'all 0.2s'
            }}>
              <PlusCircle size={24} />
            </div>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Request Help</h2>
            <p style={{ fontSize: '14px', color: T.textSecondary }}>Fill out a quick form to let volunteers know what you need.</p>
          </Card>

          <Card 
            hoverable 
            style={cardStyle}
            onClick={() => navigate('/citizen/track')}
          >
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '50%', 
              backgroundColor: T.surface3, 
              color: T.textSecondary, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '16px',
              transition: 'all 0.2s'
            }}>
              <Search size={24} />
            </div>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Track Status</h2>
            <p style={{ fontSize: '14px', color: T.textSecondary }}>Enter your tracking ID to see updates on your request.</p>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
