import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { connectFirebase, firebaseConfigured, nameSlug } from './signupsBackend.js'
import { SignupsContext } from './useSignups.js'

// Local development only: add ?signups=local to try sign-ups without a database.
const useLocal =
  import.meta.env.DEV && new URLSearchParams(window.location.search).get('signups') === 'local'

const enabled = firebaseConfigured || useLocal

const NO_PLAYERS = []

async function connect(handlers) {
  if (import.meta.env.DEV && useLocal) {
    const { connectLocal } = await import('./signupsLocal.js')
    return connectLocal(handlers)
  }
  return connectFirebase(handlers)
}

const cleanName = (raw) => raw.replace(/\s+/g, ' ').trim()

const createdTime = (row) => row.createdAt?.toMillis?.() ?? row.createdAt ?? Number.MAX_SAFE_INTEGER

// Returns a message if the name is not acceptable, otherwise null.
function nameProblem(name) {
  if (!name) return 'Please enter your name.'
  if (name.length > 30) return 'Please keep your name under 30 letters.'
  if (/https?:|www\.|@/i.test(name)) {
    return 'Please use just a name, with no links or email addresses.'
  }
  return null
}

export function SignupsProvider({ children }) {
  const [rows, setRows] = useState([])
  const [schedules, setSchedules] = useState([])
  const [uid, setUid] = useState(null)
  const [ready, setReady] = useState(!enabled)
  const [error, setError] = useState('')
  const connection = useRef(null)

  useEffect(() => {
    if (!enabled) return undefined

    let cancelled = false
    const fail = () => {
      if (cancelled) return
      setError('Could not load the sign-up lists right now.')
      setReady(true)
    }

    connect({
      onData: (data, id) => {
        if (cancelled) return
        setRows(data)
        setUid(id)
        setReady(true)
      },
      onSchedules: (data) => {
        if (!cancelled) setSchedules(data)
      },
      onError: fail,
    })
      .then((conn) => {
        if (cancelled) {
          conn.disconnect()
          return
        }
        connection.current = conn
        if (import.meta.env.DEV) window.__signups = conn
      })
      .catch(fail)

    return () => {
      cancelled = true
      connection.current?.disconnect()
      connection.current = null
    }
  }, [])

  const byEvent = useMemo(() => {
    const map = new Map()
    ;[...rows]
      .sort((a, b) => createdTime(a) - createdTime(b))
      .forEach((row) => {
        const list = map.get(row.eventId) ?? []
        list.push({ id: row.id, name: row.name, mine: row.uid === uid })
        map.set(row.eventId, list)
      })
    return map
  }, [rows, uid])

  const scheduleById = useMemo(() => {
    const map = new Map()
    schedules.forEach((s) => {
      map.set(s.id, {
        headName: s.headName,
        date: s.date || '',
        time: s.time || '',
        iAmHead: s.headUid === uid,
      })
    })
    return map
  }, [schedules, uid])

  const playersFor = useCallback((occId) => byEvent.get(occId) ?? NO_PLAYERS, [byEvent])
  const scheduleFor = useCallback((listId) => scheduleById.get(listId) ?? null, [scheduleById])

  const addPlayer = useCallback(
    async (event, rawName) => {
      if (!enabled || !connection.current) {
        return { ok: false, message: 'Sign-ups are not available right now.' }
      }
      const name = cleanName(rawName)
      const problem = nameProblem(name)
      if (problem) return { ok: false, message: problem }

      const existing = byEvent.get(event.occId) ?? NO_PLAYERS
      if (existing.some((player) => nameSlug(player.name) === nameSlug(name))) {
        return { ok: false, message: 'That name is already on the list.' }
      }
      try {
        await connection.current.add(event, name)
        return { ok: true, name }
      } catch {
        return { ok: false, message: 'Could not add your name. Please try again.' }
      }
    },
    [byEvent],
  )

  const removePlayer = useCallback(async (id) => {
    if (!connection.current) return { ok: false }
    try {
      await connection.current.remove(id)
      return { ok: true }
    } catch {
      return { ok: false }
    }
  }, [])

  // The first person to volunteer becomes the head of an event.
  const claimHead = useCallback(async (event, name) => {
    if (!connection.current) return { ok: false }
    try {
      await connection.current.claimHead(event.occId, name)
      return { ok: true }
    } catch {
      return { ok: false }
    }
  }, [])

  const saveSchedule = useCallback(async (event, { date, time }) => {
    if (!connection.current) return { ok: false }
    try {
      await connection.current.saveSchedule(event.occId, { date, time })
      return { ok: true }
    } catch {
      return { ok: false }
    }
  }, [])

  const releaseHead = useCallback(async (event) => {
    if (!connection.current) return { ok: false }
    try {
      await connection.current.releaseHead(event.occId)
      return { ok: true }
    } catch {
      return { ok: false }
    }
  }, [])

  const value = useMemo(
    () => ({
      enabled,
      ready,
      error,
      playersFor,
      scheduleFor,
      addPlayer,
      removePlayer,
      claimHead,
      saveSchedule,
      releaseHead,
    }),
    [
      ready,
      error,
      playersFor,
      scheduleFor,
      addPlayer,
      removePlayer,
      claimHead,
      saveSchedule,
      releaseHead,
    ],
  )

  return <SignupsContext.Provider value={value}>{children}</SignupsContext.Provider>
}
