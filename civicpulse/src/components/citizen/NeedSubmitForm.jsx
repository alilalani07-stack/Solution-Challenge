import { useState, forwardRef } from 'react' // Added forwardRef
import { motion, AnimatePresence } from 'framer-motion'
import { useForm as useRHForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles, MapPin, Search, Plus, Minus, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { needFormSchema } from '../../utils/validators'
import { CATEGORIES } from '../../constants/categories'
import { URGENCY_LEVELS } from '../../constants/urgencyLevels'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import LocationSearchInput from '../location/LocationSearchInput'
import MapPreview from '../location/MapPreview'
import { T } from '../../styles/tokens'

// Fixed Textarea using forwardRef to handle React Hook Form refs
const Textarea = forwardRef(({ label, error, ...props }, ref) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '16px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 600, color: T.textSecondary, marginBottom: '6px' }}>{label}</label>}
      <textarea
        {...props}
        ref={ref} // Attach the ref here
        style={{
          width: '100%', padding: '12px 16px', border: `1.5px solid ${error ? T.urgent : T.border}`,
          borderRadius: T.radiusMd, fontSize: '14px', fontFamily: T.fontBody, background: T.white,
          color: T.textPrimary, outline: 'none', resize: 'vertical', minHeight: '100px', ...props.style
        }}
      />
      {error && <span style={{ fontSize: '12px', color: T.urgent, marginTop: '4px' }}>{error}</span>}
    </div>
  )
})

Textarea.displayName = 'Textarea'

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir < 0 ? 50 : -50, opacity: 0 }),
}

export default function NeedSubmitForm({ onSubmit, loading }) {
  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)
  const [locMode, setLocMode] = useState('search')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useRHForm({
    resolver: zodResolver(needFormSchema),
    defaultValues: {
      category: '',
      urgency: '',
      quantity: 1,
      anonymous: false,
    }
  })

  const formValues = watch()

  const nextStep = async () => {
    if (step === 1) {
      if (!formValues.description || formValues.description.length < 10) return
      if (!formValues.category || !formValues.urgency) return
    }
    if (step === 2) {
      if (!formValues.location_hint) return
    }
    setDir(1)
    setStep(s => s + 1)
  }

  const prevStep = () => {
    setDir(-1)
    setStep(s => s - 1)
  }

  const handleUseLocation = () => {
    setLocMode('gps')
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          setValue('location_coords', { lat: pos.coords.latitude, lng: pos.coords.longitude })
          setValue('location_hint', `Current Location (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`)
        },
        () => {
          setLocMode('manual')
          alert('Could not access location. Please enter manually.')
        }
      )
    }
  }

  return (
    <div style={{ backgroundColor: T.surface, borderRadius: T.radiusXl, boxShadow: T.shadowLg, overflow: 'hidden', border: `1px solid ${T.border}` }}>
      {/* Header */}
      <div style={{ backgroundColor: T.surface2, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, transition: 'all 0.3s ease',
                backgroundColor: step === i ? T.primary : step > i ? T.success : T.surface,
                color: step >= i ? T.white : T.textTertiary,
                border: step < i ? `1px solid ${T.border}` : 'none',
                boxShadow: step === i ? `0 0 0 4px ${T.primaryLight}` : 'none'
              }}>
                {step > i ? '✓' : i}
              </div>
              {i < 3 && (
                <div style={{ width: '32px', height: '4px', margin: '0 4px', borderRadius: '2px', backgroundColor: step > i ? T.success : T.border }} />
              )}
            </div>
          ))}
        </div>
        <span style={{ fontSize: '14px', fontWeight: 500, color: T.textSecondary }}>Step {step} of 3</span>
      </div>

      {/* Body */}
      <div style={{ padding: '32px', minHeight: '400px', position: 'relative' }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ width: '100%' }}
          >
            {/* STEP 1 */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div>
                  <h2 style={{ fontFamily: T.fontDisplay, fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>What do you need help with?</h2>
                  <p style={{ color: T.textSecondary, fontSize: '14px', marginBottom: '16px' }}>Provide as much detail as possible so volunteers know how to prepare.</p>
                  <Textarea 
                    {...register('description')}
                    placeholder="E.g., I need someone to pick up groceries for my elderly neighbor..."
                    error={errors.description?.message}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', fontWeight: 500, color: T.primary }}>
                    <Sparkles size={14} /> Our system will automatically structure this ✦
                  </div>
                </div>

                <div>
                  <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>Category <span style={{ color: T.urgent }}>*</span></p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id} type="button" onClick={() => setValue('category', cat.id)}
                        style={{
                          padding: '12px', borderRadius: T.radiusMd, border: `1px solid ${formValues.category === cat.id ? T.primary : T.border}`,
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer',
                          backgroundColor: formValues.category === cat.id ? T.primaryLight : T.surface,
                          color: formValues.category === cat.id ? T.primary : T.textSecondary
                        }}
                      >
                        <span style={{ fontSize: '24px' }}>{cat.icon}</span>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.category && <p style={{ color: T.urgent, fontSize: '12px', marginTop: '4px' }}>{errors.category.message}</p>}
                </div>

                <div>
                  <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>Urgency <span style={{ color: T.urgent }}>*</span></p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    {URGENCY_LEVELS.map(level => (
                      <button
                        key={level.id} type="button" onClick={() => setValue('urgency', level.id)}
                        style={{
                          padding: '16px', borderRadius: T.radiusMd, border: `1px solid ${formValues.urgency === level.id ? level.color : T.border}`,
                          textAlign: 'left', cursor: 'pointer', backgroundColor: formValues.urgency === level.id ? level.bg : T.surface
                        }}
                      >
                        <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: formValues.urgency === level.id ? level.color : T.textPrimary }}>{level.label}</p>
                        <p style={{ fontSize: '12px', color: formValues.urgency === level.id ? level.color : T.textTertiary, opacity: 0.8 }}>{level.description}</p>
                      </button>
                    ))}
                  </div>
                  {errors.urgency && <p style={{ color: T.urgent, fontSize: '12px', marginTop: '4px' }}>{errors.urgency.message}</p>}
                </div>

                <div>
                  <p style={{ fontWeight: 700, fontSize: '14px', marginBottom: '12px' }}>People needing help</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button type="button" onClick={() => setValue('quantity', Math.max(1, formValues.quantity - 1))} style={{ width: '40px', height: '40px', borderRadius: '50%', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.surface, cursor: 'pointer' }}><Minus size={18} /></button>
                    <span style={{ fontFamily: T.fontDisplay, fontSize: '24px', fontWeight: 700, width: '32px', textAlign: 'center' }}>{formValues.quantity}</span>
                    <button type="button" onClick={() => setValue('quantity', formValues.quantity + 1)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.surface, cursor: 'pointer' }}><Plus size={18} /></button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h2 style={{ fontFamily: T.fontDisplay, fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Where do you need help?</h2>
                  <p style={{ color: T.textSecondary, fontSize: '14px', marginBottom: '24px' }}>Accurate location helps us find the closest volunteers to assist you quickly.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <button type="button" onClick={handleUseLocation} style={{ padding: '16px', borderRadius: T.radiusMd, border: `1px solid ${locMode === 'gps' ? T.primary : T.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', background: locMode === 'gps' ? T.primaryLight : T.surface, color: locMode === 'gps' ? T.primary : T.textSecondary }}>
                    <MapPin size={24} /> <span style={{ fontSize: '14px', fontWeight: 600 }}>Use My Location</span>
                  </button>
                  <button type="button" onClick={() => setLocMode('search')} style={{ padding: '16px', borderRadius: T.radiusMd, border: `1px solid ${locMode === 'search' ? T.primary : T.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', background: locMode === 'search' ? T.primaryLight : T.surface, color: locMode === 'search' ? T.primary : T.textSecondary }}>
                    <Search size={24} /> <span style={{ fontSize: '14px', fontWeight: 600 }}>Search Area</span>
                  </button>
                  <button type="button" onClick={() => setLocMode('manual')} style={{ padding: '16px', borderRadius: T.radiusMd, border: `1px solid ${locMode === 'manual' ? T.primary : T.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', background: locMode === 'manual' ? T.primaryLight : T.surface, color: locMode === 'manual' ? T.primary : T.textSecondary }}>
                    <MapPin size={24} /> <span style={{ fontSize: '14px', fontWeight: 600 }}>Enter Manually</span>
                  </button>
                </div>

                {locMode === 'search' && (
                  <div style={{ marginBottom: '24px' }}>
                    <LocationSearchInput onSelect={(item) => { setValue('location_hint', item.displayName); setValue('location_coords', { lat: item.lat, lng: item.lng }) }} placeholder="Search for your neighborhood or landmark..." />
                  </div>
                )}

                {locMode === 'manual' && (
                  <div style={{ marginBottom: '24px' }}>
                    <Textarea {...register('location_hint')} label="Address or Location Details" error={errors.location_hint?.message} />
                  </div>
                )}

                {(formValues.location_hint || formValues.location_coords) && (
                  <div style={{ marginTop: '24px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: T.textSecondary, marginBottom: '8px' }}>Selected Location:</p>
                    <div style={{ backgroundColor: T.surface2, padding: '12px', borderRadius: T.radiusMd, marginBottom: '16px', fontSize: '14px', fontWeight: 500, border: `1px solid ${T.border}` }}>
                      {formValues.location_hint}
                    </div>
                    {formValues.location_coords && (
                      <MapPreview lat={formValues.location_coords.lat} lng={formValues.location_coords.lng} height="240px" />
                    )}
                  </div>
                )}
                {errors.location_hint && !formValues.location_hint && <p style={{ color: T.urgent, fontSize: '14px' }}>Please select or enter a location to continue.</p>}
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h2 style={{ fontFamily: T.fontDisplay, fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>How can we reach you?</h2>
                  <p style={{ color: T.textSecondary, fontSize: '14px', marginBottom: '24px' }}>Optional. Providing contact info helps volunteers coordinate with you faster.</p>
                </div>

                <div style={{ backgroundColor: T.surface2, padding: '16px', borderRadius: T.radiusLg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '14px' }}>Submit Anonymously</p>
                    <p style={{ fontSize: '12px', color: T.textTertiary }}>Volunteers won't see any contact details. You must use your Tracking ID to check status.</p>
                  </div>
                  <input type="checkbox" {...register('anonymous')} style={{ width: '24px', height: '24px', accentColor: T.primary }} />
                </div>

                {!formValues.anonymous && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                    <Input {...register('contact_phone')} label="Phone Number" type="tel" placeholder="+91 98765 43210" />
                    <Input {...register('contact_email')} label="Email Address" type="email" error={errors.contact_email?.message} />
                  </div>
                )}

                <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${T.border}` }}>
                  <h3 style={{ fontWeight: 700, fontSize: '14px', color: T.textSecondary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Request Summary</h3>
                  <Card padding="16px" style={{ backgroundColor: T.surface2 }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <Badge variant="status" value={formValues.category || 'general'} />
                      <Badge variant="urgency" value={formValues.urgency || 'low'} />
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: T.textPrimary, marginBottom: '8px' }}>{formValues.description}</p>
                    <p style={{ fontSize: '12px', color: T.textTertiary, display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {formValues.location_hint}</p>
                  </Card>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Nav */}
      <div style={{ backgroundColor: T.surface, borderTop: `1px solid ${T.border}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {step > 1 ? (
          <Button variant="ghost" onClick={prevStep} disabled={loading} icon={ArrowLeft}>Back</Button>
        ) : <div />}

        {step < 3 ? (
          <Button onClick={nextStep} icon={ArrowRight}>Next Step</Button>
        ) : (
          <Button onClick={handleSubmit(onSubmit)} loading={loading} icon={CheckCircle2}>Submit Request</Button>
        )}
      </div>
    </div>
  )
}