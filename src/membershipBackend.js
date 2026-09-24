import { firebaseConfigured, getFirebaseApp } from './firebaseApp.js'
import { ADMIN_UID } from './membership.config.js'

export { firebaseConfigured }
export const adminConfigured = Boolean(ADMIN_UID)

export const normalizeEmail = (email) => email.trim().toLowerCase()

let authPromise = null
let dbPromise = null
let authModule = null
let fsModule = null

async function getAuthAndDb() {
  if (!authPromise) {
    authPromise = getFirebaseApp().then(async (app) => {
      authModule = await import('firebase/auth')
      return authModule.getAuth(app)
    })
  }
  if (!dbPromise) {
    dbPromise = getFirebaseApp().then(async (app) => {
      fsModule = await import('firebase/firestore')
      return fsModule.getFirestore(app)
    })
  }
  const [auth, db] = await Promise.all([authPromise, dbPromise])
  return { auth, db, authModule, fs: fsModule }
}

// Streams the signed-in Firebase user (or null when logged out).
export async function watchAuthState(onChange) {
  const { auth, authModule: am } = await getAuthAndDb()
  return am.onAuthStateChanged(auth, onChange)
}

// Streams whether the current user's email has an approved membership record,
// and its details (tier, member ID). Only fires once the user is logged in and verified.
export async function watchMembership(email, onData, onError) {
  const { db, fs } = await getAuthAndDb()
  const ref = fs.doc(db, 'approvedMembers', normalizeEmail(email))
  return fs.onSnapshot(
    ref,
    (snap) => onData(snap.exists() ? snap.data() : null),
    onError,
  )
}

// Public: submits a request to join. Anyone can do this (signed in anonymously,
// same as the event sign-up feature); only the admin can read the list.
export async function submitJoinRequest({ name, email, tier, note }) {
  const { auth, db, authModule: am, fs } = await getAuthAndDb()
  await auth.authStateReady()
  if (!auth.currentUser) await am.signInAnonymously(auth)

  await fs.addDoc(fs.collection(db, 'joinRequests'), {
    name,
    email: normalizeEmail(email),
    tier,
    note,
    uid: auth.currentUser.uid,
    status: 'pending',
    createdAt: fs.serverTimestamp(),
  })
}

// Checks the public, name/detail-free "is this email approved" gate.
export async function isEmailApproved(email) {
  const { db, fs } = await getAuthAndDb()
  const snap = await fs.getDoc(fs.doc(db, 'approvedEmails', normalizeEmail(email)))
  return snap.exists()
}

// Creates a member's real account. Only succeeds (per the security rules) once
// the admin has approved that email. Sends a verification email.
export async function createAccount(email, password) {
  const normalized = normalizeEmail(email)
  try {
    const approved = await isEmailApproved(normalized)
    if (!approved) {
      return {
        ok: false,
        message: 'That email hasn’t been approved yet. Please request to join first.',
      }
    }
    const { auth, authModule: am } = await getAuthAndDb()
    const credential = await am.createUserWithEmailAndPassword(auth, normalized, password)
    await am.sendEmailVerification(credential.user)
    return { ok: true }
  } catch (err) {
    return { ok: false, message: authErrorMessage(err) }
  }
}

export async function login(email, password) {
  try {
    const { auth, authModule: am } = await getAuthAndDb()
    await am.signInWithEmailAndPassword(auth, normalizeEmail(email), password)
    return { ok: true }
  } catch (err) {
    return { ok: false, message: authErrorMessage(err) }
  }
}

export async function logout() {
  const { auth, authModule: am } = await getAuthAndDb()
  await am.signOut(auth)
}

export async function resendVerification(user) {
  const { authModule: am } = await getAuthAndDb()
  await am.sendEmailVerification(user)
}

function authErrorMessage(err) {
  switch (err?.code) {
    case 'auth/email-already-in-use':
      return 'An account already exists for that email. Try logging in instead.'
    case 'auth/invalid-email':
      return 'That doesn’t look like a valid email address.'
    case 'auth/weak-password':
      return 'Please choose a password with at least 6 characters.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email or password is incorrect.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    default:
      return 'Something went wrong. Please try again.'
  }
}

// ---------- Admin-only functions (Firestore rules restrict these to ADMIN_UID) ----------

export async function adminLoadRequests() {
  const { db, fs } = await getAuthAndDb()
  const snap = await fs.getDocs(fs.collection(db, 'joinRequests'))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function adminWatchRequests(onData, onError) {
  const { db, fs } = await getAuthAndDb()
  return fs.onSnapshot(
    fs.collection(db, 'joinRequests'),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

export async function adminApproveRequest(request, memberId) {
  const { db, fs } = await getAuthAndDb()
  const email = normalizeEmail(request.email)
  const batch = fs.writeBatch(db)
  batch.set(fs.doc(db, 'approvedEmails', email), { allowed: true })
  batch.set(fs.doc(db, 'approvedMembers', email), {
    name: request.name,
    tier: request.tier,
    memberId,
    approvedAt: fs.serverTimestamp(),
  })
  batch.update(fs.doc(db, 'joinRequests', request.id), { status: 'approved', memberId })
  await batch.commit()
}

export async function adminDenyRequest(request) {
  const { db, fs } = await getAuthAndDb()
  await fs.updateDoc(fs.doc(db, 'joinRequests', request.id), { status: 'denied' })
}

export async function adminWatchMembers(onData, onError) {
  const { db, fs } = await getAuthAndDb()
  return fs.onSnapshot(
    fs.collection(db, 'approvedMembers'),
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

export async function adminRevokeMember(email) {
  const { db, fs } = await getAuthAndDb()
  const normalized = normalizeEmail(email)
  const batch = fs.writeBatch(db)
  batch.delete(fs.doc(db, 'approvedEmails', normalized))
  batch.delete(fs.doc(db, 'approvedMembers', normalized))
  await batch.commit()
}
