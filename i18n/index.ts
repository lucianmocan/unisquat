import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './locales/ar.json';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ro from './locales/ro.json';
import zh from './locales/zh.json';

import { DEFAULT_LANGUAGE, LanguageCode, resolveDeviceLanguage } from './languages';

export { DEFAULT_LANGUAGE, resolveDeviceLanguage, resolveLanguage, SUPPORTED_LANGUAGES } from './languages';
export type { LanguageCode } from './languages';

const resources: Record<LanguageCode, { translation: object }> = {
  en: { translation: en },
  fr: { translation: fr },
  es: { translation: es },
  it: { translation: it },
  de: { translation: de },
  pt: { translation: pt },
  ro: { translation: ro },
  ar: { translation: ar },
  zh: { translation: zh },
};

// Initialized once at import time (imported for its side effect from app/_layout.tsx) with the
// device's language as a starting point — SettingsContext calls i18next.changeLanguage(...) once
// it loads the persisted 'language' setting, which may override this with an explicit choice.
i18next.use(initReactI18next).init({
  resources,
  lng: resolveDeviceLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false, // not rendering to HTML — React Native text needs no escaping
  },
});

export default i18next;
