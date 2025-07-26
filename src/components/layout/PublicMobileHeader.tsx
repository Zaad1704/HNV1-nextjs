import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Sun, Moon, Download, Globe } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import SmartLanguageSwitcher from '@/components/common/SmartLanguageSwitcher';

const PublicMobileHeader = () => {
  const { data: settings } = useSiteSettings();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 gradient-dark-orange-blue z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setShowMenu(true)}
          className="btn-glass p-2 rounded-xl"
        >
          <Menu size={20} />
        </button>

        <Link to="/" className="flex items-center gap-2 text-white">
          <img 
            src={settings?.logos?.faviconUrl || '/logo-min.png'} 
            alt="Logo" 
            className="h-8 w-8 rounded-lg object-contain" 
          />
          <div className="text-center">
            <div className="text-sm font-bold leading-tight">
              {settings?.logos?.companyName || 'HNV Property Management Solutions'}
            </div>
            <div className="text-xs text-white/70 leading-tight">
              Property Management
            </div>
          </div>
        </Link>

        <Link 
          to="/register" 
          className="btn-glass px-3 py-2 rounded-xl text-sm font-semibold"
        >
          {t('header.get_started')}
        </Link>
      </header>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="bg-app-surface h-full w-80 max-w-[85vw] shadow-app-2xl">
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
                  <p className="text-sm text-text-secondary">Property Management</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMenu(false)}
                className="p-2 rounded-xl text-text-secondary hover:text-text-primary"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="w-full">
                <SmartLanguageSwitcher />
              </div>

              <button 
                onClick={() => {
                  toggleTheme();
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-app-bg hover:bg-app-border transition-colors"
              >
                {theme === 'light' ? <Moon size={24} className="text-brand-orange" /> : <Sun size={24} className="text-brand-orange" />}
                <div className="text-left">
                  <p className="font-semibold text-text-primary">{t('common.theme')}</p>
                  <p className="text-sm text-text-secondary">Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode</p>
                </div>
              </button>

              <Link 
                to="/pricing"
                onClick={() => setShowMenu(false)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-app-bg hover:bg-app-border transition-colors"
              >
                <div className="w-6 h-6 bg-brand-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">$</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-text-primary">Pricing</p>
                  <p className="text-sm text-text-secondary">View our plans</p>
                </div>
              </Link>

              <Link 
                to="/login"
                onClick={() => setShowMenu(false)}
                className="w-full bg-app-bg hover:bg-app-border p-4 rounded-2xl text-center font-semibold text-text-primary transition-colors"
              >
                {t('header.login')}
              </Link>

              <Link 
                to="/register"
                onClick={() => setShowMenu(false)}
                className="w-full gradient-dark-orange-blue p-4 rounded-2xl text-center font-semibold text-white"
              >
                {t('header.get_started')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicMobileHeader;