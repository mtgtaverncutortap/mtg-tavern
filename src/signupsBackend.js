import { firebaseConfigured, getFirebaseApp } from './firebaseApp.js'

export { firebaseConfigured }

const pad = (n) => String(n).padStart(2, '0')
const todayKey = () => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// One sign-up per name per event: the document id is built from both.
export const nameSlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const signupId = (eventId, name) => `${eventId}__${nameSlug(name)}`

// Connects to Firestore (no sign-in of its own — joining an event needs a real,
// logged-in member account, handled by the membership system) and streams:
//   signups:   every name on a list for upcoming events
//   schedules: who the head of each event is, and the date and time they set
// The "uid" passed to onData always reflects whichever real member is currently
// logged in (or null), so "is this my entry" stays correct as people log in or out.
export async function connectFirebase({ onData, onSchedules, onError }) {
  const [app, { getAuth, onAuthStateChanged }, fs] = await Promise.all([
    getFirebaseApp(),
    import('firebase/auth'),
    import('firebase/firestore'),
  ])

  const auth = getAuth(app)
  const db = fs.getFirestore(app)
  const upcoming = fs.query(fs.collection(db, 'signups'), fs.where('eventDate', '>=', todayKey()))

  let latestRows = []
  let currentUid = null
  const emitData = () => onData(latestRows, currentUid)

  const stopSignups = fs.onSnapshot(
    upcoming,
    (snapshot) => {
      latestRows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      emitData()
    },
    onError,
  )
  const stopSchedules = fs.onSnapshot(
    fs.collection(db, 'schedules'),
    (snapshot) => onSchedules(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
  // Anonymous sessions don't count as "me" here — only a real member account does.
  const stopAuth = onAuthStateChanged(auth, (user) => {
    currentUid = user && !user.isAnonymous ? user.uid : null
    emitData()
  })

  const requireUid = () => {
    const uid = auth.currentUser?.isAnonymous ? null : auth.currentUser?.uid
    if (!uid) throw new Error('not-signed-in')
    return uid
  }

  return {
    add: (event, name) =>
      fs.setDoc(fs.doc(db, 'signups', signupId(event.occId, name)), {
        eventId: event.occId,
        eventDate: event.key,
        name,
        uid: requireUid(),
        createdAt: fs.serverTimestamp(),
      }),
    remove: (id) => fs.deleteDoc(fs.doc(db, 'signups', id)),

    // Only succeeds if nobody is head yet (the rules reject changing someone else's document).
    claimHead: (listId, name) =>
      fs.setDoc(fs.doc(db, 'schedules', listId), {
        headUid: requireUid(),
        headName: name,
        date: '',
        time: '',
        updatedAt: fs.serverTimestamp(),
      }),
    saveSchedule: (listId, { date, time }) =>
      fs.updateDoc(fs.doc(db, 'schedules', listId), {
        date,
        time,
        updatedAt: fs.serverTimestamp(),
      }),
    releaseHead: (listId) => fs.deleteDoc(fs.doc(db, 'schedules', listId)),

    disconnect: () => {
      stopSignups()
      stopSchedules()
      stopAuth()
    },
  }
}
