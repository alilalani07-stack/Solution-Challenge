import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, LogIn } from 'lucide-react'
import PageTransition from '../../components/layout/PageTransition'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { loginSchema } from '../../utils/validators'
import { loginWithEmail, loginWithGoogle } from '../../firebase/auth'
import { useSession } from '../../hooks/useSession'
import { showError, showSuccess } from '../../components/ui/Toast'
import { fetchVolunteerProfile } from '../../adapters/volunteerAdapter'
import { T } from '../../styles/tokens'

export default function VolunteerLoginPage() {
  const navigate = useNavigate()
  const { setSession, isDemoMode } = useSession()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const handleLoginSuccess = async (user) => {
    try {
      const profile = await fetchVolunteerProfile(user.uid)
      setSession({ 
        role: 'volunteer', 
        user: { ...user, ...profile } 
      })
      showSuccess('Welcome back!')
      navigate('/volunteer/dashboard', { replace: true })
    } catch (err) {
      showError('Failed to fetch profile data.')
      setLoading(false)
      setGoogleLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const user = await loginWithEmail(data.email, data.password)
      await handleLoginSuccess(user)
    } catch (err) {
      console.error('Login error:', err)
      showError(err.message || 'Invalid email or password.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true)
      const user = await loginWithGoogle()
      await handleLoginSuccess(user)
    } catch (err) {
      console.error('Google login error:', err)
      if (err.code !== 'auth/popup-closed-by-user') {
        showError('Google sign in failed.')
      }
      setGoogleLoading(false)
    }
  }

  return (
    <PageTransition>
      <div style={{ backgroundColor: T.surface2, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 16px' }}>
        <div style={{ width: '100%', maxWidth: '448px', margin: '0 auto' }}>
          <button 
            onClick={() => navigate('/start')} 
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500,
              color: T.textSecondary, cursor: 'pointer', background: 'none', border: 'none', marginBottom: '32px'
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div style={{ backgroundColor: T.surface, borderRadius: T.radiusXl, boxShadow: T.shadowLg, border: `1px solid ${T.border}`, padding: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '48px', height: '48px', backgroundColor: T.successLight, color: T.success, borderRadius: '50%',
                margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <svg viewBox="0 0 32 32" fill="none" style={{ width: '24px', height: '24px' }}>
                  <circle cx="16" cy="16" r="14" fill="currentColor"/>
                  <path d="M16 8C11.58 8 8 11.58 8 16s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="white"/>
                  <circle cx="16" cy="16" r="2.5" fill="white"/>
                  <path d="M16 10v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: '24px', fontWeight: 700, color: T.textPrimary }}>Welcome back, volunteer.</h2>
              <p style={{ fontSize: '14px', color: T.textSecondary, marginTop: '8px' }}>Sign in to view your tasks and help your community.</p>
            </div>

            {isDemoMode && (
              <div style={{ backgroundColor: T.warningLight, color: T.warning, padding: '12px', borderRadius: T.radiusMd, fontSize: '12px', fontWeight: 500, marginBottom: '24px', border: `1px solid rgba(255, 149, 0, 0.2)` }}>
                Demo mode active. Use any email/password to sign in as a mock volunteer.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input 
                {...register('email')}
                label="Email address"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
              />
              <Input 
                {...register('password')}
                label="Password"
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
              />
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: T.primary, width: '16px', height: '16px' }} />
                  <span style={{ color: T.textSecondary }}>Remember me</span>
                </label>
                <a href="#" style={{ fontWeight: 500, color: T.primary, textDecoration: 'none' }}>Forgot password?</a>
              </div>

              <Button type="submit" fullWidth size="lg" loading={loading} icon={LogIn}>
                Sign In
              </Button>
            </form>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${T.border}` }}>
              <Button 
                variant="secondary" 
                fullWidth 
                onClick={handleGoogleLogin} 
                loading={googleLoading}
                icon={() => (
                  <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', marginRight: '8px' }}>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
              >
                Sign in with Google
              </Button>
            </div>

            {/* 👇 NEW SECTION ADDED */}
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: T.textSecondary }}>
              New volunteer?{' '}
              <button
                type="button"
                onClick={() => navigate('/volunteer/signup')}
                style={{ background: 'none', border: 'none', color: T.primary, fontWeight: 600, cursor: 'pointer', padding: 0 }}
              >
                Create account
              </button>
            </div>

          </div>
        </div>
      </div>
    </PageTransition>
  )
}