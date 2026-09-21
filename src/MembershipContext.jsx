import { useCallback, useEffect, useMemo, useState } from 'react'
import { membership, tiers } from './membership.config.js'
import { MembershipContext } from './useMembership.js'

const enabled = Boolean(membership.publicKey && tiers.some((tier) => tier.priceId))

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

// Works out whether someone is a paying member, and which tier they are on.
function membershipStatus(member) {
  if (import.meta.env.DEV) {
    // Local development only: ?preview=member&tier=wizard shows the member view.
    const params = new URLSearchParams(window.location.search)
    if (params.get('preview') === 'member') {
      return { isMember: true, tier: tiers.find((t) => t.id === params.get('tier')) ?? tiers[0] }
    }
  }

  const active = member?.planConnections?.filter((plan) => plan.active) ?? []
  if (!active.length) return { isMember: false, tier: null }

  const tier = tiers.find((t) => t.planId && active.some((plan) => plan.planId === t.planId))
  if (tier) return { isMember: true, tier }

  // If no plan IDs are filled in yet, any active plan counts and the tier is unknown.
  if (!tiers.some((t) => t.planId)) return { isMember: true, tier: null }

  return { isMember: false, tier: null }
}

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

  // Signs the visitor up (if needed), then sends them to Stripe to pay for the chosen tier.
  const join = useCallback(async (tierId) => {
    const tier = tiers.find((t) => t.id === tierId)
    if (!enabled || !tier?.priceId) return
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

      await sdk.purchasePlansWithCheckout({
        priceId: tier.priceId,
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

  const value = useMemo(() => {
    const status = membershipStatus(member)
    return {
      enabled,
      loading,
      member,
      isMember: status.isMember,
      tier: status.tier,
      error,
      join,
      login,
      logout,
      manageBilling,
      refresh,
    }
  }, [loading, member, error, join, login, logout, manageBilling, refresh])

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>
}
