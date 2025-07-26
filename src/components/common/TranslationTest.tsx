import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLang } from '@/contexts/LanguageContext';

const TranslationTest = () => {
  const { t, ready } = useTranslation();
  const { lang } = useLang();

  return (
    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg text-sm">
      <h4 className="font-bold mb-2">Translation Debug Info:</h4>
      <p>Current Language: {lang}</p>
      <p>i18n Ready: {ready ? 'Yes' : 'No'}</p>
      <p>Test Translation: {t('common.loading', 'Loading...')}</p>
      <p>Header Login: {t('header.login', 'Login')}</p>
    </div>
  );
};

export default TranslationTest;