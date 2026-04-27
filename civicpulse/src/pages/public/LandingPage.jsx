import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router'
import { ArrowRight, ShieldCheck, Clock, MapPin, Users, HeartHandshake, Zap, Check } from 'lucide-react'
import Button from '../../components/ui/Button'
import PageTransition from '../../components/layout/PageTransition'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import { T } from '../../styles/tokens'
import useIsMobile from '../../hooks/useIsMobile'

export default function LandingPage() {
  const isMobile = useIsMobile(768)
  const navigate = useNavigate()
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, 200])

  return (
    <PageTransition>
      <div style={{ backgroundColor: T.surface, minHeight: '100vh', width: '100%' }}>
        {/* Navbar */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${T.border}`,
          zIndex: 50
        }}>
          <div style={{
            maxWidth: '1280px', margin: '0 auto', padding: '0 24px',
            height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.white }}>
                <svg viewBox="0 0 32 32" fill="none" style={{ width: '20px', height: '20px' }}>
                  <circle cx="16" cy="16" r="14" fill="currentColor"/>
                  <path d="M16 8C11.58 8 8 11.58 8 16s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="white"/>
                  <circle cx="16" cy="16" r="2.5" fill="white"/>
                  <path d="M16 10v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '20px', letterSpacing: '-0.5px' }}>CivicPulse</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Button variant="ghost" onClick={() => navigate('/volunteer/login')}>Login</Button>
              <Button onClick={() => navigate('/start')}>Get Started</Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section style={{
          paddingTop: '128px', paddingBottom: '80px',
          minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <div style={{
            maxWidth: '1280px', margin: '0 auto', padding: '0 24px',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center'
          }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div style={{ marginBottom: '24px' }}>
                <Badge variant="status" value="Live Platform" />
              </div>
              <h1 style={{
                fontFamily: T.fontDisplay, fontSize: '64px', fontWeight: 700,
                lineHeight: 1.05, letterSpacing: '-1px', color: T.textPrimary, marginBottom: '24px'
              }}>
                Help arrives faster when communities connect.
              </h1>
              <p style={{ fontSize: '18px', color: T.textSecondary, marginBottom: '32px', maxWidth: '500px', lineHeight: 1.6 }}>
                CivicPulse connects citizens in need with nearby volunteers — instantly structured, intelligently matched, tracked to resolution.
              </p>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', flexWrap: 'wrap' }}>
                <Button size="lg" onClick={() => navigate('/citizen/submit')} icon={ArrowRight}>
                  Get Help Now
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/volunteer/login')}>
                  I'm a Volunteer
                </Button>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '14px', fontWeight: 500, color: T.textSecondary, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={18} color={T.success} /> Verified Volunteers</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} color={T.warning} /> &lt; 5min Response</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} color={T.primary} /> GPS-Matched</div>
              </div>
            </motion.div>

            {/* Mockup */}
            <motion.div style={{ y, position: 'relative', height: '500px', display: isMobile ? 'none' : 'block'}}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{
                  position: 'absolute', top: '40px', right: '40px', width: '340px',
                  backgroundColor: T.white, padding: '20px', borderRadius: T.radiusLg,
                  boxShadow: T.shadowLg, border: `1px solid ${T.border}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <Badge variant="status" value="matched" />
                  <span style={{ fontSize: '12px', color: T.textTertiary }}>Just now</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Emergency Medical Transport</h3>
                <p style={{ fontSize: '14px', color: T.textSecondary, marginBottom: '16px' }}>Require immediate vehicle transport to City Hospital for elderly patient...</p>
                
                <div style={{ backgroundColor: T.surface2, padding: '12px', borderRadius: T.radiusMd, display: 'flex', alignItems: 'center', gap: '12px', border: `1px solid ${T.border}` }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: T.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.primary, fontWeight: 700 }}>
                    PS
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>Priya Sharma <Badge variant="tier" value="1" /></p>
                    <p style={{ fontSize: '12px', color: T.textTertiary, display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={10} /> 1.2 km away • ETA 4 mins</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section style={{ padding: '64px 0', backgroundColor: T.surface, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
          <div style={{
            maxWidth: '1280px', margin: '0 auto', padding: '0 24px',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px'
          }}>
            <StatCard value="3,200" label="Needs Resolved" icon={HeartHandshake} color={T.primary} />
            <StatCard value="1,800" label="Active Volunteers" icon={Users} color={T.success} />
            <StatCard value="94%" label="Match Rate" icon={Zap} color={T.warning} />
            <StatCard value="8 min" label="Avg Response" icon={Clock} color="#8B5CF6" />
          </div>
        </section>

        {/* Roles Section */}
        <section style={{ padding: '96px 0', backgroundColor: T.surface2 }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>How will you participate?</h2>
            <p style={{ color: T.textSecondary, marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px auto' }}>CivicPulse relies on a coordinated network. Choose your role to get started.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <Card padding="32px">
                <div style={{ width: '64px', height: '64px', backgroundColor: T.primaryLight, color: T.primary, borderRadius: T.radiusLg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                  <HeartHandshake size={32} />
                </div>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Citizen</h3>
                <p style={{ color: T.textSecondary, marginBottom: '32px', minHeight: '60px' }}>Submit a request for help. Our AI will route it to the nearest capable volunteers instantly.</p>
                <Button fullWidth onClick={() => navigate('/citizen/submit')}>Request Help</Button>
              </Card>

              <Card padding="32px">
                <div style={{ width: '64px', height: '64px', backgroundColor: T.successLight, color: T.success, borderRadius: T.radiusLg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                  <Users size={32} />
                </div>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Volunteer</h3>
                <p style={{ color: T.textSecondary, marginBottom: '32px', minHeight: '60px' }}>Get notified about needs in your area. Accept tasks, help out, and mark them resolved.</p>
                <Button fullWidth variant="secondary" onClick={() => navigate('/volunteer/login')}>Sign In</Button>
              </Card>

              <Card padding="32px">
                <div style={{ width: '64px', height: '64px', backgroundColor: '#F3F0FF', color: '#7C3AED', borderRadius: T.radiusLg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
                  <ShieldCheck size={32} />
                </div>
                <h3 style={{ fontFamily: T.fontDisplay, fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Coordinator</h3>
                <p style={{ color: T.textSecondary, marginBottom: '32px', minHeight: '60px' }}>Manage operations, review critical escalations, and oversee the matching engine.</p>
                <Button fullWidth variant="ghost" onClick={() => navigate('/coordinator/login')}>Coordinator Access</Button>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ backgroundColor: T.surface, borderTop: `1px solid ${T.border}`, padding: '48px 0' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: T.textTertiary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.white }}>
                <svg viewBox="0 0 32 32" fill="none" style={{ width: '12px', height: '12px' }}><circle cx="16" cy="16" r="14" fill="currentColor"/></svg>
              </div>
              <span style={{ fontFamily: T.fontDisplay, fontWeight: 700, color: T.textSecondary }}>CivicPulse</span>
            </div>
            <p style={{ fontSize: '14px', color: T.textTertiary }}>© 2026 CivicPulse Initiative. Open Source.</p>
          </div>
        </footer>
      </div>
    </PageTransition>
  )
}
