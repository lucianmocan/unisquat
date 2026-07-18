import i18next from '@/i18n';
import { LanguageCode } from '@/i18n/languages';

const SHORT_MONTHS: Record<LanguageCode, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  es: ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sep.', 'oct.', 'nov.', 'dic.'],
  it: ['gen.', 'feb.', 'mar.', 'apr.', 'mag.', 'giu.', 'lug.', 'ago.', 'set.', 'ott.', 'nov.', 'dic.'],
  de: ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'],
  pt: ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'],
  ro: ['ian.', 'feb.', 'mar.', 'apr.', 'mai', 'iun.', 'iul.', 'aug.', 'sept.', 'oct.', 'nov.', 'dec.'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
  zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
};

const SHORT_WEEKDAYS: Record<LanguageCode, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  fr: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  es: ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'],
  it: ['dom.', 'lun.', 'mar.', 'mer.', 'gio.', 'ven.', 'sab.'],
  de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  pt: ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'],
  ro: ['dum.', 'lun.', 'mar.', 'mie.', 'joi', 'vin.', 'sâm.'],
  ar: ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'],
  zh: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
};

/** The currently active app language, narrowed to one we actually have name arrays for. */
function currentLanguage(): LanguageCode {
  const lang = i18next.language as LanguageCode;
  return lang in SHORT_MONTHS ? lang : 'en';
}

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

/**
 * "11 juil." (or locale-equivalent, e.g. "Jul 11" / "7月11日") — built from `Date`'s local
 * getters like `formatTime`, not `Intl.DateTimeFormat`, for the same timezone-safety reason.
 */
export function formatShortDate(date: Date): string {
  const lang = currentLanguage();
  const day = date.getDate();
  const month = SHORT_MONTHS[lang][date.getMonth()];
  return lang === 'zh' ? `${month}${day}日` : `${day} ${month}`;
}

/** "sam. 11 juil." (or locale-equivalent) */
export function formatShortWeekdayDate(date: Date): string {
  const lang = currentLanguage();
  const weekday = SHORT_WEEKDAYS[lang][date.getDay()];
  return lang === 'zh' ? `${weekday}${formatShortDate(date)}` : `${weekday} ${formatShortDate(date)}`;
}
