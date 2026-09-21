// Calendar events. Add one entry per event and save.
//
//   date:        'YYYY-MM-DD'. For weekly events, the first date.
//   time:        text shown next to the date, e.g. '7:00 PM'
//   title:       the event name
//   details:     a short description
//   membersOnly: true = visitors only see "Member event"; members see everything
//   weekly:      true = repeats every week on the same weekday
//   until:       optional 'YYYY-MM-DD' last date for a weekly event
//
// Example:
//   {
//     date: '2026-10-02',
//     time: '7:00 PM',
//     title: 'Friday Night Magic',
//     details: 'Draft tournament with prizes for the top players.',
//     membersOnly: false,
//     weekly: true,
//   },
export const events = []
