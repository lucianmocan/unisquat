import * as Localization from 'expo-localization';

// The 9 languages the app ships translations for. `nativeName` is what's shown in the language
// picker (each language names itself, not translated into the currently-active language) —
// matching how iOS's own Settings > Language list works.
export const SUPPORTED_LANGUAGES = [
  { code: 'en', nativeName: 'English' },
  { code: 'fr', nativeName: 'Français' },
  { code: 'es', nativeName: 'Español' },
  { code: 'it', nativeName: 'Italiano' },
  { code: 'de', nativeName: 'Deutsch' },
  { code: 'pt', nativeName: 'Português' },
  { code: 'ro', nativeName: 'Română' },
  { code: 'ar', nativeName: 'العربية' },
  { code: 'zh', nativeName: '中文' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

const SUPPORTED_CODES: readonly string[] = SUPPORTED_LANGUAGES.map(l => l.code);

function isSupportedLanguageCode(code: string | null | undefined): code is LanguageCode {
  return !!code && SUPPORTED_CODES.includes(code);
}

/**
 * The device's preferred UI language, mapped down to one of our supported codes — falls back to
 * English when the device's language (or none of its ranked preferences) is supported.
 */
export function resolveDeviceLanguage(): LanguageCode {
  const locales = Localization.getLocales();
  for (const locale of locales) {
    if (isSupportedLanguageCode(locale.languageCode)) {
      return locale.languageCode;
    }
  }
  return DEFAULT_LANGUAGE;
}

/** `settings.language` is `'system'` or an explicit code — this resolves it to a real code. */
export function resolveLanguage(setting: LanguageCode | 'system'): LanguageCode {
  return setting === 'system' ? resolveDeviceLanguage() : setting;
}

// `@react-native-community/datetimepicker`'s `locale` prop is forwarded straight to iOS's
// `UIDatePicker`/`NSLocale` — it only exists on iOS. Android's date/time pickers are system
// dialogs with no per-app locale override, so they always follow the device's own language
// regardless of this setting.
const IOS_LOCALE_IDENTIFIERS: Record<LanguageCode, string> = {
  en: 'en_US',
  fr: 'fr_FR',
  es: 'es_ES',
  it: 'it_IT',
  de: 'de_DE',
  pt: 'pt_PT',
  ro: 'ro_RO',
  ar: 'ar',
  zh: 'zh_Hans_CN',
};

/** Resolves `settings.language` to the iOS-native locale identifier for `DateTimePicker`. */
export function resolveIOSPickerLocale(setting: LanguageCode | 'system'): string {
  return IOS_LOCALE_IDENTIFIERS[resolveLanguage(setting)];
}
