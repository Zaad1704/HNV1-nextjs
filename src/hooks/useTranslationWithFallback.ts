import { useTranslation } from 'react-i18next';
import { useLang } from '@/contexts/LanguageContext';
import { getFallbackTranslation } from '@/utils/translations';

export const useTranslationWithFallback = () => {
  const { t, ready } = useTranslation();
  const { lang } = useLang();

  const translate = (key: string, fallback?: string, options?: any) => {
    if (ready) {
      const translation = t(key, fallback, options);
      // If translation returns the key itself, it means translation failed
      if (translation === key && fallback) {
        return getFallbackTranslation(key, lang, fallback);
      }
      return translation;
    }
    // If i18n is not ready, use fallback system
    return getFallbackTranslation(key, lang, fallback);
  };

  return { t: translate, ready, lang };
};