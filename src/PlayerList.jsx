import { useId, useState } from 'react'
import { discordInvite } from './site.config.js'
import { useMembership } from './useMembership.js'
import { useSignups } from './useSignups.js'

const pad = (n) => String(n).padStart(2, '0')
const todayKey = () => {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const formatDay = (key) => {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

const DiscordLink = ({ children }) =>
  discordInvite ? (
    <a href={discordInvite} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  ) : (
    <>{children}</>
  )

// Shown only to the person who volunteered as head of an event.
function HeadPanel({ event, schedule }) {
  const { saveSchedule, releaseHead } = useSignups()
  const dateId = useId()
  const timeId = useId()
  const [date, setDate] = useState(schedule.date)
  const [time, setTime] = useState(schedule.time)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const save = async (submitEvent) => {
    submitEvent.preventDefault()
    setMessage('')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayKey()) {
      setMessage('Please pick a date that is today or later.')
      return
    }
    setBusy(true)
    const result = await saveSchedule(event, { date, time: time.trim().slice(0, 20) })
    setBusy(false)
    setMessage(
      result.ok
        ? 'Saved! Once enough players are on the list, it shows on the calendar for this date and time.'
        : 'Could not save. Please try again.',
    )
  }

  return (
    <form className="head-panel" onSubmit={save}>
      <p className="head-title">You&rsquo;re the head of this event</p>
      <p className="players-note">
        Pick when it happens, then set it up in <DiscordLink>our Discord</DiscordLink>: make or
        find its channel and post the details there.
      </p>
      <div className="head-fields">
        <label htmlFor={dateId}>
          Date
          <input
            id={dateId}
            type="date"
            value={date}
            min={todayKey()}
            onChange={(changeEvent) => setDate(changeEvent.target.value)}
            required
          />
        </label>
        <label htmlFor={timeId}>
          Time
          <input
            id={timeId}
            type="text"
            value={time}
            maxLength={20}
            placeholder="7:00 PM"
            onChange={(changeEvent) => setTime(changeEvent.target.value)}
          />
        </label>
      </div>
      <div className="head-actions">
        <button type="submit" className="button" disabled={busy}>
          Save date &amp; time
        </button>
        <button type="button" className="button-link" onClick={() => releaseHead(event)}>
          Step down as head
        </button>
      </div>
      {message && (
        <p className="players-note" role="status">
          {message}
        </p>
      )}
    </form>
  )
}

// The list of names for one event, plus the form to add your own.
export function PlayerList({ event, players }) {
  const { enabled, ready, error, addPlayer, removePlayer, scheduleFor, claimHead } = useSignups()
  const { user, verified, isMember, memberName } = useMembership()
  const inputId = useId()
  const headId = useId()
  const [name, setName] = useState(memberName ?? '')
  const [wantsHead, setWantsHead] = useState(false)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const schedule = event.headable ? scheduleFor(event.occId) : null
  const canVolunteer = Boolean(event.headable && !schedule)

  const submit = async (submitEvent) => {
    submitEvent.preventDefault()
    setBusy(true)
    setMessage('')
    const result = await addPlayer(event, name)

    if (!result.ok) {
      setMessage(result.message)
    } else {
      setName('')
      if (wantsHead && canVolunteer) {
        const claimed = await claimHead(event, result.name)
        if (!claimed.ok) {
          setMessage('You are on the list, but someone else just became the head of this event.')
        }
        setWantsHead(false)
      }
    }
    setBusy(false)
  }

  return (
    <div className="players">
      {schedule && !schedule.iAmHead && (
        <p className="head-line">
          Head: <strong>{schedule.headName}</strong>
          {schedule.date ? ` · planned for ${formatDay(schedule.date)}` : ''}
          {schedule.time ? ` at ${schedule.time}` : ''}
        </p>
      )}

      {schedule?.iAmHead && <HeadPanel event={event} schedule={schedule} />}

      {players.length === 0 ? (
        <p className="players-empty">No names yet. Be the first!</p>
      ) : (
        <ol className="players-list">
          {players.map((player) => (
            <li key={player.id}>
              <span>{player.name}</span>
              {player.mine && (
                <button
                  type="button"
                  className="players-remove"
                  onClick={() => removePlayer(player.id)}
                  aria-label={`Remove ${player.name} from the list`}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ol>
      )}

      {enabled && isMember ? (
        <form className="players-form" onSubmit={submit}>
          <label className="visually-hidden" htmlFor={inputId}>
            Your name
          </label>
          <div className="players-row">
            <input
              id={inputId}
              type="text"
              value={name}
              onChange={(changeEvent) => setName(changeEvent.target.value)}
              maxLength={30}
              placeholder="Your name"
              autoComplete="nickname"
              required
            />
            <button type="submit" className="button" disabled={busy || !ready}>
              Add my name
            </button>
          </div>

          {canVolunteer && (
            <div className="head-ask">
              <input
                id={headId}
                type="checkbox"
                checked={wantsHead}
                onChange={(changeEvent) => setWantsHead(changeEvent.target.checked)}
              />
              <label htmlFor={headId}>
                <strong>Want to be the head of this event?</strong> The head picks the date and
                time on the calendar and sets the event up in its Discord channel.
              </label>
            </div>
          )}

          <p className="players-note">Your name will be shown publicly on this page.</p>
          {discordInvite && (
            <p className="players-note">
              <DiscordLink>Join our Discord</DiscordLink> to hear when this game is scheduled.
            </p>
          )}
          {(message || error) && (
            <p className="players-error" role="alert">
              {message || error}
            </p>
          )}
        </form>
      ) : enabled && !user ? (
        <p className="players-note">
          Members can join events. <a href="#membership-login">Log in</a> or{' '}
          <a href="#membership-join">request membership</a>.
        </p>
      ) : enabled && !verified ? (
        <p className="players-note">Verify your email to join events. Check your inbox for the link.</p>
      ) : enabled && !isMember ? (
        <p className="players-note">
          Your membership isn&rsquo;t active. <a href="#membership-join">Request membership</a> to
          join events.
        </p>
      ) : (
        <p className="players-note">Sign-ups aren&rsquo;t online yet.</p>
      )}
    </div>
  )
}
