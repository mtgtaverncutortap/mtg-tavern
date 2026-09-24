import { useState } from 'react'
import { formatListId, formats, PLAYERS_NEEDED } from './formats.config.js'
import { PlayerList } from './PlayerList.jsx'
import { discordInvite } from './site.config.js'
import { useSignups } from './useSignups.js'

const formatDay = (key) => {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

const MAX_CHIPS = 8

// The details PlayerList needs to show and change one format's list.
const listEventFor = (format) => ({
  occId: formatListId(format.id),
  key: '9999-12-31',
  title: format.name,
  headable: true,
})

// A format that already has players: one table row, with a second row when opened.
function ActiveRow({ format, players, schedule }) {
  const [open, setOpen] = useState(false)
  const count = players.length
  const ready = count >= PLAYERS_NEEDED

  const plannedDate = schedule?.date || format.date
  const plannedTime = schedule?.time || format.time
  const planned = plannedDate
    ? `${formatDay(plannedDate)}${plannedTime ? ` · ${plannedTime}` : ''}`
    : null

  return (
    <>
      <tr className={ready ? 'ready' : ''}>
        <th scope="row" data-label="Format">
          {format.name}
          {format.description && <span className="format-desc-inline">{format.description}</span>}
          {ready && (
            <span className="event-badge">{planned ? 'On the calendar' : 'Ready to schedule'}</span>
          )}
        </th>
        <td data-label="Players">
          {players.slice(0, MAX_CHIPS).map((player) => (
            <span className="name-chip" key={player.id}>
              {player.name}
            </span>
          ))}
          {count > MAX_CHIPS && <span className="name-more">+{count - MAX_CHIPS} more</span>}
        </td>
        <td data-label="Progress">
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
          <span className="progress-text">
            {count} of {PLAYERS_NEEDED}
          </span>
        </td>
        <td data-label="Head">{schedule?.headName ?? '—'}</td>
        <td data-label="Planned">{planned ?? '—'}</td>
        <td className="format-action">
          <button
            type="button"
            className="button-link"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            {open ? 'Close' : 'Join / manage'}
          </button>
        </td>
      </tr>
      {open && (
        <tr className="format-open-row">
          <td colSpan={6}>
            <PlayerList event={listEventFor(format)} players={players} />
            {ready && !planned && (
              <p className="players-note">
                {count} players are in!{' '}
                {schedule ? `${schedule.headName} will pick` : "We'll pick"} a date and add it to
                the calendar.
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

// A format nobody has joined yet: a single slim line until someone opens it.
function CompactRow({ format, players }) {
  const [open, setOpen] = useState(false)

  return (
    <li className="format-compact-item">
      <div className="format-compact-line">
        <span className="format-compact-name" title={format.name}>
          {format.name}
        </span>
        <button
          type="button"
          className="button-link"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          {open ? 'Close' : 'Sign up'}
        </button>
      </div>
      {open && (
        <div className="format-compact-panel">
          <p className="format-compact-full-name">{format.name}</p>
          {format.description && <p className="players-note">{format.description}</p>}
          <PlayerList event={listEventFor(format)} players={players} />
        </div>
      )}
    </li>
  )
}

export function Formats() {
  const { playersFor, scheduleFor } = useSignups()
  const [query, setQuery] = useState('')

  const needle = query.trim().toLowerCase()
  const rows = formats
    .filter((format) => !needle || format.name.toLowerCase().includes(needle))
    .map((format) => ({
      format,
      players: playersFor(formatListId(format.id)),
      schedule: scheduleFor(formatListId(format.id)),
    }))

  // Fullest lists first; formats with nobody on them get one slim line each.
  const active = rows
    .filter((row) => row.players.length > 0)
    .sort((a, b) => b.players.length - a.players.length || a.format.name.localeCompare(b.format.name))
  const empty = rows.filter((row) => row.players.length === 0)

  return (
    <div className="formats">
      <h3 className="events-list-title">Sign up for a Magic format</h3>
      <p className="pending-intro">
        Pick the formats you want to play and put your name on the list. Once {PLAYERS_NEEDED}{' '}
        players are on a list, we pick a date and add the game to the calendar
        {discordInvite ? ' and announce it in our Discord' : ''}.
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

      {rows.length === 0 && <p className="events-empty">No formats match that search.</p>}

      {active.length > 0 && (
        <>
          <h4 className="format-group-title">Filling up</h4>
          <div className="format-table-wrap">
            <table className="format-table">
              <thead>
                <tr>
                  <th scope="col">Format</th>
                  <th scope="col">Players</th>
                  <th scope="col">Progress</th>
                  <th scope="col">Head</th>
                  <th scope="col">Planned</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {active.map(({ format, players, schedule }) => (
                  <ActiveRow key={format.id} format={format} players={players} schedule={schedule} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {empty.length > 0 && (
        <>
          <h4 className="format-group-title">No players yet</h4>
          <ul className="format-compact">
            {empty.map(({ format, players }) => (
              <CompactRow key={format.id} format={format} players={players} />
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
