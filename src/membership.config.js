// Membership settings.
//
// Fill in publicKey, and each tier's priceId and planId, after creating the
// Memberstack account. A tier's Join button stays on "Opening soon" until its
// priceId is filled in.
//
// The public key is designed to be visible in website code. Never paste a
// secret key (anything starting with sk_) into this file.
export const membership = {
  publicKey: '', // Memberstack public key: pk_sb_... (test mode) or pk_... (live)
}

// The three membership tiers. Edit names, prices and perks freely.
//   priceId: the Price ID of that tier's monthly plan in Memberstack: prc_...
//   planId:  the Plan ID of the same plan: pln_... (used to tell which tier a member has)
export const tiers = [
  {
    id: 'apprentice',
    label: 'Tier 1',
    name: 'Apprentice',
    price: '$20',
    interval: 'month',
    priceId: '',
    planId: '',
    perks: ['Access to tavern events', 'Full details of member-only events in the calendar'],
  },
  {
    id: 'mage',
    label: 'Tier 2',
    name: 'Mage',
    price: '$40',
    interval: 'month',
    priceId: '',
    planId: '',
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
    priceId: '',
    planId: '',
    perks: [
      'Everything in Tier 1',
      'Lodge access 24/7',
      'A key to a storage locker for your cards, drinks, cigars and more',
      'Buy booster packs with no markup',
      'No fee to use our rentable pre-constructed decks',
      'Half-price glass and ice',
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
