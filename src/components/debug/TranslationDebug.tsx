import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';

const TranslationDebug: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentLanguage } = useLanguage();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Translation Debug</h4>
      <div>Current Language: {currentLanguage.code} ({currentLanguage.name})</div>
      <div>i18n Language: {i18n.language}</div>
      <div>Test Translation: {t('common.loading')}</div>
      <div>App Name: {t('app_name')}</div>
      <div>Resources Loaded: {i18n.hasResourceBundle(currentLanguage.code, 'translation') ? 'Yes' : 'No'}</div>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-2 bg-blue-500 px-2 py-1 rounded text-xs"
      >
        Reload
      </button>
    </div>
  );
};

export default TranslationDebug;