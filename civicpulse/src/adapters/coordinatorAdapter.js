import { queryDocuments, updateDocument, subscribeToCollection } from '../services/firestoreService'
import { isFirebaseConfigured } from '../firebase/config'
import { MOCK_DASHBOARD_METRICS } from '../constants/mockData'
import { mockStore } from '../store/mockStore'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function fetchPendingReview() {
  if (!isFirebaseConfigured) return mockStore.needs.filter(n => n.status === 'pending_review')
  return queryDocuments('needs', [{ field: 'status', op: '==', value: 'pending_review' }])
}

export async function approveNeed(needId) {
  if (!isFirebaseConfigured) {
    mockStore.updateNeed(needId, { status: 'open', needs_review: false })
    return { success: true }
  }
  await updateDocument('needs', needId, { status: 'open', needs_review: false, updated_at: new Date() })
  return { success: true }
}

export async function rejectNeed(needId) {
  if (!isFirebaseConfigured) {
    mockStore.updateNeed(needId, { status: 'rejected' })
    return { success: true }
  }
  await updateDocument('needs', needId, { status: 'rejected', updated_at: new Date() })
  return { success: true }
}

export async function approveAndTriggerMatch(needId) {
  if (!isFirebaseConfigured) {
    mockStore.updateNeed(needId, { status: 'open', needs_review: false })
    const need = mockStore.needs.find(n => n.id === needId)
    const matchedVols = mockStore.volunteers.filter(v => v.availability).slice(0, 3).map((v, i) => ({
      volunteer: v, match_score: 95 - i * 8, tier: i + 1,
      matchingSkills: v.skills?.filter(s => need?.required_skills?.includes(s)) || [],
    }))
    return { success: true, matches: matchedVols }
  }

  // Step 1 — approve in Firestore
  await updateDocument('needs', needId, { status: 'open', needs_review: false, updated_at: new Date() })

  // Step 2 — trigger Python matching engine
  const matchRes = await fetch(`${API}/run-matching`, { method: 'POST' })
  if (!matchRes.ok) throw new Error('Matching engine failed')

  // Step 3 — fetch resulting matches WITH volunteer details
  const res = await fetch(`${API}/matches/${needId}`)
  if (!res.ok) return { success: true, matches: [] }

  const data = await res.json()
  const matches = (data.matches || []).map(m => ({
    ...m,
    match_score:    Math.round((m.match_score || 0) * 100),
    matchingSkills: m.volunteer_skills || [],
  }))

  return { success: true, matches }
}

export async function verifyResolution(needId, approved = true, notes = '') {
  if (!isFirebaseConfigured) {
    mockStore.updateNeed(needId, approved
      ? { status: 'resolved', verified: true, verification_notes: notes }
      : { status: 'active', escalation_status: 'reopened' }
    )
    return { success: true }
  }
  const updates = approved
    ? { status: 'resolved', verified: true, verification_notes: notes, updated_at: new Date() }
    : { status: 'active', escalation_status: 'reopened', updated_at: new Date() }
  await updateDocument('needs', needId, updates)
  return { success: true }
}

export async function escalateNeed(needId, reason = 'manual_escalation') {
  if (!isFirebaseConfigured) {
    mockStore.updateNeed(needId, { escalation_status: reason, priority_score: 95 })
    return { success: true }
  }
  await updateDocument('needs', needId, { escalation_status: reason, priority_score: 95, updated_at: new Date() })
  return { success: true }
}

export async function fetchDashboardMetrics() {
  // Always try FastAPI first — it reads ALL needs not just open ones
  if (isFirebaseConfigured) {
    try {
      const res = await fetch(`${API}/dashboard-summary`)
      if (res.ok) {
        const data = await res.json()
        return {
          totalNeedsToday:     data.stats.total_needs        || 0,
          pendingReview:       data.stats.pending_review     || 0,
          openNeeds:           data.stats.total_open         || 0,
          matchedNeeds:        data.stats.matched            || 0,
          resolvedNeeds:       data.stats.resolved           || 0,
          escalated:           0,
          avgPriorityScore:    0,
          criticalNeeds:       data.stats.critical_needs     || 0,
          availableVolunteers: data.stats.available_volunteers || 0,
        }
      }
    } catch (e) {
      console.warn('Dashboard summary fetch failed, falling back to Firestore direct query')
    }

    const needs = await queryDocuments('needs', [])
    const today = new Date(); today.setHours(0, 0, 0, 0)
    return {
      totalNeedsToday:  needs.filter(n => {
        const t = n.submitted_at?.toDate?.() || new Date(n.submitted_at)
        return t >= today
      }).length,
      pendingReview:    needs.filter(n => n.status === 'pending_review').length,
      openNeeds:        needs.filter(n => n.status === 'open').length,
      matchedNeeds:     needs.filter(n => ['matched', 'active'].includes(n.status)).length,
      resolvedNeeds:    needs.filter(n => n.status === 'resolved').length,
      escalated:        needs.filter(n => n.escalation_status && n.status !== 'resolved').length,
      avgPriorityScore: Math.round(needs.reduce((s, n) => s + (n.priority_score || 0), 0) / (needs.length || 1)),
    }
  }

  return {
    ...MOCK_DASHBOARD_METRICS,
    pendingReview: mockStore.needs.filter(n => n.status === 'pending_review').length,
    openNeeds:     mockStore.needs.filter(n => n.status === 'open').length,
    matchedNeeds:  mockStore.needs.filter(n => ['matched', 'active'].includes(n.status)).length,
    resolvedNeeds: mockStore.needs.filter(n => n.status === 'resolved').length,
  }
}

export function subscribeToLiveNeeds(callback) {
  if (!isFirebaseConfigured) return mockStore.subscribe(callback)
  return subscribeToCollection('needs', [], callback)
}

export async function fetchAllVolunteers() {
  if (!isFirebaseConfigured) return mockStore.volunteers
  return queryDocuments('volunteers', [])
}