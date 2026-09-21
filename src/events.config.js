// Calendar events. Add one entry per event and save.
//
//   id:          a short unique name with no spaces, e.g. 'draft-night'. Needed for sign-up lists.
//   date:        'YYYY-MM-DD'. For weekly events, the first date.
//   time:        text shown next to the date, e.g. '7:00 PM'
//   title:       the event name
//   details:     a short description
//   membersOnly: true = visitors only see "Member event"; members see everything
//   weekly:      true = repeats every week on the same weekday
//   until:       optional 'YYYY-MM-DD' last date for a weekly event
//   signup:      true = people can put their name on the list; click the event to see who is in
//   minPlayers:  e.g. 8 = the game stays OFF the calendar until this many names are on its list.
//                Until then it shows under "Games looking for players". Not used with weekly.
//
// Examples:
//   {
//     id: 'friday-night-magic',
//     date: '2026-10-02',
//     time: '7:00 PM',
//     title: 'Friday Night Magic',
//     details: 'Draft tournament with prizes for the top players.',
//     weekly: true,
//   },
//   {
//     id: 'commander-night',
//     date: '2026-10-10',
//     time: '6:00 PM',
//     title: 'Commander Pod Night',
//     details: 'Four-player pods. Bring your deck.',
//     minPlayers: 8,
//   },
export const events = []
