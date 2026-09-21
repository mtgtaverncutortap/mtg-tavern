import { useCallback, useEffect, useMemo, useState } from 'react'
import { membership } from './membership.config.js'
import { MembershipContext } from './useMembership.js'

const enabled = Boolean(membership.publicKey && membership.priceId)

// Load the Memberstack library only when memberships are configured, and only once.
let sdkPromise = null
function loadSdk() {
  if (!sdkPromise) {
    sdkPromise = import('@memberstack/dom').then((mod) =>
      mod.default.init({ publicKey: membership.publicKey }),
    )
  }
  return sdkPromise
}

const pageUrl = () => window.location.href.split('#')[0]

const hasActiveMembership = (member) =>
  Boolean(
    member?.planConnections?.some(
      (plan) => plan.active && (!membership.planId || plan.planId === membership.planId),
    ),
  )

export function MembershipProvider({ children }) {
  const [loading, setLoading] = useState(enabled)
  const [member, setMember] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!enabled) return undefined

    let cancelled = false
    let listener = null

    loadSdk()
      .then(async (sdk) => {
        const { data } = await sdk.getCurrentMember()
        if (cancelled) return
        setMember(data ?? null)
        setLoading(false)
        listener = sdk.onAuthChange((next) => {
          if (!cancelled) setMember(next ?? null)
        })
      })
      .catch(() => {
        if (cancelled) return
        setLoading(false)
        setError('Membership is unavailable right now. Please try again later.')
      })

    return () => {
      cancelled = true
      listener?.unsubscribe()
    }
  }, [])

  const refresh = useCallback(async () => {
    if (!enabled) return
    setError('')
    try {
      const sdk = await loadSdk()
      const { data } = await sdk.getCurrentMember()
      setMember(data ?? null)
    } catch {
      setError('Could not check your membership. Please try again.')
    }
  }, [])

  const login = useCallback(async () => {
    if (!enabled) return
    setError('')
    try {
      const sdk = await loadSdk()
      await sdk.openModal('LOGIN')
      sdk.hideModal()
    } catch {
      setError('Could not open the log-in window. Please try again.')
    }
  }, [])

  const join = useCallback(async () => {
    if (!enabled) return
    setError('')
    try {
      const sdk = await loadSdk()
      let { data: current } = await sdk.getCurrentMember()

      if (!current) {
        await sdk.openModal('SIGNUP')
        sdk.hideModal()
        ;({ data: current } = await sdk.getCurrentMember())
        if (!current) return // window was closed without signing up
      }

      // Sends the member to a secure Stripe payment page for the monthly plan.
      await sdk.purchasePlansWithCheckout({
        priceId: membership.priceId,
        successUrl: `${pageUrl()}#members`,
        cancelUrl: `${pageUrl()}#membership`,
      })
    } catch {
      setError('Could not start checkout. Please try again.')
    }
  }, [])

  const logout = useCallback(async () => {
    if (!enabled) return
    try {
      const sdk = await loadSdk()
      await sdk.logout()
      setMember(null)
    } catch {
      setError('Could not log out. Please try again.')
    }
  }, [])

  const manageBilling = useCallback(async () => {
    if (!enabled) return
    setError('')
    try {
      const sdk = await loadSdk()
      await sdk.launchStripeCustomerPortal({ returnUrl: `${pageUrl()}#members` })
    } catch {
      setError('Could not open billing. Please try again.')
    }
  }, [])

  const value = useMemo(
    () => ({
      enabled,
      loading,
      member,
      // In local development only, add ?preview=member to the address to see the member view.
      isMember:
        hasActiveMembership(member) ||
        (import.meta.env.DEV &&
          new URLSearchParams(window.location.search).get('preview') === 'member'),
      error,
      join,
      login,
      logout,
      manageBilling,
      refresh,
    }),
    [loading, member, error, join, login, logout, manageBilling, refresh],
  )

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>
}
