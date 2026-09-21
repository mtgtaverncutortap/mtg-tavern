// Formats players can sign up for.
//
// Every format has its own list of names. Once PLAYERS_NEEDED names are on a
// list, the format shows as "Ready to schedule".
//
//   id:          short unique name, no spaces. Sign-up names are stored under it, so
//                do not change an id once people have signed up.
//   name:        what visitors see
//   description: optional short line
//   date, time:  optional. Give a format a date (YYYY-MM-DD) and, once its list is full,
//                it is added to the calendar on that date automatically.
export const PLAYERS_NEEDED = 8

// The id every list of names is stored under.
export const formatListId = (id) => `format:${id}`

export const formats = [
  { id: 'alternative-roles', name: 'Alternative Roles' },
  { id: 'archenemy', name: 'Archenemy' },
  { id: 'brawl', name: 'Brawl' },
  { id: 'cedh', name: 'cEDH' },
  { id: 'commander-24-7', name: 'Commander (24/7)' },
  { id: 'commander-budget', name: 'Commander (Budget)' },
  { id: 'cube', name: 'Cube' },
  { id: 'draft-booster', name: 'Draft (Booster)' },
  { id: 'draft-conspiracy', name: 'Draft (Conspiracy)' },
  { id: 'draft-dollar-boosters', name: 'Draft (Dollar boosters)' },
  { id: 'draft-lucky-bucket', name: 'Draft (Lucky bucket)' },
  { id: 'emperor', name: 'Emperor' },
  { id: 'head-hunter', name: 'Head Hunter' },
  { id: 'hunter-seeker', name: 'Hunter-Seeker' },
  { id: 'gladiator', name: 'Gladiator' },
  { id: 'judges-tower', name: "Judge's Tower" },
  { id: 'legacy', name: 'Legacy' },
  { id: 'lottery-commander', name: 'Lottery Commander' },
  { id: 'modern', name: 'Modern' },
  { id: 'pauper', name: 'Pauper' },
  { id: 'pentagram', name: 'Pentagram' },
  { id: 'pioneer', name: 'Pioneer' },
  { id: 'planechase', name: 'Planechase' },
  { id: 'pre-release-draft', name: 'Pre-release Draft' },
  { id: 'prismatic', name: 'Prismatic' },
  { id: 'sealed-deck', name: 'Sealed Deck' },
  { id: 'silver-bordered', name: 'Silver-Bordered' },
  { id: 'standard', name: 'Standard' },
  { id: 'tower', name: 'Tower' },
  { id: 'two-headed-giant', name: 'Two-Headed Giant' },
  { id: 'vanguard', name: 'Vanguard' },
  { id: 'vintage', name: 'Vintage' },
  { id: 'winchester-draft', name: 'Winchester Draft' },
  {
    id: 'proxy-throwback',
    name: 'Proxy Throwback Releases',
    description: 'Proxy every card and set of Magic, and play throwback release tournaments.',
  },
  { id: 'themed-emperor', name: 'Themed: Emperor Tournament' },
  { id: 'themed-instants', name: 'Themed: Instants Only' },
  { id: 'themed-six-plus', name: 'Themed: No Cards Under 6 Mana Value' },
  { id: 'themed-no-text', name: 'Themed: No Rules Text (Flavor Text Only)' },
]
