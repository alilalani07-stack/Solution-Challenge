import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Save, User, Phone, MapPin, Check } from 'lucide-react'
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
  'Available Now', 'Available Part-Time', 'Weekends Only', 'Temporarily Unavailable'
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

export default function VolunteerProfilePage() {
  const navigate = useNavigate()
  const { user, setSession } = useSession()
  const [loading, setLoading] = useState(false)
  const [showAllLanguages, setShowAllLanguages] = useState(false)

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      coords: user?.coords || null,
      availability: user?.availability || 'Available Now',
      skills: user?.skills || [],
      other_skills: user?.other_skills || '',
      experience_level: user?.experience_level || 'Beginner',
      emergency_contact_name: user?.emergency_contact_name || '',
      emergency_contact_phone: user?.emergency_contact_phone || '',
      languages: user?.languages || ['English'],
      bio: user?.bio || ''
    }
  })

  const watchedSkills = watch('skills')
  const watchedLanguages = watch('languages')

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      await updateVolunteerProfile(user.uid, data)
      
      setSession({
        role: 'volunteer',
        user: { ...user, ...data }
      })
      
      showSuccess('Profile updated successfully!')
      navigate('/volunteer/dashboard')
    } catch (err) {
      console.error('Update profile error:', err)
      showError('Failed to update profile.')
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

  return (
    <PageTransition>
      <div style={{ backgroundColor: T.surface2, minHeight: '100%', paddingBottom: '80px' }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${T.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => navigate('/volunteer/dashboard')}
              style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '18px' }}>Edit Profile</h1>
          </div>
          <Button size="sm" onClick={handleSubmit(onSubmit)} loading={loading} icon={Save}>Save</Button>
        </div>

        <div style={{ maxWidth: '600px', margin: '24px auto', padding: '0 16px' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Section: Basic Info */}
            <div style={{ backgroundColor: T.white, borderRadius: T.radiusLg, padding: '24px', border: `1px solid ${T.border}`, boxShadow: T.shadowSm }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: T.textPrimary }}>Basic Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Input {...register('name')} label="Full Name" icon={User} error={errors.name?.message} />
                <Input {...register('phone')} label="Phone Number" icon={Phone} error={errors.phone?.message} />
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
              </div>
            </div>

            {/* Section: Skills */}
            <div style={{ backgroundColor: T.white, borderRadius: T.radiusLg, padding: '24px', border: `1px solid ${T.border}`, boxShadow: T.shadowSm }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: T.textPrimary }}>Skills & Expertise</h3>
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
            </div>

            {/* Section: Availability & Languages */}
            <div style={{ backgroundColor: T.white, borderRadius: T.radiusLg, padding: '24px', border: `1px solid ${T.border}`, boxShadow: T.shadowSm }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: T.textPrimary }}>Availability & Languages</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: T.textSecondary, marginBottom: '8px' }}>Availability Status</label>
                  <select 
                    {...register('availability')}
                    style={{ width: '100%', padding: '12px', borderRadius: T.radiusMd, border: `1px solid ${T.border}`, fontSize: '15px', outline: 'none' }}
                  >
                    {AVAILABILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: T.textSecondary, marginBottom: '8px' }}>Languages</label>
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
              </div>
            </div>

            {/* Section: Bio */}
            <div style={{ backgroundColor: T.white, borderRadius: T.radiusLg, padding: '24px', border: `1px solid ${T.border}`, boxShadow: T.shadowSm }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: T.textPrimary }}>Bio / Notes</h3>
              <textarea 
                {...register('bio')}
                style={{ width: '100%', padding: '12px', borderRadius: T.radiusMd, border: `1px solid ${T.border}`, fontSize: '15px', minHeight: '120px', outline: 'none', resize: 'vertical' }}
                placeholder="Tell us more about yourself..."
              />
            </div>

            <Button fullWidth size="lg" loading={loading} icon={Save}>Save All Changes</Button>
          </form>
        </div>
      </div>
    </PageTransition>
  )
}
