import { createContext, useContext } from 'react'

export const MembershipContext = createContext(null)

export function useMembership() {
  const value = useContext(MembershipContext)
  if (!value) throw new Error('useMembership must be used inside MembershipProvider')
  return value
}
