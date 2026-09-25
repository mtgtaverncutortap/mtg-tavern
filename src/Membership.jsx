import { useEffect, useId, useRef, useState } from 'react'
import { contactEmail, memberContent, tiers } from './membership.config.js'
import { useMembership } from './useMembership.js'

// Scrolls an element into view a moment after it appears, so opening a form
// that renders below the current scroll position is actually visible.
function scrollToSoon(ref) {
  ref.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
}

const mailtoRequest = ({ name, email, tierName, note }) => {
  const subject = `Membership request: ${tierName}`
  const body = `Name: ${name}\nEmail: ${email}\nTier requested: ${tierName}\n${note ? `Note: ${note}\n` : ''}`
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

// Log in / account link shown in the top menu.
export function AccountNav() {
  const { enabled, loading, user, isMember, logout } = useMembership()

  if (!enabled || loading) return null

  if (!user) {
    return (
      <div className="nav-account">
        <a className="nav-login" href="#membership-login">
          Log in
        </a>
        <a className="nav-join" href="#membership-join">
          Join
        </a>
      </div>
    )
  }

  return (
    <div className="nav-account">
      <a className="nav-join" href={isMember ? '#members' : '#membership'}>
        {isMember ? 'Members' : 'Account'}
      </a>
      <button type="button" className="nav-login" onClick={logout}>
        Log out
      </button>
    </div>
  )
}

// The request-to-join form. Writes the request and opens an email to the shop.
function RequestForm({ defaultTierId }) {
  const { requestJoin } = useMembership()
  const nameId = useId()
  const emailId = useId()
  const tierId = useId()
  const noteId = useId()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [tier, setTier] = useState(defaultTierId)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const result = await requestJoin({ name: name.trim(), email: email.trim(), tier, note: note.trim() })
    setBusy(false)

    const tierName = tiers.find((t) => t.id === tier)?.name ?? tier
    window.location.href = mailtoRequest({ name, email, tierName, note })

    if (result.ok) setSent(true)
    else setMessage(result.message)
  }

  if (sent) {
    return (
      <p className="players-note">
        Request sent! We also opened an email to {contactEmail} so you can send it directly, in
        case your browser didn&rsquo;t. We&rsquo;ll review your request and email you once
        you&rsquo;re approved.
      </p>
    )
  }

  return (
    <form className="players-form membership-form" onSubmit={submit}>
      <label htmlFor={nameId}>Your name</label>
      <input
        id={nameId}
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={60}
        required
      />

      <label htmlFor={emailId}>Your email</label>
      <input
        id={emailId}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        maxLength={100}
        required
      />

      <label htmlFor={tierId}>Tier</label>
      <select id={tierId} value={tier} onChange={(event) => setTier(event.target.value)}>
        {tiers.map((t) => (
          <option value={t.id} key={t.id}>
            {t.name} ({t.price}/{t.interval})
          </option>
        ))}
      </select>

      <label htmlFor={noteId}>Note (optional)</label>
      <textarea
        id={noteId}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={300}
        rows={3}
      />

      <button type="submit" className="button" disabled={busy}>
        Send request
      </button>
      {message && (
        <p className="players-error" role="alert">
          {message}
        </p>
      )}
    </form>
  )
}

function CreateAccountForm() {
  const { createAccount } = useMembership()
  const emailId = useId()
  const passwordId = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const result = await createAccount(email.trim(), password)
    setBusy(false)
    if (!result.ok) setMessage(result.message)
  }

  return (
    <form className="players-form membership-form" onSubmit={submit}>
      <label htmlFor={emailId}>The email you were approved with</label>
      <input
        id={emailId}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <label htmlFor={passwordId}>Choose a password</label>
      <input
        id={passwordId}
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={6}
        required
      />
      <button type="submit" className="button" disabled={busy}>
        Create account
      </button>
      {message && (
        <p className="players-error" role="alert">
          {message}
        </p>
      )}
    </form>
  )
}

function LoginForm() {
  const { login } = useMembership()
  const emailId = useId()
  const passwordId = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    const result = await login(email.trim(), password)
    setBusy(false)
    if (!result.ok) setMessage(result.message)
  }

  return (
    <form className="players-form membership-form" onSubmit={submit}>
      <label htmlFor={emailId}>Email</label>
      <input
        id={emailId}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <label htmlFor={passwordId}>Password</label>
      <input
        id={passwordId}
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <button type="submit" className="button" disabled={busy}>
        Log in
      </button>
      {message && (
        <p className="players-error" role="alert">
          {message}
        </p>
      )}
    </form>
  )
}

// Explains the tiers and hosts the request / create-account / log-in forms.
export function MembershipSection() {
  const { enabled, user, verified, pending, isMember, resendVerification, logout, error } =
    useMembership()
  const [open, setOpen] = useState(null) // 'request' | 'create' | 'login' | null
  const [requestTier, setRequestTier] = useState(tiers[0]?.id)
  const footerRef = useRef(null)

  // The nav's Join / Log in links point at #membership-join / #membership-login so
  // clicking them opens the right form here, instead of just landing on the section.
  useEffect(() => {
    const applyHash = () => {
      if (window.location.hash === '#membership-join') {
        setOpen('request')
        scrollToSoon(footerRef)
      } else if (window.location.hash === '#membership-login') {
        setOpen('login')
        scrollToSoon(footerRef)
      }
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [])

  if (isMember) return null

  const openWithTier = (tierId) => {
    setRequestTier(tierId)
    setOpen('request')
    scrollToSoon(footerRef)
  }

  // Clears the #membership-join / #membership-login hash on close, so clicking the
  // same nav link again later still triggers a hash change and reopens the form.
  const closeForm = () => {
    setOpen(null)
    if (window.location.hash === '#membership-join' || window.location.hash === '#membership-login') {
      history.replaceState(null, '', '#membership')
    }
  }

  return (
    <section id="membership" className="section membership-section">
      <h2>Membership</h2>
      <p className="tiers-intro">
        Choose the tier that fits how you play, then send a request to join. We review every
        request by hand and email you once you&rsquo;re approved.
      </p>

      <div className="tiers">
        {tiers.map((tier) => (
          <article className="card tier-card" key={tier.id}>
            <p className="tier-label">{tier.label}</p>
            <h3 className="tier-name">{tier.name}</h3>
            <p className="membership-price">
              <span>{tier.price}</span> / {tier.interval}
            </p>
            <ul className="membership-perks">
              {tier.perks.map((perk) => (
                <li key={perk}>{perk}</li>
              ))}
            </ul>
            <div className="tier-action">
              {!user && (
                <button type="button" className="button" onClick={() => openWithTier(tier.id)}>
                  Request to join
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="tiers-footer" ref={footerRef}>
        {!enabled && <p>Memberships are opening soon. Check back shortly!</p>}

        {enabled && !user && (
          <>
            {open === 'request' ? (
              <>
                <RequestForm defaultTierId={requestTier} />
                <button type="button" className="button-link" onClick={closeForm}>
                  Close
                </button>
              </>
            ) : (
              <div className="membership-actions">
                <button
                  type="button"
                  className="button-link"
                  onClick={() => {
                    setOpen('create')
                    scrollToSoon(footerRef)
                  }}
                >
                  Already approved? Create your account
                </button>
                <button
                  type="button"
                  className="button-link"
                  onClick={() => {
                    setOpen('login')
                    scrollToSoon(footerRef)
                  }}
                >
                  Already have an account? Log in
                </button>
              </div>
            )}
            {open === 'create' && (
              <>
                <CreateAccountForm />
                <button type="button" className="button-link" onClick={closeForm}>
                  Close
                </button>
              </>
            )}
            {open === 'login' && (
              <>
                <LoginForm />
                <button type="button" className="button-link" onClick={closeForm}>
                  Close
                </button>
              </>
            )}
          </>
        )}

        {enabled && user && !verified && (
          <>
            <p>
              You&rsquo;re signed up as {user.email}. Check your inbox for a verification email
              and click the link, then come back here.
            </p>
            <button type="button" className="button-link" onClick={resendVerification}>
              Resend verification email
            </button>
            <button type="button" className="button-link" onClick={logout}>
              Log out
            </button>
          </>
        )}

        {enabled && user && verified && pending && (
          <>
            <p>
              You&rsquo;re logged in as {user.email}. Your membership request is still pending
              review. We&rsquo;ll email you once you&rsquo;re approved.
            </p>
            <button type="button" className="button-link" onClick={logout}>
              Log out
            </button>
          </>
        )}

        {error && (
          <p className="membership-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  )
}

// The members-only page. Only rendered for approved, verified members.
export function MembersArea() {
  const { isMember, user, tier, memberId, error, logout } = useMembership()

  if (!isMember) return null

  return (
    <section id="members" className="section members-section">
      <h2>{memberContent.welcome}</h2>
      {user?.email && <p className="members-email">Logged in as {user.email}</p>}
      <p className="members-announcement">{memberContent.announcement}</p>

      {tier && (
        <article className="card members-tier">
          <p className="tier-label">Your tier</p>
          <h3 className="tier-name">
            {tier.name} <span className="members-tier-label">({tier.label})</span>
          </h3>
          {memberId && <p className="members-id">Member ID: {memberId}</p>}
          <ul className="membership-perks">
            {tier.perks.map((perk) => (
              <li key={perk}>{perk}</li>
            ))}
          </ul>
        </article>
      )}

      <p className="members-announcement">
        <a href="#events">See the member events in the calendar</a>
      </p>

      <button type="button" className="button-link" onClick={logout}>
        Log out
      </button>

      {error && (
        <p className="membership-error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
