import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, // ← Added import
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged 
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './config'

const googleProvider = isFirebaseConfigured ? new GoogleAuthProvider() : null

export async function loginWithEmail(email, password) {
  if (!isFirebaseConfigured) {
    // Demo mode: simulate login
    return {
      uid: 'demo-user-' + Date.now(),
      email,
      displayName: email.split('@')[0],
    }
  }
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

// ✅ NEW: Signup function with demo mode support
export async function signupWithEmail(email, password) {
  if (!isFirebaseConfigured) {
    // Demo mode: simulate signup
    return {
      uid: 'demo-signup-' + Date.now(),
      email,
      displayName: email.split('@')[0],
      emailVerified: false,
    }
  }
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function loginWithGoogle() {
  if (!isFirebaseConfigured) {
    return {
      uid: 'demo-google-user',
      email: 'demo@civicpulse.org',
      displayName: 'Demo User',
    }
  }
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function logout() {
  if (!isFirebaseConfigured) return
  await signOut(auth)
}

export function onAuthChange(callback) {
  if (!isFirebaseConfigured) {
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}