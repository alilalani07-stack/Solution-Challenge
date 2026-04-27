import { db, isFirebaseConfigured } from '../firebase/config'
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  setDoc,  // ✅ Added import
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore'

export async function addDocument(collectionName, data) {
  if (!isFirebaseConfigured) return { id: 'demo-' + Date.now() }
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
  return { id: ref.id }
}

// ✅ NEW: setDocument function for creating/updating specific doc IDs
export async function setDocument(collectionName, docId, data) {
  if (!isFirebaseConfigured) return { id: docId }
  const docRef = doc(db, collectionName, docId)
  await setDoc(docRef, {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }, { merge: true }) // merge: true allows updates without overwriting
  return { id: docId }
}

export async function getDocument(collectionName, docId) {
  if (!isFirebaseConfigured) return null
  const snap = await getDoc(doc(db, collectionName, docId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function queryDocuments(collectionName, filters = [], sortField = null) {
  if (!isFirebaseConfigured) return []
  const constraints = filters.map(f => where(f.field, f.op, f.value))
  if (sortField) constraints.push(orderBy(sortField, 'desc'))
  const q = query(collection(db, collectionName), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function updateDocument(collectionName, docId, data) {
  if (!isFirebaseConfigured) return
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updated_at: serverTimestamp(),
  })
}

export function subscribeToCollection(collectionName, filters, callback) {
  if (!isFirebaseConfigured) {
    callback([])
    return () => {}
  }
  const constraints = filters.map(f => where(f.field, f.op, f.value))
  const q = query(collection(db, collectionName), ...constraints)
  return onSnapshot(q, snap => {
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(docs)
  })
}