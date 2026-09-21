import { signupId } from './signupsBackend.js'

// Development-only stand-in for Firebase so the sign-up screens can be tried
// without a database. Add ?signups=local to the address. Never bundled into the live site.
const STORAGE_KEY = 'mtg-tavern-local-signups-v2'

const load = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) ?? { rows: [], schedules: [] }
  } catch {
    return { rows: [], schedules: [] }
  }
}

export async function connectLocal({ onData, onSchedules }) {
  const uid = 'local-user'
  let { rows, schedules } = load()

  const save = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ rows, schedules }))
    } catch {
      // Storage can be unavailable; the in-memory copy still works.
    }
  }
  const emit = () => {
    onData(rows, uid)
    onSchedules(schedules)
  }
  emit()

  const scheduleIndex = (listId) => schedules.findIndex((s) => s.id === listId)

  return {
    uid,
    add: async (event, name) => {
      const id = signupId(event.occId, name)
      if (rows.some((row) => row.id === id)) throw new Error('duplicate')
      rows = [
        ...rows,
        { id, eventId: event.occId, eventDate: event.key, name, uid, createdAt: Date.now() },
      ]
      save()
      emit()
    },
    remove: async (id) => {
      rows = rows.filter((row) => row.id !== id)
      save()
      emit()
    },
    claimHead: async (listId, name) => {
      if (scheduleIndex(listId) >= 0) throw new Error('taken')
      schedules = [...schedules, { id: listId, headUid: uid, headName: name, date: '', time: '' }]
      save()
      emit()
    },
    saveSchedule: async (listId, { date, time }) => {
      const index = scheduleIndex(listId)
      if (index < 0 || schedules[index].headUid !== uid) throw new Error('not head')
      schedules = schedules.map((s, i) => (i === index ? { ...s, date, time } : s))
      save()
      emit()
    },
    releaseHead: async (listId) => {
      const index = scheduleIndex(listId)
      if (index < 0 || schedules[index].headUid !== uid) throw new Error('not head')
      schedules = schedules.filter((s) => s.id !== listId)
      save()
      emit()
    },

    // Test helpers: pretend other people signed up or volunteered.
    addOthers: (event, names) => {
      names.forEach((name) => {
        const id = signupId(event.occId, name)
        if (!rows.some((row) => row.id === id)) {
          rows = [
            ...rows,
            {
              id,
              eventId: event.occId,
              eventDate: event.key,
              name,
              uid: 'someone-else',
              createdAt: Date.now(),
            },
          ]
        }
      })
      save()
      emit()
    },
    setOtherHead: (listId, headName, date = '', time = '') => {
      schedules = [
        ...schedules.filter((s) => s.id !== listId),
        { id: listId, headUid: 'someone-else', headName, date, time },
      ]
      save()
      emit()
    },
    reset: () => {
      rows = []
      schedules = []
      save()
      emit()
    },

    disconnect: () => {},
  }
}
