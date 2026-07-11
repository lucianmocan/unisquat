const SHORT_MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const SHORT_WEEKDAYS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

/**
 * "14:32" — device-local wall-clock time from `Date`'s local getters, never `Intl`/`toLocaleTimeString`.
 * Hermes on Android has been known to resolve `Intl.DateTimeFormat` against UTC instead of the
 * device timezone, silently showing a time offset from what the native pickers display.
 */
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/** "11 juil." */
export function formatShortDate(date: Date): string {
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
}

/** "sam. 11 juil." */
export function formatShortWeekdayDate(date: Date): string {
  return `${SHORT_WEEKDAYS[date.getDay()]} ${formatShortDate(date)}`;
}
