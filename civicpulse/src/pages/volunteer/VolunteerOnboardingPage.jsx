import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  MapPin, 
  Phone, 
  User, 
  Mail, 
  ChevronRight, 
  Check, 
  ShieldCheck, 
  Clock, 
  Briefcase, 
  Languages,
  AlertCircle,
  Map as MapIcon
} from 'lucide-react'
import PageTransition from '../../components/layout/PageTransition'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import LocationSearch from '../../components/location/LocationSearch'
import { onboardingSchema } from '../../utils/validators'
import { useSession } from '../../hooks/useSession'
import { showError, showSuccess } from '../../components/ui/Toast'
import { updateVolunteerProfile } from '../../adapters/volunteerAdapter'
import { T } from '../../styles/tokens'

const SKILLS_OPTIONS = [
  'First Aid', 'Food Distribution', 'Transport / Driving', 
  'Elderly Assistance', 'Child Support', 'Medical Support', 
  'Crowd Coordination', 'Shelter Support', 'Supplies Handling', 
  'Translation', 'Counseling', 'General Volunteer'
]

const AVAILABILITY_OPTIONS = [
  { value: 'Available Now', label: 'Available Now' },
  { value: 'Available Part-Time', label: 'Available Part-Time' },
  { value: 'Weekends Only', label: 'Weekends Only' },
  { value: 'Temporarily Unavailable', label: 'Temporarily Unavailable' }
]

const EXPERIENCE_OPTIONS = [
  'Beginner', 'Some Experience', 'Experienced', 'Professional / Certified'
]

const COMMON_LANGUAGES = [
  'Telugu', 'Hindi', 'English', 'Urdu', 'Marathi', 'Gujarati'
]

const ALL_LANGUAGES = [
  'Assamese', 'Bengali', 'Bodo', 'Dogri', 'Gujarati', 'Hindi', 'Kannada', 
  'Kashmiri', 'Konkani', 'Maithili', 'Malayalam', 'Manipuri', 'Marathi', 
  'Nepali', 'Odia', 'Punjabi', 'Sanskrit', 'Santali', 'Sindhi', 'Tamil', 
  'Telugu', 'Urdu', 'English', 'French', 'Spanish', 'Arabic', 'German', 
  'Chinese', 'Japanese', 'Russian', 'Portuguese'
].sort()

export default function VolunteerOnboardingPage() {
  const navigate = useNavigate()
  const { user, setSession } = useSession()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showAllLanguages, setShowAllLanguages] = useState(false)

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      skills: [],
      languages: ['English'],
      availability: 'Available Now'
    }
  })

  const watchedSkills = watch('skills')
  const watchedLanguages = watch('languages')

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      const finalData = {
        ...data,
        onboarding_completed: true,
      }
      await updateVolunteerProfile(user.uid, finalData)
      
      // Update session
      setSession({
        role: 'volunteer',
        user: { ...user, ...finalData }
      })
      
      showSuccess('Profile completed! Welcome to the team.')
      navigate('/volunteer/dashboard', { replace: true })
    } catch (err) {
      console.error('Onboarding error:', err)
      showError('Failed to save profile.')
      setLoading(false)
    }
  }

  const toggleSkill = (skill) => {
    const current = watchedSkills || []
    if (current.includes(skill)) {
      setValue('skills', current.filter(s => s !== skill))
    } else {
      setValue('skills', [...current, skill])
    }
  }

  const toggleLanguage = (lang) => {
    const current = watchedLanguages || []
    if (current.includes(lang)) {
      setValue('languages', current.filter(l => l !== lang))
    } else {
      setValue('languages', [...current, lang])
    }
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('coords', {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setValue('location', `Current Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`)
        },
        () => showError('Unable to retrieve location.')
      )
    }
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ marginBottom: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: T.textPrimary, marginBottom: '4px' }}>Basic Information</h3>
              <p style={{ fontSize: '14px', color: T.textSecondary }}>Tell us who you are and how we can reach you.</p>
            </div>
            
            <Input 
              {...register('name')}
              label="Full Name"
              placeholder="Your full name"
              icon={User}
              error={errors.name?.message}
            />
            
            <Input 
              {...register('email')}
              label="Email Address"
              type="email"
              readOnly
              icon={Mail}
              style={{ backgroundColor: T.surface2 }}
              error={errors.email?.message}
            />
            
            <Input 
              {...register('phone')}
              label="Phone Number"
              placeholder="+91 XXXXX XXXXX"
              icon={Phone}
              error={errors.phone?.message}
            />

            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <LocationSearch 
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val.label)
                    setValue('coords', val.coords)
                  }}
                  error={errors.location?.message}
                />
              )}
            />

            <div style={{ position: 'relative', marginTop: '-12px' }}>
              <button 
                type="button"
                onClick={handleGetCurrentLocation}
                style={{
                  background: 'none', border: 'none', color: T.primary,
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <MapPin size={12} /> Or use Current GPS Location
              </button>
            </div>

            <Button 
              type="button" 
              fullWidth 
              size="lg" 
              onClick={() => setStep(2)}
              icon={ChevronRight}
              style={{ marginTop: '8px' }}
            >
              Next: Skills & Experience
            </Button>
          </div>
        )
      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ marginBottom: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: T.textPrimary, marginBottom: '4px' }}>Skills & Experience</h3>
              <p style={{ fontSize: '14px', color: T.textSecondary }}>Select areas where you can provide help.</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: T.textPrimary, marginBottom: '12px' }}>
                Skills / Help Areas (Select multiple)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SKILLS_OPTIONS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    style={{
                      padding: '8px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: 500,
                      cursor: 'pointer', transition: 'all 0.2s',
                      backgroundColor: watchedSkills?.includes(skill) ? T.primary : T.surface2,
                      color: watchedSkills?.includes(skill) ? 'white' : T.textSecondary,
                      border: `1px solid ${watchedSkills?.includes(skill) ? T.primary : T.border}`
                    }}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {errors.skills && <p style={{ color: T.danger, fontSize: '12px', marginTop: '4px' }}>{errors.skills.message}</p>}
            </div>

            <Input 
              {...register('other_skills')}
              label="Other Skills (Optional)"
              placeholder="Any other specific expertise?"
            />

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: T.textPrimary, marginBottom: '12px' }}>
                Experience Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {EXPERIENCE_OPTIONS.map(opt => (
                  <label key={opt} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                    borderRadius: T.radiusMd, border: `1px solid ${watch('experience_level') === opt ? T.primary : T.border}`,
                    cursor: 'pointer', backgroundColor: watch('experience_level') === opt ? `${T.primary}08` : 'transparent'
                  }}>
                    <input 
                      type="radio" 
                      value={opt} 
                      {...register('experience_level')}
                      style={{ accentColor: T.primary }}
                    />
                    <span style={{ fontSize: '14px', color: T.textPrimary }}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="secondary" fullWidth onClick={() => setStep(1)}>Back</Button>
              <Button fullWidth onClick={() => setStep(3)} icon={ChevronRight}>Next: Final Details</Button>
            </div>
          </div>
        )
      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ marginBottom: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: T.textPrimary, marginBottom: '4px' }}>Availability & Preferences</h3>
              <p style={{ fontSize: '14px', color: T.textSecondary }}>Almost done! Just a few more details.</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: T.textPrimary, marginBottom: '12px' }}>
                Availability Status
              </label>
              <select 
                {...register('availability')}
                style={{
                  width: '100%', padding: '12px', borderRadius: T.radiusMd, border: `1px solid ${T.border}`,
                  fontSize: '14px', color: T.textPrimary, outline: 'none', backgroundColor: T.surface
                }}
              >
                {AVAILABILITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: T.textPrimary, marginBottom: '12px' }}>
                Languages Spoken
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {COMMON_LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    style={{
                      padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 500,
                      cursor: 'pointer', transition: 'all 0.2s',
                      backgroundColor: watchedLanguages?.includes(lang) ? T.primaryLight : T.surface2,
                      color: watchedLanguages?.includes(lang) ? T.primary : T.textSecondary,
                      border: `1px solid ${watchedLanguages?.includes(lang) ? T.primary : T.border}`
                    }}
                  >
                    {lang}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowAllLanguages(!showAllLanguages)}
                  style={{
                    padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.2s',
                    backgroundColor: showAllLanguages ? T.primary : T.surface2,
                    color: showAllLanguages ? 'white' : T.textSecondary,
                    border: `1px solid ${showAllLanguages ? T.primary : T.border}`
                  }}
                >
                  {showAllLanguages ? 'Close List' : 'Other...'}
                </button>
              </div>

              {showAllLanguages && (
                <div style={{ 
                  marginTop: '16px', padding: '16px', backgroundColor: T.surface2, 
                  borderRadius: T.radiusMd, maxHeight: '180px', overflowY: 'auto',
                  display: 'flex', flexWrap: 'wrap', gap: '6px', border: `1px solid ${T.border}`
                }}>
                  {ALL_LANGUAGES.filter(l => !COMMON_LANGUAGES.includes(l)).map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      style={{
                        padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 500,
                        cursor: 'pointer', transition: 'all 0.2s',
                        backgroundColor: watchedLanguages?.includes(lang) ? T.primary : 'white',
                        color: watchedLanguages?.includes(lang) ? 'white' : T.textSecondary,
                        border: `1px solid ${watchedLanguages?.includes(lang) ? T.primary : T.border}`
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input 
                {...register('emergency_contact_name')}
                label="Emergency Contact Name"
                placeholder="Name"
              />
              <Input 
                {...register('emergency_contact_phone')}
                label="Emergency Contact Phone"
                placeholder="Phone"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: T.textPrimary, marginBottom: '8px' }}>
                Short Bio / Notes (Optional)
              </label>
              <textarea 
                {...register('bio')}
                placeholder="e.g. Can help evenings in Hyderabad west zone"
                style={{
                  width: '100%', padding: '12px', borderRadius: T.radiusMd, border: `1px solid ${T.border}`,
                  fontSize: '14px', color: T.textPrimary, outline: 'none', backgroundColor: T.surface,
                  minHeight: '80px', fontFamily: 'inherit', resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="secondary" fullWidth onClick={() => setStep(2)}>Back</Button>
              <Button fullWidth loading={loading} icon={Check}>Complete Profile</Button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <PageTransition>
      <div style={{ backgroundColor: T.surface2, minHeight: '100vh', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontFamily: T.fontDisplay, fontSize: '28px', fontWeight: 700, color: T.textPrimary }}>Volunteer Onboarding</h1>
            <p style={{ color: T.textSecondary, marginTop: '8px' }}>Help us match you with the right tasks.</p>
          </div>

          {/* Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 20px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 700,
                  backgroundColor: step >= i ? T.primary : T.border,
                  color: step >= i ? 'white' : T.textSecondary,
                  transition: 'all 0.3s'
                }}>
                  {step > i ? <Check size={14} /> : i}
                </div>
                <div style={{ flex: 1, height: '2px', backgroundColor: step > i ? T.primary : T.border, borderRadius: '2px' }} />
              </div>
            ))}
          </div>

          <div style={{ 
            backgroundColor: T.surface, borderRadius: T.radiusXl, boxShadow: T.shadowLg, 
            border: `1px solid ${T.border}`, padding: '32px', position: 'relative', overflow: 'hidden'
          }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              {renderStep()}
            </form>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: `${T.primary}08`, padding: '16px', borderRadius: T.radiusLg, border: `1px solid ${T.primary}20` }}>
            <ShieldCheck size={20} color={T.primary} style={{ marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: T.primary }}>Your privacy is important</h4>
              <p style={{ fontSize: '13px', color: T.textSecondary, marginTop: '4px', lineHeight: 1.5 }}>
                Your personal details are only shared with authorized emergency coordinators. 
                Other volunteers only see your name and skills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
