import { useState } from 'react'
import { events } from './events.config.js'
import { Flame } from './Fire.jsx'
import { formatListId, formats, PLAYERS_NEEDED } from './formats.config.js'
import { Formats } from './Formats.jsx'
import { PlayerList } from './PlayerList.jsx'
import { useMembership } from './useMembership.js'
import { useSignups } from './useSignups.js'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const pad = (n) => String(n).padStart(2, '0')
const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const parseKey = (key) => {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}
const formatDay = (key) =>
  parseKey(key).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

// One dated happening of an event, with an id that sign-up names are stored under.
const makeOccurrence = (event, index, key) => ({
  ...event,
  key,
  id: `${index}-${key}`,
  occId: event.listId ?? `${event.id ?? `event-${index}`}:${key}`,
})

// Every date an event happens on inside the given month (daily and weekly events repeat).
function occurrencesInMonth(list, year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const found = []

  list.forEach((event, index) => {
    const start = parseKey(event.date)

    if (!event.weekly && !event.daily) {
      if (start >= first && start <= last) found.push(makeOccurrence(event, index, event.date))
      return
    }

    const until = event.until ? parseKey(event.until) : last
    const stop = until < last ? until : last

    if (event.daily) {
      const cursor = new Date(Math.max(start, first))
      for (; cursor <= stop; cursor.setDate(cursor.getDate() + 1)) {
        found.push(makeOccurrence(event, index, toKey(cursor)))
      }
      return
    }

    // Weekly: keep the same weekday as the start date, so nudge forward in 7-day
    // steps rather than jumping straight to the first of the month.
    const cursor = new Date(start)
    while (cursor < first) cursor.setDate(cursor.getDate() + 7)
    for (; cursor <= stop; cursor.setDate(cursor.getDate() + 7)) {
      found.push(makeOccurrence(event, index, toKey(cursor)))
    }
  })

  return found.sort((a, b) => a.key.localeCompare(b.key))
}

// Games that need a minimum number of players stay off the calendar until they have them.
const playersNeeded = (occurrence) => (occurrence.weekly ? null : (occurrence.minPlayers ?? null))

function EventCard({ event, isMember, defaultOpen = false, pending = false }) {
  const { playersFor } = useSignups()
  const [open, setOpen] = useState(defaultOpen)

  const locked = event.membersOnly && !isMember
  const players = playersFor(event.occId)
  const goal = playersNeeded(event)
  const hasList = Boolean(event.signup || goal)
  const missing = goal ? Math.max(goal - players.length, 0) : 0

  return (
    <article className={`card event-card${event.membersOnly ? ' event-members' : ''}`}>
      <p className="event-date">
        {formatDay(event.key)}
        {event.time ? ` · ${event.time}` : ''}
      </p>
      <h3>
        {locked ? 'Member event' : event.title}
        {event.membersOnly && !locked && <span className="event-badge">Members</span>}
        {goal && !pending && <span className="event-badge">Confirmed</span>}
      </h3>

      {locked ? (
        <p className="event-locked">
          Members get the full details. <a href="#membership">Become a member</a>
        </p>
      ) : (
        event.details && <p>{event.details}</p>
      )}

      {!locked && goal && pending && (
        <div className="progress-wrap">
          <div
            className="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={goal}
            aria-valuenow={Math.min(players.length, goal)}
            aria-label="Players signed up"
          >
            <span style={{ width: `${Math.min((players.length / goal) * 100, 100)}%` }} />
          </div>
          <p className="progress-text">
            {players.length} of {goal} players
            {missing > 0 ? ` · ${missing} more to put it on the calendar` : ''}
          </p>
        </div>
      )}

      {!locked && hasList && (
        <>
          <button
            type="button"
            className="button-link event-players-toggle"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            {open ? 'Hide players' : `See who’s playing (${players.length})`}
          </button>
          {open && <PlayerList event={event} players={players} />}
        </>
      )}
    </article>
  )
}

export default function Events() {
  const { isMember } = useMembership()
  const { enabled: signupsOn, playersFor, scheduleFor } = useSignups()
  const todayKey = toKey(new Date())

  // A format with a date (set in formats.config.js, or by its head) joins the
  // calendar once its list of players is full.
  const scheduledFormats = formats.flatMap((format) => {
    const schedule = scheduleFor(formatListId(format.id))
    const date = schedule?.date || format.date
    if (!date) return []
    return [
      {
        id: format.id,
        listId: formatListId(format.id),
        date,
        time: schedule?.time || format.time,
        title: format.name,
        details: format.description,
        minPlayers: PLAYERS_NEEDED,
        signup: true,
        headable: true,
      },
    ]
  })
  const allEvents = [...events, ...scheduledFormats]
  const [view, setView] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selected, setSelected] = useState(null)

  const isOnCalendar = (occurrence) => {
    const goal = playersNeeded(occurrence)
    return !goal || playersFor(occurrence.occId).length >= goal
  }

  // Only confirmed games make it onto the calendar.
  const monthEvents = occurrencesInMonth(allEvents, view.year, view.month).filter(isOnCalendar)

  const byDay = new Map()
  monthEvents.forEach((event) => {
    byDay.set(event.key, [...(byDay.get(event.key) ?? []), event])
  })

  // Upcoming games that still need players.
  const pending = allEvents
    .flatMap((event, index) =>
      playersNeeded(event) && event.date >= todayKey ? [makeOccurrence(event, index, event.date)] : [],
    )
    .filter((occurrence) => !isOnCalendar(occurrence))
    .sort((a, b) => a.key.localeCompare(b.key))

  const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  const leadingBlanks = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()

  const changeMonth = (delta) => {
    const next = new Date(view.year, view.month + delta, 1)
    setView({ year: next.getFullYear(), month: next.getMonth() })
    setSelected(null)
  }

  const shown = selected ? (byDay.get(selected) ?? []) : monthEvents
  const noEventsAtAll = allEvents.length === 0

  return (
    <section id="events" className="section events-section">
      <h2>Events</h2>

      <div className="announcement" role="note">
        <Flame className="flame-icon" />
        <p>Commander is happening 24/7</p>
        <Flame className="flame-icon" delay={-0.4} />
      </div>

      <div className="calendar">
        <div className="cal-header">
          <button
            type="button"
            className="cal-nav"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
          >
            &lsaquo;
          </button>
          <h3 className="cal-title" aria-live="polite">
            {monthLabel}
          </h3>
          <button
            type="button"
            className="cal-nav"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
          >
            &rsaquo;
          </button>
        </div>

        <div className="cal-grid">
          {WEEKDAYS.map((day) => (
            <div className="cal-weekday" key={day}>
              {day}
            </div>
          ))}

          {Array.from({ length: leadingBlanks }, (_, i) => (
            <div className="cal-blank" key={`blank-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const key = toKey(new Date(view.year, view.month, day))
            const dayEvents = byDay.get(key) ?? []
            const classes = [
              'cal-day',
              key === todayKey ? 'today' : '',
              dayEvents.length ? 'has-events' : '',
              key === selected ? 'selected' : '',
            ]
              .filter(Boolean)
              .join(' ')

            const dots = dayEvents.map((event) => (
              <span
                key={event.id}
                className={`cal-dot ${event.membersOnly ? 'members' : 'public'}`}
              />
            ))

            if (!dayEvents.length) {
              return (
                <div className={classes} key={key}>
                  <span className="cal-num">{day}</span>
                </div>
              )
            }

            return (
              <button
                type="button"
                className={classes}
                key={key}
                onClick={() => setSelected(key === selected ? null : key)}
                aria-pressed={key === selected}
                aria-label={`${formatDay(key)}, ${dayEvents.length} ${
                  dayEvents.length === 1 ? 'event' : 'events'
                }`}
              >
                <span className="cal-num">{day}</span>
                <span className="cal-dots">{dots}</span>
              </button>
            )
          })}
        </div>

        <p className="cal-legend">
          <span className="cal-dot public" /> Open to everyone
          <span className="cal-dot members" /> Members
        </p>
      </div>

      <div className="events-list">
        {selected && <h3 className="events-list-title">{formatDay(selected)}</h3>}

        {!noEventsAtAll && shown.length === 0 && (
          <p className="events-empty">Nothing scheduled here. Try another month.</p>
        )}

        {shown.length > 0 && (
          <div className="cards">
            {shown.map((event) => (
              <EventCard
                event={event}
                isMember={isMember}
                defaultOpen={Boolean(selected)}
                key={`${event.id}-${selected ?? 'month'}`}
              />
            ))}
          </div>
        )}
      </div>

      {signupsOn && pending.length > 0 && (
        <div className="events-list pending-list">
          <h3 className="events-list-title">Games looking for players</h3>
          <p className="pending-intro">
            Put your name on the list. Once {pending[0].minPlayers} players are on a list, that game
            is added to the calendar.
          </p>
          <div className="cards">
            {pending.map((event) => (
              <EventCard event={event} isMember={isMember} defaultOpen pending key={event.id} />
            ))}
          </div>
        </div>
      )}

      {/* Hidden until the sign-up database is connected (see signups.config.js). */}
      {signupsOn && <Formats />}
    </section>
  )
}
