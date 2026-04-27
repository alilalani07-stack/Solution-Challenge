import { useState, forwardRef } from 'react'
import { useForm as useRHForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle } from 'lucide-react'
import { resolutionSchema } from '../../utils/validators'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { T } from '../../styles/tokens'

// ✅ FIXED: Wrap with forwardRef to properly handle react-hook-form refs
const Textarea = forwardRef(function Textarea({ label, error, ...props }, ref) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '16px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 600, color: T.textSecondary, marginBottom: '6px' }}>{label}</label>}
      <textarea
        ref={ref}  // ✅ Forward the ref here
        {...props}
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

export default function ResolutionForm({ task, onSubmit, onCancel }) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useRHForm({
    resolver: zodResolver(resolutionSchema),
    defaultValues: {
      people_helped: task?.need?.quantity || 1,
      duration_minutes: 60,
    }
  })

  const handleFormSubmit = async (data) => {
    try {
      setLoading(true)
      await onSubmit(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <p style={{ fontSize: '14px', color: T.textSecondary, marginBottom: '16px' }}>
          Please provide a brief summary of the resolution to help us maintain quality and track impact.
        </p>
      </div>

      <Textarea 
        {...register('outcome')}
        label="Outcome & Actions Taken"
        placeholder="Briefly describe what you did to help..."
        error={errors.outcome?.message}
      />

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <Input 
            {...register('duration_minutes', { valueAsNumber: true })}
            type="number"
            label="Time Spent (min)"
            error={errors.duration_minutes?.message}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Input 
            {...register('people_helped', { valueAsNumber: true })}
            type="number"
            label="People Helped"
            error={errors.people_helped?.message}
          />
        </div>
      </div>

      <Input 
        {...register('resources_used')}
        label="Resources Used (optional)"
        placeholder="E.g., Medical kit, transportation..."
      />

      <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', marginTop: '24px', borderTop: `1px solid ${T.border}` }}>
        <div style={{ flex: 1 }}><Button type="button" variant="ghost" onClick={onCancel} fullWidth>Cancel</Button></div>
        <div style={{ flex: 1 }}><Button type="submit" loading={loading} icon={CheckCircle} fullWidth style={{ backgroundColor: T.success, color: T.white }}>Complete Task</Button></div>
      </div>
    </form>
  )
}