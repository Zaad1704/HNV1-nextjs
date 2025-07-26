import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { ArrowRight, Globe, Sun, Moon, Download } from 'lucide-react';
import LanguageDropdown from './LanguageDropdown';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { data: settings } = useSiteSettings();

  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallButton(true);
      }
    };

    const handleAppInstalled = () => {
      setShowInstallButton(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
      setDeferredPrompt(null);
    } else {
      alert(t('install_app_manual_prompt', "To install, please use the 'Install' option in your browser's menu."));
    }
  };

  return (
    <header className="app-gradient sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Theme & Language */}
          <div className="flex items-center gap-3">
            <LanguageDropdown />
            <button 
              onClick={toggleTheme} 
              className="btn-glass p-3 rounded-full"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            {showInstallButton && (
              <button 
                onClick={handleInstallClick} 
                className="btn-glass flex items-center gap-2 px-4 py-2"
              >
                <Download size={16} /> 
                {t('install_app.cta', 'Install App')}
              </button>
            )}
          </div>

          {/* Center: Brand */}
          <Link to="/" className="flex items-center gap-3 text-xl font-bold text-white">
            {settings?.logos?.faviconUrl && (
              <img 
                src={settings.logos.faviconUrl} 
                alt="Logo" 
                className="h-8 w-8 rounded-lg" 
              />
            )}
            <span className="hidden sm:block">
              {settings?.logos?.companyName || 'HNV Solutions'}
            </span>
          </Link>

          {/* Right: Get Started */}
          <Link 
            to="/register" 
            className="btn-glass flex items-center gap-2 font-semibold px-6 py-3"
          >
            {t('header.get_started')} 
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;