import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'bn'],
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
      requestOptions: {
        cache: 'no-cache'
      }
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    load: 'languageOnly',
    cleanCode: true
  });

export default i18n;