import { useState } from 'react'
import { formatListId, formats, PLAYERS_NEEDED } from './formats.config.js'
import { PlayerList } from './PlayerList.jsx'
import { discordInvite } from './site.config.js'
import { useSignups } from './useSignups.js'

const formatDay = (key) => {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function FormatCard({ format }) {
  const { playersFor, scheduleFor } = useSignups()
  const [open, setOpen] = useState(false)

  // Counts stay the same whether or not the format has been given a calendar date.
  const listEvent = {
    occId: formatListId(format.id),
    key: '9999-12-31',
    title: format.name,
    headable: true,
  }
  const players = playersFor(listEvent.occId)
  const schedule = scheduleFor(listEvent.occId)
  const count = players.length
  const ready = count >= PLAYERS_NEEDED

  const plannedDate = schedule?.date || format.date
  const plannedTime = schedule?.time || format.time
  const planned = plannedDate
    ? `${formatDay(plannedDate)}${plannedTime ? ` · ${plannedTime}` : ''}`
    : null

  return (
    <article className={`format-card${ready ? ' ready' : ''}`}>
      <div className="format-top">
        <h4 className="format-name">{format.name}</h4>
        {ready && <span className="event-badge">{planned ? 'On the calendar' : 'Ready to schedule'}</span>}
      </div>
      {format.description && <p className="format-desc">{format.description}</p>}
      {planned && <p className="format-desc">Planned: {planned}</p>}

      <div
        className="progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={PLAYERS_NEEDED}
        aria-valuenow={Math.min(count, PLAYERS_NEEDED)}
        aria-label={`Players signed up for ${format.name}`}
      >
        <span style={{ width: `${Math.min((count / PLAYERS_NEEDED) * 100, 100)}%` }} />
      </div>
      <p className="progress-text">
        {ready
          ? planned
            ? `${count} players are in! It's on the calendar.`
            : `${count} players are in! ${schedule ? `${schedule.headName} will pick` : "We'll pick"} a date and add it to the calendar.`
          : `${count} of ${PLAYERS_NEEDED} players`}
      </p>
      {ready && discordInvite && (
        <p className="progress-text">
          <a href={discordInvite} target="_blank" rel="noopener noreferrer">
            Join our Discord
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>{' '}
          to hear the date.
        </p>
      )}

      <button
        type="button"
        className="button-link event-players-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {open ? 'Hide players' : `Sign up / see who’s in (${count})`}
      </button>
      {open && <PlayerList event={listEvent} players={players} />}
    </article>
  )
}

export function Formats() {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const shown = needle
    ? formats.filter((format) => format.name.toLowerCase().includes(needle))
    : formats

  return (
    <div className="formats">
      <h3 className="events-list-title">Sign up for a format</h3>
      <p className="pending-intro">
        Pick the formats you want to play and put your name on the list. Once {PLAYERS_NEEDED}{' '}
        players are on a list, we pick a date and add the game to the calendar
        {discordInvite ? ' and announce it in our Discord' : ''}.
      </p>
      <p className="pending-intro">
        We&rsquo;re also building a varsity Commander team to compete against other shops.
      </p>

      <label className="visually-hidden" htmlFor="format-search">
        Search formats
      </label>
      <input
        id="format-search"
        className="format-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search formats"
      />

      {shown.length === 0 ? (
        <p className="events-empty">No formats match that search.</p>
      ) : (
        <div className="format-grid">
          {shown.map((format) => (
            <FormatCard format={format} key={format.id} />
          ))}
        </div>
      )}
    </div>
  )
}
