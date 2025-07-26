import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'mobile';
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'default', 
  className = '' 
}) => {
  const { currentLanguage, availableLanguages, changeLanguage, isLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Globe size={20} className="animate-pulse text-text-secondary" />
        {variant !== 'compact' && (
          <span className="text-sm text-text-secondary">Loading...</span>
        )}
      </div>
    );
  }

  const handleLanguageSelect = (languageCode: string) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-app-surface transition-colors ${
          variant === 'compact' ? 'p-2' : ''
        }`}
        aria-label="Select language"
      >
        <Globe size={20} className="text-text-secondary" />
        {variant !== 'compact' && (
          <>
            <span className="text-2xl">{currentLanguage.flag}</span>
            <span className="text-sm font-medium text-text-primary">
              {currentLanguage.name}
            </span>
            <ChevronDown size={16} className={`text-text-secondary transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} />
          </>
        )}
        {variant === 'compact' && (
          <span className="text-xl">{currentLanguage.flag}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute ${variant === 'mobile' ? 'left-0' : 'right-0'} top-full mt-2 w-80 max-h-96 overflow-y-auto bg-app-surface border border-app-border rounded-2xl shadow-app-lg z-50`}
          >
            <div className="p-2">
              <div className="text-xs font-medium text-text-secondary px-3 py-2 mb-2">
                Select Language & Currency
              </div>
              
              {availableLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-app-bg transition-colors text-left ${
                    currentLanguage.code === language.code ? 'bg-brand-blue/10 text-brand-blue' : ''
                  }`}
                >
                  <span className="text-xl">{language.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{language.name}</div>
                    <div className="text-xs text-text-secondary">
                      {language.nativeName} • {language.currencySymbol} {language.currency}
                    </div>
                  </div>
                  {currentLanguage.code === language.code && (
                    <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSelector;