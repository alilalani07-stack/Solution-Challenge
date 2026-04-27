import { queryDocuments, updateDocument } from '../services/firestoreService'
import { isFirebaseConfigured } from '../firebase/config'
import { MOCK_MATCHES, MOCK_VOLUNTEERS } from '../constants/mockData'

export async function fetchMatchesForNeed(needId) {
  if (!isFirebaseConfigured) {
    const matches = MOCK_MATCHES.filter(m => m.need_id === needId)
    return matches.map(m => {
      const vol = MOCK_VOLUNTEERS.find(v => v.id === m.volunteer_id)
      return { ...m, volunteer: vol }
    })
  }
  const matches = await queryDocuments('matches', [{ field: 'need_id', op: '==', value: needId }])
  return matches
}

export async function assignVolunteer(needId, volunteerId, tier) {
  if (!isFirebaseConfigured) return { success: true }
  await updateDocument('needs', needId, {
    status: 'matched',
    assigned_volunteer_id: volunteerId,
    match_tier: tier,
  })
  return { success: true }
}

export async function updateMatchStatus(matchId, status) {
  if (!isFirebaseConfigured) return
  await updateDocument('matches', matchId, { status })
}
