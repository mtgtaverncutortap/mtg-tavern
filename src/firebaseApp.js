import { firebaseConfig } from './signups.config.js'

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

// Both the event sign-ups feature and the membership system talk to the same
// Firebase project. initializeApp() throws if called twice, so this makes
// sure only one shared app instance ever gets created, however many features use it.
let appPromise = null
export function getFirebaseApp() {
  if (!appPromise) {
    appPromise = import('firebase/app').then(({ initializeApp, getApps, getApp }) =>
      getApps().length ? getApp() : initializeApp(firebaseConfig),
    )
  }
  return appPromise
}
