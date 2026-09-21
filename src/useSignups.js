import { createContext, useContext } from 'react'

export const SignupsContext = createContext(null)

export function useSignups() {
  const value = useContext(SignupsContext)
  if (!value) throw new Error('useSignups must be used inside SignupsProvider')
  return value
}
