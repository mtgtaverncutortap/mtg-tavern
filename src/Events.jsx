import { useMemo, useState } from 'react'
import { events } from './events.config.js'
import { Flame } from './Fire.jsx'
import { useMembership } from './useMembership.js'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const pad = (n) => String(n).padStart(2, '0')
const toKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
const parseKey = (key) => {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}
const formatDay = (key) =>
  parseKey(key).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

// Every date an event happens on inside the given month (weekly events repeat).
function occurrencesInMonth(list, year, month) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const found = []

  list.forEach((event, index) => {
    const start = parseKey(event.date)

    if (!event.weekly) {
      if (start >= first && start <= last) {
        found.push({ ...event, key: event.date, id: `${index}-${event.date}` })
      }
      return
    }

    const until = event.until ? parseKey(event.until) : last
    const stop = until < last ? until : last
    const cursor = new Date(start)
    while (cursor < first) cursor.setDate(cursor.getDate() + 7)
    for (; cursor <= stop; cursor.setDate(cursor.getDate() + 7)) {
      const key = toKey(cursor)
      found.push({ ...event, key, id: `${index}-${key}` })
    }
  })

  return found.sort((a, b) => a.key.localeCompare(b.key))
}

function EventCard({ event, isMember }) {
  const locked = event.membersOnly && !isMember

  return (
    <article className={`card event-card${event.membersOnly ? ' event-members' : ''}`}>
      <p className="event-date">
        {formatDay(event.key)}
        {event.time ? ` · ${event.time}` : ''}
      </p>
      <h3>
        {locked ? 'Member event' : event.title}
        {event.membersOnly && !locked && <span className="event-badge">Members</span>}
      </h3>
      {locked ? (
        <p className="event-locked">
          Members get the full details. <a href="#membership">Become a member</a>
        </p>
      ) : (
        event.details && <p>{event.details}</p>
      )}
    </article>
  )
}

export default function Events() {
  const { isMember } = useMembership()
  const todayKey = toKey(new Date())
  const [view, setView] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selected, setSelected] = useState(null)

  const monthEvents = useMemo(
    () => occurrencesInMonth(events, view.year, view.month),
    [view.year, view.month],
  )

  const byDay = useMemo(() => {
    const map = new Map()
    monthEvents.forEach((event) => {
      map.set(event.key, [...(map.get(event.key) ?? []), event])
    })
    return map
  }, [monthEvents])

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
        <h3 className="events-list-title">
          {selected ? formatDay(selected) : `Events in ${monthLabel}`}
        </h3>

        {events.length === 0 && <p className="events-empty">Events will be posted here soon.</p>}

        {events.length > 0 && shown.length === 0 && (
          <p className="events-empty">Nothing scheduled here. Try another month.</p>
        )}

        {shown.length > 0 && (
          <div className="cards">
            {shown.map((event) => (
              <EventCard event={event} isMember={isMember} key={event.id} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
