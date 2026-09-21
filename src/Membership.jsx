import { membership, memberContent } from './membership.config.js'
import { useMembership } from './useMembership.js'

// Log in / Join / Log out buttons shown in the top menu.
export function AccountNav() {
  const { enabled, loading, member, isMember, login, logout } = useMembership()

  if (!enabled) {
    return (
      <div className="nav-account">
        <a className="nav-join" href="#membership">
          Join
        </a>
      </div>
    )
  }

  if (loading) return null

  if (!member) {
    return (
      <div className="nav-account">
        <button type="button" className="nav-login" onClick={login}>
          Log in
        </button>
        <a className="nav-join" href="#membership">
          Join
        </a>
      </div>
    )
  }

  return (
    <div className="nav-account">
      {isMember ? (
        <a className="nav-join" href="#members">
          Members
        </a>
      ) : (
        <a className="nav-join" href="#membership">
          Join
        </a>
      )}
      <button type="button" className="nav-login" onClick={logout}>
        Log out
      </button>
    </div>
  )
}

// The "Become a member" pitch. Hidden once someone is an active member.
export function MembershipSection() {
  const { enabled, loading, member, isMember, error, join, login, refresh } = useMembership()

  if (isMember) return null

  const email = member?.auth?.email

  return (
    <section id="membership" className="section membership-section">
      <h2>Become a member</h2>
      <div className="card membership-card">
        <p className="membership-price">
          <span>{membership.priceLabel}</span> / {membership.intervalLabel}
        </p>
        <ul className="membership-perks">
          <li>Access to tavern activities</li>
          <li>A members-only page with the event schedule</li>
          <li>Your own personal account</li>
        </ul>

        {!enabled && (
          <p className="membership-note">Memberships are opening soon. Check back shortly!</p>
        )}

        {enabled && member && (
          <>
            <p className="membership-note">
              You&rsquo;re logged in{email ? ` as ${email}` : ''}. Finish joining to unlock the
              members lounge.
            </p>
            <div className="membership-actions">
              <button type="button" className="button" onClick={join}>
                Finish joining
              </button>
              <button type="button" className="button-link" onClick={refresh}>
                Already paid? Check my membership
              </button>
            </div>
          </>
        )}

        {enabled && !member && (
          <div className="membership-actions">
            <button type="button" className="button" onClick={join} disabled={loading}>
              Join for {membership.priceLabel}/{membership.intervalLabel}
            </button>
            <button type="button" className="button-link" onClick={login} disabled={loading}>
              Already a member? Log in
            </button>
          </div>
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

// The members-only page. Only rendered for active members.
export function MembersArea() {
  const { isMember, member, error, manageBilling } = useMembership()

  if (!isMember) return null

  const email = member?.auth?.email

  return (
    <section id="members" className="section members-section">
      <h2>{memberContent.welcome}</h2>
      {email && <p className="members-email">Logged in as {email}</p>}
      <p className="members-announcement">{memberContent.announcement}</p>

      {memberContent.events.length > 0 && (
        <div className="cards members-events">
          {memberContent.events.map((event) => (
            <article className="card" key={event.title}>
              <h3>{event.title}</h3>
              <p className="event-when">{event.when}</p>
              <p>{event.details}</p>
            </article>
          ))}
        </div>
      )}

      <button type="button" className="button-link" onClick={manageBilling}>
        Manage billing
      </button>

      {error && (
        <p className="membership-error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
