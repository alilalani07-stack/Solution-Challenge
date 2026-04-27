import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, LogIn, ShieldAlert } from 'lucide-react'
import PageTransition from '../../components/layout/PageTransition'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { loginSchema } from '../../utils/validators'
import { loginWithEmail } from '../../firebase/auth'
import { useSession } from '../../hooks/useSession'
import { showError, showSuccess } from '../../components/ui/Toast'
import { T } from '../../styles/tokens'

export default function CoordinatorLoginPage() {
  const navigate = useNavigate()
  const { setSession, isDemoMode } = useSession()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const user = await loginWithEmail(data.email, data.password)
      // Hardcode admin role assignment for this prototype
      setSession({ 
        role: 'coordinator', 
        user: { ...user, name: 'Coordinator Admin' } 
      })
      showSuccess('Coordinator access granted')
      // USE REPLACE: TRUE
      navigate('/coordinator/dashboard', { replace: true })
    } catch (err) {
      showError(err.message || 'Invalid credentials.')
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div style={{ backgroundColor: T.surface3, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 16px' }}>
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

          <div style={{ backgroundColor: T.surface, borderRadius: T.radiusXl, boxShadow: T.shadowLg, border: `1px solid ${T.border}`, padding: '32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', backgroundColor: '#8B5CF6' }} />
            
            <div style={{ textAlign: 'center', marginBottom: '32px', paddingTop: '16px' }}>
              <div style={{ width: '56px', height: '56px', backgroundColor: '#F3F0FF', color: '#8B5CF6', borderRadius: '16px', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.shadowSm }}>
                <ShieldAlert size={28} />
              </div>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: '24px', fontWeight: 700, color: T.textPrimary }}>Coordinator Access</h2>
              <p style={{ fontSize: '14px', color: T.textSecondary, marginTop: '8px' }}>Sign in to manage operations and queue.</p>
            </div>

            {isDemoMode && (
              <div style={{ backgroundColor: '#F3F0FF', color: '#6D28D9', border: '1px solid #DDD6FE', borderRadius: T.radiusMd, marginBottom: '24px', padding: '12px', fontSize: '12px', textAlign: 'center', fontWeight: 500 }}>
                Demo mode active. Use any email/password.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input 
                {...register('email')}
                label="Admin Email"
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

              <div style={{ marginTop: '8px' }}>
                <Button type="submit" fullWidth size="lg" loading={loading} icon={LogIn} style={{ backgroundColor: '#8B5CF6' }}>
                  Authenticate
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
