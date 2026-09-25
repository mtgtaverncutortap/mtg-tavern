import { useCallback, useEffect, useMemo, useState } from 'react'
import { tiers } from './membership.config.js'
import {
  createAccount as backendCreateAccount,
  firebaseConfigured,
  login as backendLogin,
  logout as backendLogout,
  resendVerification as backendResendVerification,
  submitJoinRequest,
  watchAuthState,
  watchMembership,
} from './membershipBackend.js'
import { MembershipContext } from './useMembership.js'

const enabled = firebaseConfigured

export function MembershipProvider({ children }) {
  const [loading, setLoading] = useState(enabled)
  const [user, setUser] = useState(null)
  const [record, setRecord] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!enabled) return undefined
    let cancelled = false
    let unsubscribe = null

    watchAuthState((nextUser) => {
      if (cancelled) return
      // The site also signs visitors in anonymously for the event sign-up feature
      // (same Firebase project). That anonymous session is not a member account.
      setUser(nextUser && !nextUser.isAnonymous ? nextUser : null)
      setLoading(false)
    }).then((unsub) => {
      if (cancelled) unsub()
      else unsubscribe = unsub
    })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    if (!enabled || !user || !user.emailVerified) {
      setRecord(null)
      return undefined
    }
    let cancelled = false
    let unsubscribe = null

    watchMembership(
      user.email,
      (data) => {
        if (!cancelled) setRecord(data)
      },
      () => {
        if (!cancelled) setError('Could not check your membership. Please try again.')
      },
    ).then((unsub) => {
      if (cancelled) unsub()
      else unsubscribe = unsub
    })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [user])

  const requestJoin = useCallback(async (details) => {
    if (!enabled) return { ok: false, message: 'Sign-ups are not available right now.' }
    setError('')
    try {
      await submitJoinRequest(details)
      return { ok: true }
    } catch {
      return { ok: false, message: 'Could not send your request. Please try again.' }
    }
  }, [])

  const createAccount = useCallback(
    (email, password) => backendCreateAccount(email, password),
    [],
  )

  const login = useCallback((email, password) => backendLogin(email, password), [])

  const logout = useCallback(async () => {
    try {
      await backendLogout()
    } catch {
      setError('Could not log out. Please try again.')
    }
  }, [])

  const resendVerification = useCallback(async () => {
    if (!user) return
    try {
      await backendResendVerification(user)
    } catch {
      setError('Could not resend the verification email. Please try again.')
    }
  }, [user])

  const value = useMemo(() => {
    const verified = Boolean(user?.emailVerified)
    const tier = record ? (tiers.find((t) => t.id === record.tier) ?? null) : null
    return {
      enabled,
      loading,
      user,
      verified,
      pending: Boolean(user) && verified && !record,
      isMember: Boolean(record),
      tier,
      memberId: record?.memberId ?? null,
      memberName: record?.name ?? null,
      error,
      requestJoin,
      createAccount,
      login,
      logout,
      resendVerification,
    }
  }, [loading, user, record, error, requestJoin, createAccount, login, logout, resendVerification])

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>
}
