import { z } from 'zod'

export const needFormSchema = z.object({
  description: z.string().min(10, 'Please describe your need in at least 10 characters').max(1000, 'Description too long'),
  category: z.string().min(1, 'Please select a category'),
  urgency: z.string().min(1, 'Please select urgency level'),
  quantity: z.number().min(1).max(9999).optional().default(1),
  location_hint: z.string().min(1, 'Please provide a location'),
  location_coords: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  anonymous: z.boolean().optional().default(false),
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Passwords do not match',
      path: ['confirmPassword'], 
    })
  }
})

export const onboardingSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().min(10, 'Please enter a valid phone number').optional(),
  location: z.string().min(3, 'Location is required'),
  coords: z.object({ lat: z.number(), lng: z.number() }).nullable().optional(),
  availability: z.string().min(1, 'Availability status is required'),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  other_skills: z.string().optional(),
  experience_level: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  languages: z.array(z.string()).min(1, 'Select at least one language'),
  bio: z.string().optional(),
})

export const resolutionSchema = z.object({
  outcome: z.string().min(5, 'Please describe the outcome'),
  resources_used: z.string().optional(),
  duration_minutes: z.number().min(1).optional(),
  people_helped: z.number().min(1).optional(),
  notes: z.string().optional(),
})