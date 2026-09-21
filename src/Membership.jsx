import { memberContent, tiers } from './membership.config.js'
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

// Explains the tiers and lets people join the one they choose.
export function MembershipSection() {
  const {
    enabled,
    loading,
    member,
    isMember,
    tier: currentTier,
    error,
    join,
    login,
    manageBilling,
    refresh,
  } = useMembership()

  const email = member?.auth?.email

  return (
    <section id="membership" className="section membership-section">
      <h2>Membership</h2>
      <p className="tiers-intro">Choose the tier that fits how you play.</p>

      <div className="tiers">
        {tiers.map((tier) => {
          const canJoin = enabled && Boolean(tier.priceId)
          const isCurrent = currentTier?.id === tier.id

          return (
            <article className={`card tier-card${isCurrent ? ' current' : ''}`} key={tier.id}>
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
                {isCurrent && <p className="tier-current">Your membership</p>}
                {!isMember && canJoin && (
                  <button
                    type="button"
                    className="button"
                    onClick={() => join(tier.id)}
                    disabled={loading}
                  >
                    Join as {tier.name}
                  </button>
                )}
                {!isMember && !canJoin && <p className="membership-note">Opening soon</p>}
              </div>
            </article>
          )
        })}
      </div>

      <div className="tiers-footer">
        {!enabled && <p>Memberships are opening soon. Check back shortly!</p>}

        {enabled && !member && (
          <button type="button" className="button-link" onClick={login} disabled={loading}>
            Already a member? Log in
          </button>
        )}

        {enabled && member && !isMember && (
          <>
            <p>
              You&rsquo;re logged in{email ? ` as ${email}` : ''}. Pick a tier above to finish
              joining.
            </p>
            <button type="button" className="button-link" onClick={refresh}>
              Already paid? Check my membership
            </button>
          </>
        )}

        {isMember && (
          <>
            <p>To change your tier or cancel, open your billing page.</p>
            <button type="button" className="button-link" onClick={manageBilling}>
              Manage billing
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

// The members-only page. Only rendered for active members.
export function MembersArea() {
  const { isMember, member, tier, error, manageBilling } = useMembership()

  if (!isMember) return null

  const email = member?.auth?.email

  return (
    <section id="members" className="section members-section">
      <h2>{memberContent.welcome}</h2>
      {email && <p className="members-email">Logged in as {email}</p>}
      <p className="members-announcement">{memberContent.announcement}</p>

      {tier && (
        <article className="card members-tier">
          <p className="tier-label">Your tier</p>
          <h3 className="tier-name">
            {tier.name} <span className="members-tier-label">({tier.label})</span>
          </h3>
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
