// Membership settings.
//
// How it works: someone requests to join (name, email, tier). You review the
// request on the private admin page and approve it with a Member ID. Only then
// can that person create their password-protected account and see member content.
//
// The admin page is at yoursite.com/#admin. To reach it, YOU need your own
// account with special access:
//   1. In the Firebase console, turn on the Email/Password sign-in method
//      (Build -> Authentication -> Sign-in method -> Email/Password -> Enable).
//   2. Still in Authentication, go to the Users tab -> Add user. Use your own
//      email and a password you choose. This is YOUR admin login, separate
//      from any member's account.
//   3. Click on the new user in that list and copy its "User UID".
//   4. Paste that UID below as ADMIN_UID, and also into firestore.rules
//      wherever it says ADMIN_UID (then paste the updated rules into Firebase
//      console -> Firestore Database -> Rules -> Publish).
export const ADMIN_UID = ''

export const contactEmail = 'mtgtaverncutortap@gmail.com'

// The three membership tiers. Edit names, prices and perks freely. `id` is
// used to store which tier a member has, so avoid changing an existing id.
export const tiers = [
  {
    id: 'peasant',
    label: 'Tier 1',
    name: 'Playful Peasant',
    price: '$20',
    interval: 'month',
    perks: ['Access to tavern events', 'Full details of member-only events in the calendar'],
  },
  {
    id: 'mage',
    label: 'Tier 2',
    name: 'Mage',
    price: '$40',
    interval: 'month',
    perks: [
      'Everything in Tier 1',
      "Access to the members' room",
      'Play in our live-streamed Magic games',
      'Custom dice, sleeves and playmats',
      'Bring a guest up to three times',
    ],
  },
  {
    id: 'wizard',
    label: 'Tier 3',
    name: 'Wizard',
    price: '$100',
    interval: 'month',
    perks: [
      'Everything in Tier 1',
      'Lodge access 24/7',
      'A key to a storage locker for your cards, drinks, cigars and more',
      'Buy booster packs with no markup',
      'No fee to use our rentable pre-constructed decks',
      'Birthday gift: a free booster pack, a Snugglebunz and a butterbeer',
    ],
  },
]

// What members see on the members-only page. Edit freely.
// Member events themselves are added in events.config.js.
export const memberContent = {
  welcome: 'Welcome to the members lounge!',
  announcement: 'Thanks for being a member. Member-only events show full details in the calendar.',
}
