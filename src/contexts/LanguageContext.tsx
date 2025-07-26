'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { languages, getLanguageByCountry, getLanguageByCode, LanguageConfig } from '@/utils/languageConfig';
import { detectUserLocation } from '@/services/ipService';

interface LanguageContextType {
  currentLanguage: LanguageConfig;
  availableLanguages: LanguageConfig[];
  changeLanguage: (languageCode: string) => void;
  isLoading: boolean;
  // Legacy properties for backward compatibility
  lang: string;
  setLang: (languageCode: string) => void;
  detectedLang?: string;
  toggleLanguage?: () => void;
  getNextToggleLanguage?: () => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageConfig>(languages[0]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        // Wait for i18n to be ready
        if (!i18n.isInitialized) {
          await new Promise(resolve => {
            i18n.on('initialized', resolve);
          });
        }
        
        // Check if user has previously selected a language
        const savedLanguage = localStorage.getItem('selectedLanguage');
        
        if (savedLanguage) {
          const language = getLanguageByCode(savedLanguage);
          setCurrentLanguage(language);
          await i18n.changeLanguage(language.code);
          console.log('Loaded saved language:', language.code);
        } else {
          // Detect user location and set language accordingly
          const location = await detectUserLocation();
          
          if (location?.countryCode) {
            const detectedLanguage = getLanguageByCountry(location.countryCode);
            console.log('Detected language:', detectedLanguage);
            setCurrentLanguage(detectedLanguage);
            
            // Force language change and wait for it
            await i18n.changeLanguage(detectedLanguage.code);
            console.log('Language changed to:', detectedLanguage.code);
            
            localStorage.setItem('selectedLanguage', detectedLanguage.code);
            localStorage.setItem('selectedCurrency', detectedLanguage.currency);
          } else {
            // Fallback to English if no location detected
            setCurrentLanguage(languages[0]);
            await i18n.changeLanguage('en');
          }
        }
      } catch (error) {
        console.error('Language initialization failed:', error);
        // Fallback to English
        setCurrentLanguage(languages[0]);
        await i18n.changeLanguage('en');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, [i18n]);

  const changeLanguage = async (languageCode: string) => {
    try {
      const language = getLanguageByCode(languageCode);
      console.log('Changing language to:', language);
      
      // Change i18n language first
      await i18n.changeLanguage(language.code);
      console.log('i18n language changed to:', i18n.language);
      
      // Update state
      setCurrentLanguage(language);
      
      // Save preferences
      localStorage.setItem('selectedLanguage', language.code);
      localStorage.setItem('selectedCurrency', language.currency);
      
      // Dispatch event for other components to react
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language, currency: language.currency } 
      }));
      
      // Force page refresh to ensure all components update
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Language change failed:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      availableLanguages: languages,
      changeLanguage,
      isLoading,
      // Legacy properties
      lang: currentLanguage.code,
      setLang: changeLanguage,
      detectedLang: currentLanguage.code,
      toggleLanguage: () => changeLanguage(currentLanguage.code === 'en' ? 'bn' : 'en'),
      getNextToggleLanguage: () => currentLanguage.code === 'en' ? 'bn' : 'en'
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Legacy alias for backward compatibility
export const useLang = useLanguage;

// Export languages for backward compatibility
export { languages } from '@/utils/languageConfig';