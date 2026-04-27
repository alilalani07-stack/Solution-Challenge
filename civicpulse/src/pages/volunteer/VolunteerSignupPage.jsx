import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, UserPlus } from 'lucide-react'
import PageTransition from '../../components/layout/PageTransition'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { signupSchema } from '../../utils/validators'
import { signupWithEmail, loginWithGoogle } from '../../firebase/auth'
import { useSession } from '../../hooks/useSession'
import { showError, showSuccess } from '../../components/ui/Toast'
import { createVolunteerProfile, fetchVolunteerProfile } from '../../adapters/volunteerAdapter'
import { T } from '../../styles/tokens'

export default function VolunteerSignupPage() {
  const navigate = useNavigate()
  const { setSession, isDemoMode } = useSession()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  })

  // Debug: log validation errors
  console.log('Form errors:', errors)

  const handleSignupSuccess = async (user, name) => {
  try {
    const profile = await createVolunteerProfile(user.uid, {
      name: name || user.displayName || 'Volunteer',
      email: user.email,
    })
    
    setSession({ role: 'volunteer', user: { ...user, ...profile } })
    showSuccess('Account created! Redirecting...')
    
    // ✅ CLEAR LOADING BEFORE NAVIGATION
    setLoading(false)
    setGoogleLoading(false)
    
    // Small delay to let toast render
    setTimeout(() => {
      navigate('/volunteer/onboarding', { replace: true })
    }, 300)
    
  } catch (err) {
    console.error('Profile creation error:', err)
    showError('Failed to create volunteer profile.')
    setLoading(false)
    setGoogleLoading(false)
  }
}

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      console.log('Submitting signup with:', data)
      const user = await signupWithEmail(data.email, data.password)
      await handleSignupSuccess(user, data.name)
    } catch (err) {
      console.error('Signup error:', err)
      showError(err.message || 'Failed to create account.')
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true)
      const user = await loginWithGoogle()
      const existingProfile = await fetchVolunteerProfile(user.uid)
      if (existingProfile) {
        setSession({ role: 'volunteer', user: { ...user, ...existingProfile } })
        navigate(existingProfile.onboarding_completed ? '/volunteer/dashboard' : '/volunteer/onboarding', { replace: true })
      } else {
        await handleSignupSuccess(user)
      }
    } catch (err) {
      console.error('Google signup error:', err)
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
            onClick={() => navigate('/volunteer/login')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, color: T.textSecondary, cursor: 'pointer', background: 'none', border: 'none', marginBottom: '32px' }}
          >
            <ArrowLeft size={16} /> Back to Login
          </button>

          <div style={{ backgroundColor: T.surface, borderRadius: T.radiusXl, boxShadow: T.shadowLg, border: `1px solid ${T.border}`, padding: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: T.primaryLight, color: T.primary, borderRadius: '50%', margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserPlus size={24} />
              </div>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: '24px', fontWeight: 700, color: T.textPrimary }}>Join CivicPulse</h2>
              <p style={{ fontSize: '14px', color: T.textSecondary, marginTop: '8px' }}>Become a volunteer and help your community during emergencies.</p>
            </div>

            {isDemoMode && (
              <div style={{ backgroundColor: T.warningLight, color: T.warning, padding: '12px', borderRadius: T.radiusMd, fontSize: '12px', fontWeight: 500, marginBottom: '24px', border: `1px solid rgba(255, 149, 0, 0.2)` }}>
                Demo mode active. Profiles will be stored in temporary memory.
              </div>
            )}

            {/* ✅ FORM WITH PROPER ON_SUBMIT */}
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input {...register('name')} label="Full Name" placeholder="John Doe" error={errors.name?.message} />
              <Input {...register('email')} label="Email address" type="email" placeholder="john@example.com" error={errors.email?.message} />
              <Input {...register('password')} label="Password" type="password" placeholder="••••••••" error={errors.password?.message} />
              <Input {...register('confirmPassword')} label="Confirm Password" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} />
              
              {/* ✅ BUTTON TYPE="submit" */}
              <Button type="submit" fullWidth size="lg" loading={loading} icon={UserPlus} style={{ marginTop: '8px' }}>
                Create Account
              </Button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: T.textSecondary }}>
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/volunteer/login')} style={{ background: 'none', border: 'none', color: T.primary, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                  Log in
                </button>
              </div>
            </form>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: `1px solid ${T.border}` }}>
              <Button variant="secondary" fullWidth onClick={handleGoogleSignup} loading={googleLoading} icon={() => (<svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', marginRight: '8px' }}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>)}>
                Sign up with Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}