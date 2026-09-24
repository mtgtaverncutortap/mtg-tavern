import { useEffect, useId, useState } from 'react'
import { ADMIN_UID, tiers } from './membership.config.js'
import {
  adminApproveRequest,
  adminDenyRequest,
  adminRevokeMember,
  adminWatchMembers,
  adminWatchRequests,
  firebaseConfigured,
} from './membershipBackend.js'
import { useMembership } from './useMembership.js'

const tierName = (id) => tiers.find((t) => t.id === id)?.name ?? id

function AdminLoginForm() {
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
    <form className="players-form membership-form admin-login" onSubmit={submit}>
      <label htmlFor={emailId}>Admin email</label>
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

function RequestRow({ request }) {
  const [memberId, setMemberId] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const approve = async () => {
    if (!memberId.trim()) {
      setError('Enter a Member ID first.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await adminApproveRequest(request, memberId.trim())
    } catch {
      setError('Could not approve. Please try again.')
    }
    setBusy(false)
  }

  const deny = async () => {
    setBusy(true)
    setError('')
    try {
      await adminDenyRequest(request)
    } catch {
      setError('Could not update. Please try again.')
    }
    setBusy(false)
  }

  return (
    <tr>
      <td data-label="Name">{request.name}</td>
      <td data-label="Email">{request.email}</td>
      <td data-label="Tier">{tierName(request.tier)}</td>
      <td data-label="Note">{request.note || '—'}</td>
      <td data-label="Member ID">
        <input
          type="text"
          className="admin-id-input"
          value={memberId}
          onChange={(event) => setMemberId(event.target.value)}
          placeholder="e.g. 1042"
          maxLength={20}
        />
      </td>
      <td className="format-action">
        <button type="button" className="button-link" onClick={approve} disabled={busy}>
          Approve
        </button>{' '}
        <button type="button" className="button-link admin-deny" onClick={deny} disabled={busy}>
          Deny
        </button>
        {error && <p className="players-error">{error}</p>}
      </td>
    </tr>
  )
}

function AdminTools() {
  const { logout } = useMembership()
  const [requests, setRequests] = useState(null)
  const [members, setMembers] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    let stopRequests = null
    let stopMembers = null

    adminWatchRequests(
      (data) => {
        if (!cancelled) setRequests(data)
      },
      () => {
        if (!cancelled) setError('Could not load requests.')
      },
    ).then((unsub) => {
      if (cancelled) unsub()
      else stopRequests = unsub
    })

    adminWatchMembers(
      (data) => {
        if (!cancelled) setMembers(data)
      },
      () => {
        if (!cancelled) setError('Could not load members.')
      },
    ).then((unsub) => {
      if (cancelled) unsub()
      else stopMembers = unsub
    })

    return () => {
      cancelled = true
      stopRequests?.()
      stopMembers?.()
    }
  }, [])

  const pending = (requests ?? []).filter((r) => r.status === 'pending')
  const decided = (requests ?? []).filter((r) => r.status !== 'pending')

  const revoke = async (email) => {
    if (!window.confirm(`Remove membership for ${email}?`)) return
    try {
      await adminRevokeMember(email)
    } catch {
      setError('Could not remove that member.')
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-top">
        <h1>Membership admin</h1>
        <button type="button" className="button-link" onClick={logout}>
          Log out
        </button>
      </div>

      {error && (
        <p className="players-error" role="alert">
          {error}
        </p>
      )}

      <h2 className="format-group-title-static">Pending requests ({pending.length})</h2>
      {requests === null ? (
        <p className="events-empty">Loading&hellip;</p>
      ) : pending.length === 0 ? (
        <p className="events-empty">No pending requests.</p>
      ) : (
        <div className="format-table-wrap">
          <table className="format-table admin-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Tier</th>
                <th scope="col">Note</th>
                <th scope="col">Member ID</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {pending.map((request) => (
                <RequestRow request={request} key={request.id} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="format-group-title-static">Members ({(members ?? []).length})</h2>
      {members === null ? (
        <p className="events-empty">Loading&hellip;</p>
      ) : members.length === 0 ? (
        <p className="events-empty">No approved members yet.</p>
      ) : (
        <div className="format-table-wrap">
          <table className="format-table admin-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Tier</th>
                <th scope="col">Member ID</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td data-label="Name">{m.name}</td>
                  <td data-label="Email">{m.id}</td>
                  <td data-label="Tier">{tierName(m.tier)}</td>
                  <td data-label="Member ID">{m.memberId}</td>
                  <td className="format-action">
                    <button type="button" className="button-link admin-deny" onClick={() => revoke(m.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {decided.length > 0 && (
        <>
          <h2 className="format-group-title-static">Past requests</h2>
          <ul className="admin-decided-list">
            {decided.map((r) => (
              <li key={r.id}>
                {r.name} ({r.email}) &mdash; {r.status}
                {r.memberId ? ` · ID ${r.memberId}` : ''}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default function AdminPage() {
  const { enabled, loading, user } = useMembership()

  if (!firebaseConfigured || !enabled) {
    return (
      <div className="admin-page">
        <p>Membership isn&rsquo;t connected yet.</p>
      </div>
    )
  }

  if (!ADMIN_UID) {
    return (
      <div className="admin-page">
        <p>
          No admin account is set up yet. Add your ADMIN_UID in{' '}
          <code>src/membership.config.js</code>.
        </p>
      </div>
    )
  }

  if (loading) return null

  if (!user) {
    return (
      <div className="admin-page">
        <h1>Admin log in</h1>
        <AdminLoginForm />
      </div>
    )
  }

  if (user.uid !== ADMIN_UID) {
    return (
      <div className="admin-page">
        <p>This account doesn&rsquo;t have admin access.</p>
      </div>
    )
  }

  return <AdminTools />
}
