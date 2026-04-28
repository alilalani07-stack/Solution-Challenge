import { getDocument, queryDocuments, updateDocument, subscribeToCollection } from '../services/firestoreService'
import { isFirebaseConfigured } from '../firebase/config'
import { mockStore } from '../store/mockStore'

const getServerTimestamp = async () => {
  const { serverTimestamp } = await import('firebase/firestore')
  return serverTimestamp()
}

export async function fetchVolunteerProfile(uid) {
  if (!isFirebaseConfigured) {
    return mockStore.volunteers.find(v => v.uid === uid) || null
  }
  return await getDocument('volunteers', uid)
}

export async function createVolunteerProfile(uid, data) {
  if (!isFirebaseConfigured) {
    const mockProfile = { uid, ...data, onboarding_completed: false, created_at: new Date().toISOString() }
    return mockProfile
  }
  try {
    const { doc, setDoc } = await import('firebase/firestore')
    const { db } = await import('../firebase/config')
    const st = await getServerTimestamp()
    await setDoc(doc(db, 'volunteers', uid), {
      ...data,
      onboarding_completed: false,
      availability: true,
      created_at: st,
      updated_at: st
    })
    return { uid, ...data }
  } catch (err) {
    console.error('Firestore profile creation error:', err)
    return { uid, ...data, onboarding_completed: false }
  }
}

export async function updateVolunteerProfile(uid, data) {
  if (!isFirebaseConfigured) return { success: true }
  try {
    const { doc, updateDoc } = await import('firebase/firestore')
    const { db } = await import('../firebase/config')
    const st = await getServerTimestamp()
    await updateDoc(doc(db, 'volunteers', uid), {
      ...data,
      onboarding_completed: true,
      updated_at: st
    })
    return { success: true }
  } catch (err) {
    console.error('Firestore profile update error:', err)
    throw new Error('Failed to update profile')
  }
}

// ── Availability toggle ──────────────────────────────────────────────────────
export async function setVolunteerAvailability(uid, available) {
  if (!isFirebaseConfigured) {
    const vol = mockStore.volunteers.find(v => v.uid === uid)
    if (vol) vol.availability = available
    return { success: true }
  }
  try {
    const { doc, updateDoc } = await import('firebase/firestore')
    const { db } = await import('../firebase/config')
    const st = await getServerTimestamp()
    await updateDoc(doc(db, 'volunteers', uid), {
      availability: available,
      updated_at: st
    })
    return { success: true }
  } catch (err) {
    console.error('Availability update error:', err)
    throw new Error('Failed to update availability')
  }
}

// ── Task subscription ────────────────────────────────────────────────────────
export function subscribeToVolunteerTasks(volunteerId, callback) {
  if (!isFirebaseConfigured || !volunteerId) {
    callback([])
    return () => {}
  }

  let unsubscribe = null

  const setupSubscription = async () => {
    try {
      // 1️⃣ Subscribe to personal matches
      unsubscribe = subscribeToCollection(
        'matches',
        [{ field: 'volunteer_id', op: '==', value: volunteerId }],
        async (matches) => {
          console.log(`📥 [Volunteer ${volunteerId.slice(-6)}] Raw matches from Firestore:`, matches?.length || 0)

          // 2️⃣ Fetch open recommendations
          const openDocs = await queryDocuments('needs', [
            { field: 'status', op: '==', value: 'open' }
          ])

          const recommended = (openDocs || [])
            .filter(n => {
    const isOpen = n.status === 'open'
    // ✅ ALSO include 'matched' tasks that have no assigned_volunteer_id AND no match docs
    const isUnassignedMatch = n.status === 'matched' && !n.assigned_volunteer_id
    return (isOpen || isUnassignedMatch) && !n.assigned_volunteer_id
  })
            .map(n => ({
              id: n.id,
              need_id: n.id,
              title: n.summary || n.raw_report?.slice(0, 60) || 'Untitled Need',
              description: n.raw_report || n.summary || '',
              category: n.category || 'General',
              urgency: n.urgency || 5,
              location: n.location_hint || n.raw_location || 'Unknown',
              location_hint: n.location_hint || n.raw_location,
              coords: n.location_coords,
              status: 'pending',
              match_status: 'pending',
              is_recommendation: true,
              created_at: n.submitted_at || n.created_at,
              raw_report: n.raw_report,
              summary: n.summary,
              ...n,
              is_recommendation: true,
            }))

          // 3️⃣ Enrich personal matches
          const enriched = await Promise.all(
            (matches || []).map(async (match) => {
              try {
                const need = await getDocument('needs', match.need_id)
                
                // 🛑 ONLY hide if explicitly assigned to a DIFFERENT volunteer
                if (need?.assigned_volunteer_id && need.assigned_volunteer_id !== volunteerId) {
                  console.log(` [Hidden] Match ${match.id} blocked: assigned to ${need.assigned_volunteer_id}`)
                  return null
                }

                return {
                  id: match.id,
                  need_id: match.need_id,
                  title: need?.summary || need?.raw_report?.slice(0, 60) || 'Untitled Task',
                  description: need?.raw_report || need?.summary || '',
                  category: need?.category || match.category || 'General',
                  urgency: need?.urgency || match.urgency || 5,
                  location: need?.location_hint || need?.raw_location || match.location || 'Unknown',
                  location_hint: need?.location_hint || need?.raw_location,
                  coords: need?.location_coords || match.coords,
                  status: match.status || 'pending',
                  match_status: match.status || 'pending',
                  is_recommendation: false,
                  created_at: match.created_at || need?.submitted_at,
                  updated_at: match.updated_at,
                  raw_report: need?.raw_report,
                  summary: need?.summary,
                  ...match,
                  ...need,
                  id: match.id,
                  need_id: match.need_id,
                }
              } catch (err) {
                console.warn(`⚠️ Failed to enrich match ${match.id}:`, err)
                return {
                  ...match,
                  id: match.id,
                  title: 'Task (enrichment failed)',
                  status: match.status || 'pending',
                  match_status: match.status || 'pending',
                  is_recommendation: false
                }
              }
            })
          )

          const validEnriched = enriched.filter(m => m !== null)
          const allTasks = [...validEnriched, ...recommended]
          
          console.log(`📦 [Volunteer ${volunteerId.slice(-6)}] Final tasks sent to UI:`, allTasks.length, 
            `(${validEnriched.length} matches, ${recommended.length} recommendations)`)
          
          callback(allTasks)
        }
      )
    } catch (err) {
      console.error('❌ Subscription failed:', err.message)
      callback([])
      setTimeout(() => {
        if (unsubscribe) unsubscribe()
        setupSubscription()
      }, 5000)
    }
  }

  setupSubscription()
  return () => { if (unsubscribe && typeof unsubscribe === 'function') unsubscribe() }
}

// ── Accept ───────────────────────────────────────────────────────────────────
export async function acceptTask(taskId, volunteerId, isMatch = false) {
  if (!isMatch) {
    return await createMatchFromNeed(taskId, volunteerId)
  }
  if (!isFirebaseConfigured) {
    mockStore.updateNeed(taskId, { status: 'active', assigned_volunteer_id: volunteerId })
    return { success: true }
  }
  try {
    await updateDocument('matches', taskId, {
      status: 'accepted',
      accepted_at: new Date(),
      updated_at: new Date()
    })
    const match = await getDocument('matches', taskId)
    if (match?.need_id) {
      await updateDocument('needs', match.need_id, {
        status: 'active',
        assigned_volunteer_id: volunteerId,
        updated_at: new Date()
      })
    }
    return { success: true }
  } catch (err) {
    console.error('Error accepting match:', err)
    throw err
  }
}

async function createMatchFromNeed(needId, volunteerId) {
  if (!isFirebaseConfigured) {
    mockStore.updateNeed(needId, {
      status: 'active',
      assigned_volunteer_id: volunteerId
    })
    return { success: true, matchId: needId }
  }
  try {
    const { doc, setDoc } = await import('firebase/firestore')
    const { db } = await import('../firebase/config')
    const st = await getServerTimestamp()
    const need = await getDocument('needs', needId)
    const matchId = `${needId}_${volunteerId}`
    const matchRef = doc(db, 'matches', matchId)

    await setDoc(matchRef, {
      need_id: needId,
      volunteer_id: volunteerId,
      status: 'accepted',
      created_at: st,
      accepted_at: st,
      updated_at: st,
      category: need?.category || null,
      urgency: need?.urgency || null,
      location: need?.location_hint || need?.raw_location || null,
    })

    await updateDocument('needs', needId, {
      status: 'active',
      assigned_volunteer_id: volunteerId,
      updated_at: new Date()
    })

    return { success: true, matchId }
  } catch (err) {
    console.error('Error creating match from need:', err)
    throw err
  }
}

// ── Decline ──────────────────────────────────────────────────────────────────
export async function declineTask(taskId, volunteerId, isMatch = false) {
  if (!isFirebaseConfigured) {
    mockStore.updateNeed(taskId, { status: 'declined', assigned_volunteer_id: null })
    return { success: true }
  }

  if (isMatch) {
    await updateDocument('matches', taskId, {
      status: 'declined',
      updated_at: new Date()
    })
  } else {
    try {
      const { doc, setDoc } = await import('firebase/firestore')
      const { db } = await import('../firebase/config')
      const st = await getServerTimestamp()
      const matchId = `${taskId}_${volunteerId}_declined`
      await setDoc(doc(db, 'matches', matchId), {
        need_id: taskId,
        volunteer_id: volunteerId,
        status: 'declined',
        created_at: st,
        updated_at: st,
      })
    } catch (err) {
      console.error('Error creating declined match:', err)
    }
  }
  return { success: true }
}

// ── Resolve ──────────────────────────────────────────────────────────────────
// ✅ FIXED: Handle need_id fallback for recommendations
export async function submitResolution(taskId, needId, data) {
  const updates = {
    status: 'under_review',
    resolved_at: new Date(),
    resolution_notes: data.notes || data.outcome || '',
    volunteers_helped: data.people_helped || data.beneficiaries || 1,
    verified: false,
    updated_at: new Date()
  }

  if (!isFirebaseConfigured) {
    mockStore.updateNeed(needId || taskId, updates)
    return { success: true }
  }

  try {
    await updateDocument('matches', taskId, {
      status: 'under_review',
      updated_at: new Date()
    })
  } catch {
    // match may not exist if this was a recommendation
  }

  // ✅ FIXED: Use needId fallback to taskId for recommendations
  const targetNeedId = needId || taskId
  if (targetNeedId) {
    await updateDocument('needs', targetNeedId, updates)
  }

  return { success: true }
}