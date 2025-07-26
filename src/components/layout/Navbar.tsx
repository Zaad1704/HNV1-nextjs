import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Globe, Sun, Moon, ArrowRight, Menu, X, Download } from 'lucide-react';
import { useLang } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import PWAInstallModal from '@/components/common/PWAInstallModal';
import SmartLanguageSwitcher from '@/components/common/SmartLanguageSwitcher';

const Navbar = () => {
  const { data: settings } = useSiteSettings();
  const { setLang, getNextToggleLanguage } = useLang();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  
  const { 
    isInstallable, 
    isInstalled, 
    platform, 
    installPWA, 
    getInstallInstructions, 
    canDirectInstall 
  } = usePWAInstall();

  const handleInstallClick = () => {
    if (canDirectInstall) {
      installPWA();
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <header className="gradient-dark-orange-blue sticky top-0 z-50 backdrop-blur-md rounded-b-3xl shadow-app-xl border-b-4 border-white/20">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-3 items-center w-full">
          {/* Left: Smart Language, Theme & PWA Install */}
          <div className="flex items-center gap-3 justify-start">
            <SmartLanguageSwitcher />
            <button 
              onClick={toggleTheme} 
              className="btn-glass p-3 rounded-full hover:scale-110 transition-transform"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            {isInstallable && !isInstalled && (
              <button 
                onClick={handleInstallClick}
                className="btn-glass p-3 rounded-full hover:scale-110 transition-transform"
                title={`Install App - ${platform}`}
              >
                <Download size={20} />
              </button>
            )}
          </div>

          {/* Center: Brand */}
          <Link to="/" className="flex items-center justify-center gap-3 text-xl font-bold text-white hover:scale-105 transition-transform">
            <img 
              src={settings?.logos?.faviconUrl || '/logo-min.png'} 
              alt="Logo" 
              className="h-10 w-10 rounded-xl object-contain shadow-lg" 
            />
            <span className="text-center drop-shadow-lg">
              {settings?.logos?.companyName || 'HNV Property Management Solutions'}
            </span>
          </Link>

          {/* Right: Login & Get Started */}
          <div className="flex justify-end items-center gap-4">
            <Link 
              to="/login" 
              className="text-white hover:text-white/80 font-semibold px-4 py-2 rounded-full hover:bg-white/10 transition-all"
            >
              {t('header.login')}
            </Link>
            <Link 
              to="/register" 
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center gap-2 font-semibold px-6 py-3 rounded-full border border-white/30 hover:scale-105 transition-all shadow-lg"
            >
              {t('header.get_started')} 
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* First Row: Menu + Brand + Get Started */}
          <div className="flex items-center justify-between mb-1">
            <button 
              onClick={() => setShowMobileMenu(true)}
              className="btn-glass p-2 rounded-full flex-shrink-0"
            >
              <Menu size={16} />
            </button>
            
            <Link to="/" className="flex items-center gap-1 text-white flex-1 justify-center px-2">
              <img 
                src={settings?.logos?.faviconUrl || '/logo-min.png'} 
                alt="Logo" 
                className="h-5 w-5 rounded-lg object-contain flex-shrink-0" 
              />
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-xs font-bold truncate">
                  {settings?.logos?.companyName || 'HNV Property Management Solutions'}
                </span>
                <span className="text-xs text-white/70 truncate">{t('common.property_management')}</span>
              </div>
            </Link>
            
            <Link 
              to="/register" 
              className="btn-glass px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0"
            >
              {t('header.get_started')}
            </Link>
          </div>
          
          {/* Second Row: Language + Theme */}
          <div className="flex items-center justify-center gap-2">
            <div className="scale-75">
              <SmartLanguageSwitcher />
            </div>
            <button 
              onClick={toggleTheme} 
              className="btn-glass p-1.5 rounded-full"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Modal - Native App Style */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50">
          <div className="bg-app-surface h-full w-80 max-w-[85vw] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-app-border">
              <div className="flex items-center gap-3">
                <img 
                  src={settings?.logos?.faviconUrl || '/logo-min.png'} 
                  alt="Logo" 
                  className="h-10 w-10 rounded-xl object-contain" 
                />
                <div>
                  <h2 className="text-lg font-bold text-text-primary">
                    {settings?.logos?.companyName || 'HNV Property Management Solutions'}
                  </h2>
                  <p className="text-sm text-text-secondary">{t('common.property_management')}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-full text-text-secondary hover:text-text-primary"
              >
                <X size={24} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-6 space-y-4">
              <div className="w-full p-4">
                <SmartLanguageSwitcher />
              </div>

              <button 
                onClick={() => {
                  toggleTheme();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-app-bg hover:bg-app-border transition-colors"
              >
                {theme === 'light' ? <Moon size={24} className="text-brand-orange" /> : <Sun size={24} className="text-brand-orange" />}
                <div className="text-left">
                  <p className="font-semibold text-text-primary">{t('common.theme')}</p>
                  <p className="text-sm text-text-secondary">Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode</p>
                </div>
              </button>

              <a 
                href="/#about"
                onClick={() => setShowMobileMenu(false)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-app-bg hover:bg-app-border transition-colors"
              >
                <div className="w-6 h-6 bg-brand-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">i</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-text-primary">{t('common.about')}</p>
                  <p className="text-sm text-text-secondary">{t('common.learn_more')}</p>
                </div>
              </a>

              <a 
                href="/#contact"
                onClick={() => setShowMobileMenu(false)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-app-bg hover:bg-app-border transition-colors"
              >
                <div className="w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">@</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-text-primary">{t('nav.contact')}</p>
                  <p className="text-sm text-text-secondary">Get in touch</p>
                </div>
              </a>

              {isInstallable && !isInstalled && (
                <button
                  onClick={() => {
                    handleInstallClick();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-app-bg hover:bg-app-border transition-colors"
                >
                  <Download size={24} className="text-brand-orange" />
                  <div className="text-left">
                    <p className="font-semibold text-text-primary">Install App</p>
                    <p className="text-sm text-text-secondary">Native experience for {platform}</p>
                  </div>
                </button>
              )}

              <Link 
                to="/register"
                onClick={() => setShowMobileMenu(false)}
                className="w-full gradient-dark-orange-blue p-4 rounded-full text-center font-semibold text-white"
              >
                {t('header.get_started')}
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        platform={platform}
        canDirectInstall={canDirectInstall}
        onInstall={() => {
          installPWA();
          setShowInstallModal(false);
        }}
        instructions={getInstallInstructions()}
      />
    </header>
  );
};

export default Navbar;