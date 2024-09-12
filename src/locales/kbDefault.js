export default {
  0: { shortcut: '0', action: 'change app theme' },
  1: { shortcut: ['1', 'D'], action: 'open day view' },
  2: { shortcut: ['2', 'W'], action: 'open week view' },
  3: { shortcut: ['3', 'M'], action: 'open month view' },
  4: { shortcut: ['4', 'Y'], action: 'open year view' },
  5: { shortcut: ['5', 'L'], action: 'open list view' },
  6: { shortcut: 'v', action: 'toggle view options' },
  7: { shortcut: 't', action: 'set date to today' },
  8: { shortcut: 'g', action: 'enter date manually' },
  9: { shortcut: 'n', action: 'next period' },
  10: { shortcut: 'p', action: 'previous period' },
  11: { shortcut: 's', action: 'toggle sidebar' },
  12: { shortcut: 'f', action: 'open form' },
  13: { shortcut: '+', action: 'open new category form' },
  14: { shortcut: 'a', action: 'open settings' },
  15: { shortcut: ['/', '?'], action: 'open keyboard shortcuts' },
  16: { shortcut: 'e', action: '(entry options) opens form with entry details' },
  17: {
    shortcut: '↑', action: [
      '(datepicker) set date to next month/week',
      '(yearpicker) set year to next year',
    ],
  },
  18: {
    shortcut: '↓', action: [
      '(datepicker) set date to prev month/week',
      '(yearpicker) set year to prev year',
    ],
  },
  19: {
    shortcut: '←', action: [
      '(datepicker) set date to prev day',
      '(monthpicker) set month to prev month',
    ],
  },
  20: {
    shortcut: '→', action: [
      '(datepicker) set date to next day',
      '(monthpicker) set month to next month',
    ],
  },
  21: { shortcut: 'DELETE', action: '(entry options) delete entry' },
  22: {
    shortcut: 'ENTER', action: [
      '(datepicker) set date to selected date',
      '(form) submit form',
    ],
  },
  23: { shortcut: 'ESCAPE', action: 'close any active modal/popup/form' },
};
