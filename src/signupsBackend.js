import { firebaseConfig } from './signups.config.js'

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

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

// Connects to Firestore, signs the browser in anonymously (so people can remove
// their own name and, if they volunteered, run their event), and streams:
//   signups:   every name on a list for upcoming events
//   schedules: who the head of each event is, and the date and time they set
export async function connectFirebase({ onData, onSchedules, onError }) {
  const [{ initializeApp }, { getAuth, signInAnonymously }, fs] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
  ])

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  await auth.authStateReady()
  if (!auth.currentUser) await signInAnonymously(auth)
  const uid = auth.currentUser.uid

  const db = fs.getFirestore(app)
  const upcoming = fs.query(fs.collection(db, 'signups'), fs.where('eventDate', '>=', todayKey()))

  const stopSignups = fs.onSnapshot(
    upcoming,
    (snapshot) => onData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })), uid),
    onError,
  )
  const stopSchedules = fs.onSnapshot(
    fs.collection(db, 'schedules'),
    (snapshot) => onSchedules(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )

  return {
    uid,
    add: (event, name) =>
      fs.setDoc(fs.doc(db, 'signups', signupId(event.occId, name)), {
        eventId: event.occId,
        eventDate: event.key,
        name,
        uid,
        createdAt: fs.serverTimestamp(),
      }),
    remove: (id) => fs.deleteDoc(fs.doc(db, 'signups', id)),

    // Only succeeds if nobody is head yet (the rules reject changing someone else's document).
    claimHead: (listId, name) =>
      fs.setDoc(fs.doc(db, 'schedules', listId), {
        headUid: uid,
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
    },
  }
}
