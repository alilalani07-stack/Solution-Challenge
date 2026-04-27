import { getDocument, queryDocuments, updateDocument, subscribeToCollection } from '../services/firestoreService'
import { isFirebaseConfigured } from '../firebase/config'
import { generateTrackingId } from '../utils/formatters'
import { mockStore } from '../store/mockStore'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function submitNeed(formData) {
  if (isFirebaseConfigured) {
    const res = await fetch(`${API}/submit-need`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report: formData.description,
        location: formData.location_hint || 'unknown',
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Submission failed. Please try again.')
    }

    const data = await res.json()

    return {
      id: data.need_id,
      tracking_id: data.tracking_id || data.need_id, // ✅ FIX: always prefer tracking_id if backend sends it
      action: data.action,
      summary: data.summary,
      category: data.category,
      urgency: data.urgency,
      needs_review: data.needs_review,
      priority_score: data.priority_score,
      message: data.message,
      duplicate_of: data.duplicate_of || null,
      status:
        data.action === 'duplicate'
          ? 'duplicate'
          : data.action === 'review'
          ? 'pending_review'
          : 'open',
    }
  }

  // Demo mode fallback
  const trackingId = generateTrackingId()

  const needData = {
    raw_report: formData.description,
    summary: formData.description,
    category: formData.category || 'other',
    urgency: formData.urgency === 'critical' ? 9 : formData.urgency === 'urgent' ? 7 : 5,
    quantity: formData.quantity || 1,
    required_skills: [formData.category || 'general'],
    location_hint: formData.location_hint || 'Unknown location',
    location_coords: formData.location_coords || null,
    status: 'pending_review',
    priority_score: formData.urgency === 'critical' ? 90 : formData.urgency === 'urgent' ? 65 : 35,
    confidence: 0.85,
    needs_review: true,
    tracking_id: trackingId,
    assigned_volunteer_id: null,
    match_tier: null,
    escalation_status: null,
    resolved_at: null,
    resolution_notes: null,
    volunteers_helped: null,
    contact_phone: formData.anonymous ? null : (formData.contact_phone || null),
    contact_email: formData.anonymous ? null : (formData.contact_email || null),
    submitted_at: new Date(),
    updated_at: new Date(),
  }

  const id = 'demo-' + Date.now()

  const newNeed = {
    id,
    tracking_id: trackingId,
    ...needData,
  }

  mockStore.addNeed(newNeed)
  return newNeed
}

export async function fetchNeedById(needId) {
  if (!isFirebaseConfigured) {
    return mockStore.needs.find(n => n.id === needId) || null
  }
  return getDocument('needs', needId)
}

export async function fetchNeedByTrackingId(trackingId) {
  if (!isFirebaseConfigured) {
    return mockStore.needs.find(n => n.tracking_id === trackingId) || null
  }

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/needs/track/${trackingId}`
    )
    if (res.ok) {
      const data = await res.json()
      return data.need || null
    }
  } catch {
    // fallback below
  }

  const results = await queryDocuments('needs', [
    { field: 'tracking_id', op: '==', value: trackingId },
  ])

  return results[0] || null
}

export async function updateNeedStatus(needId, status, extraData = {}) {
  if (!isFirebaseConfigured) {
    mockStore.updateNeed(needId, { status, ...extraData })
    return
  }

  await updateDocument('needs', needId, {
    status,
    ...extraData,
    updated_at: new Date(),
  })
}

export function subscribeToNeeds(filters, callback) {
  if (!isFirebaseConfigured) {
    return mockStore.subscribe((needs) => {
      const filtered = needs.filter(n =>
        filters.every(f => {
          if (f.op === '==') return n[f.field] === f.value
          if (f.op === 'in') return f.value.includes(n[f.field])
          return true
        })
      )

      // ✅ FIXED: NEVER fallback to id unless tracking_id is missing
      const normalized = filtered.map(n => ({
        ...n,
        tracking_id: n.tracking_id ?? n.trackingId ?? null,
      }))

      callback(normalized)
    })
  }

  return subscribeToCollection('needs', filters, (data) => {
    // ✅ FIXED: consistent tracking_id mapping from Firestore
    const normalized = (data || []).map(d => ({
      ...d,
      tracking_id: d.tracking_id ?? d.trackingId ?? null,
    }))

    callback(normalized)
  })
}