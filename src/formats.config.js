// Formats players can sign up for.
//
// Every format has its own list of names. Once PLAYERS_NEEDED names are on a
// list, the format shows as "Ready to schedule".
//
//   id:          short unique name, no spaces. Sign-up names are stored under it, so
//                do not change an id once people have signed up.
//   name:        what visitors see
//   description: optional short line
//   rules:       shown in the pop-up when someone clicks the format's name. For the
//                official Magic formats these are accurate. For house formats (the
//                ones that say "ask staff") the exact rules are yours to set — edit
//                the text below once you've decided them.
//   date, time:  optional. Give a format a date (YYYY-MM-DD) and, once its list is full,
//                it is added to the calendar on that date automatically.
//   daily:       true = always on the calendar, every day, all day, no matter how
//                many names are on the list. Still needs a `date` (any date works,
//                it's just the anchor) and a `time` (shown as-is, e.g. 'All day').
export const PLAYERS_NEEDED = 8

// The id every list of names is stored under.
export const formatListId = (id) => `format:${id}`

export const formats = [
  {
    id: 'alternative-roles',
    name: 'Alternative Roles',
    rules:
      "A house format where each player is assigned a special role or restriction for the game, such as attacker, defender or saboteur. Ask staff for this week's role list before you sit down.",
  },
  {
    id: 'archenemy',
    name: 'Archenemy',
    rules:
      'Official multiplayer format. One player becomes the Archenemy, playing solo with a Scheme deck and bonus starting life, against a team of opponents working together to take them down before the schemes turn the tide.',
  },
  {
    id: 'brawl',
    name: 'Brawl',
    rules:
      'A 60-card singleton format built around one legendary commander, using cards legal in Standard. Multiplayer games usually start at 25 life; head-to-head games start at 20.',
  },
  {
    id: 'cedh',
    name: 'cEDH',
    rules:
      'Competitive Commander. Standard 100-card singleton Commander rules under the official ban list, played at full power with fast combos and a competitive mindset.',
  },
  {
    id: 'commander-24-7',
    name: 'Commander (24/7)',
    rules:
      'Standard Commander rules: a 100-card singleton deck built around one legendary commander, starting at 40 life. Pull up a chair any time, day or night.',
    date: '2026-01-01',
    time: 'All day',
    daily: true,
  },
  {
    id: 'commander-budget',
    name: 'Commander (Budget)',
    rules:
      "Standard Commander rules, but every deck must stay under a set price cap. Ask staff for this event's current budget limit before you build.",
  },
  {
    id: 'cube',
    name: 'Cube',
    rules:
      "Draft or build from the shop's curated Cube, a hand-picked card pool designed so every pack has powerful, synergistic choices.",
  },
  {
    id: 'draft-booster',
    name: 'Draft (Booster)',
    rules:
      "Classic booster draft. Open a pack, pick a card, pass the rest, and repeat until everyone's built a 40-card deck from their picks.",
  },
  {
    id: 'draft-conspiracy',
    name: 'Draft (Conspiracy)',
    rules:
      'Draft using Conspiracy-set cards, which are built to be played right at the draft table, with mechanics like Will of the Council and Hidden Agenda that reward politics and table talk.',
  },
  {
    id: 'draft-dollar-boosters',
    name: 'Draft (Dollar boosters)',
    rules: 'A budget-friendly draft using $1 packs from older sets. Same draft rules, lower stakes.',
  },
  {
    id: 'draft-lucky-bucket',
    name: 'Draft (Lucky bucket)',
    rules: 'Grab a mystery pack from the lucky bucket and draft with whatever you pull. Expect the unexpected.',
  },
  {
    id: 'emperor',
    name: 'Emperor',
    rules:
      'Team multiplayer. Two teams of three sit in alternating seats, with an Emperor in the middle of each team protected by two Generals. Knock out the opposing Emperor to win.',
  },
  {
    id: 'head-hunter',
    name: 'Head Hunter',
    rules:
      "A house bounty format where players earn rewards for eliminating whoever is currently in the lead. Ask staff for this event's bounty rules.",
  },
  {
    id: 'hunter-seeker',
    name: 'Hunter-Seeker',
    rules:
      'A house format that pairs players as hunter and target for the round. Ask staff how pairings and objectives work this week.',
  },
  {
    id: 'gladiator',
    name: 'Gladiator',
    rules:
      'A singleton constructed format: build a 100-card deck, no commander needed, using cards from a Standard-style legal pool.',
  },
  {
    id: 'judges-tower',
    name: "Judge's Tower",
    rules:
      "A rules-focused event run by our judges, climbing a ladder of matches or puzzles. Ask staff for this event's format and bracket.",
  },
  {
    id: 'legacy',
    name: 'Legacy',
    rules:
      'Eternal constructed format. Nearly every card ever printed is legal aside from the official banned list, so expect fast, powerful decks.',
  },
  {
    id: 'lottery-commander',
    name: 'Lottery Commander',
    rules: "Everyone's commander is assigned at random from a shared pool. Build your deck around whatever legend you draw.",
  },
  {
    id: 'modern',
    name: 'Modern',
    rules: 'Constructed format using cards from 8th Edition and Mirrodin (2003) onward, aside from the banned list.',
  },
  {
    id: 'pauper',
    name: 'Pauper',
    rules: 'Constructed format where every card in your 60-card deck must have been printed at common.',
  },
  {
    id: 'pentagram',
    name: 'Pentagram',
    rules:
      "A five-player free-for-all with shifting alliances, seated in a star. Ask staff for this event's alliance and scoring rules.",
  },
  {
    id: 'pioneer',
    name: 'Pioneer',
    rules: 'Constructed format using cards from Return to Ravnica (2012) onward, aside from the banned list.',
  },
  {
    id: 'planechase',
    name: 'Planechase',
    rules:
      "Casual multiplayer with a shared Planar deck. Roll the planar die for chaos effects, and the plane you're on can change the rules of the game itself.",
  },
  {
    id: 'pre-release-draft',
    name: 'Pre-release Draft',
    rules: 'Draft the newest set before it officially releases, using special pre-release packs and promo cards.',
  },
  {
    id: 'prismatic',
    name: 'Prismatic',
    rules:
      "A house format that rewards multicolor decks. Ask staff for this event's color and deckbuilding requirements.",
  },
  {
    id: 'sealed-deck',
    name: 'Sealed Deck',
    rules: 'Open six booster packs and build a 40-card deck from what you pull, plus as many basic lands as you need.',
  },
  {
    id: 'silver-bordered',
    name: 'Silver-Bordered',
    rules:
      'Anything-goes casual format built from Un-sets like Unglued, Unhinged, Unstable and Unfinity. Silly cards and silver borders welcome.',
  },
  {
    id: 'standard',
    name: 'Standard',
    rules: 'Constructed format using only cards from the most recent sets still in rotation.',
  },
  {
    id: 'tower',
    name: 'Tower',
    rules:
      "A single-elimination bracket: win your match to climb, lose and you're out. Ask staff for this event's deck requirements.",
  },
  {
    id: 'two-headed-giant',
    name: 'Two-Headed Giant',
    rules:
      'Team format. Two-player teams share a single life total (usually 30) and take turns together against another team.',
  },
  {
    id: 'vanguard',
    name: 'Vanguard',
    rules:
      "Each player uses a Vanguard card that changes their starting hand size and life total and grants a special ability for the game.",
  },
  {
    id: 'vintage',
    name: 'Vintage',
    rules:
      'The most powerful eternal format. Almost every card is legal, and the Power Nine are restricted to one copy each instead of banned.',
  },
  {
    id: 'winchester-draft',
    name: 'Winchester Draft',
    rules:
      'A four-pile draft for two players: four face-up piles sit on the table, and each turn you either take an entire pile or add a card to one and pass.',
  },
  {
    id: 'proxy-throwback',
    name: 'Proxy Throwback Releases',
    description: 'Proxy every card and set of Magic, and play throwback release tournaments.',
    rules:
      'Every card is proxied, so you can play a full throwback prerelease or set-release event with the exact card pool, no matter what’s in your binder.',
  },
  {
    id: 'themed-emperor',
    name: 'Themed: Emperor Tournament',
    rules: 'Our Emperor format (see the Emperor rules), run as a bracketed tournament with prizes for the winning team.',
  },
  {
    id: 'themed-instants',
    name: 'Themed: Instants Only',
    rules: 'Every nonland card in your deck must be an instant. No creatures, no sorceries, just instant-speed spells.',
  },
  {
    id: 'themed-six-plus',
    name: 'Themed: No Cards Under 6 Mana Value',
    rules: 'Every nonland card in your deck must have a mana value of 6 or higher. Big spells only.',
  },
  {
    id: 'themed-no-text',
    name: 'Themed: No Rules Text (Flavor Text Only)',
    rules:
      'Every nonland card must have no rules text beyond reminder text, just flavor text. Vanilla creatures and plain-text spells only.',
  },
]
