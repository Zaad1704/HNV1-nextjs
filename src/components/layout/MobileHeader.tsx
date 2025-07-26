import React, { useState } from 'react';
import { Menu, Bell, Search, Sun, Moon, Globe } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';

interface MobileHeaderProps {
  onMenuToggle: () => void;
  showNotifications?: boolean;
  title?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ 
  onMenuToggle, 
  showNotifications = false,
  title
}) => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const changeLanguage = (lang: string) => {
    localStorage.setItem('language', lang);
    setShowLangMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 backdrop-blur-xl bg-white/10 border-2 border-white/20 z-[100] flex items-center justify-between px-4" style={{backdropFilter: 'blur(20px) saturate(180%)'}}>
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-app-bg transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-semibold text-text-primary">{title || t('nav.dashboard')}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-app-bg transition-colors"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-app-bg transition-colors"
          >
            <Globe size={18} />
          </button>
          {showLangMenu && (
            <div className="absolute right-0 top-12 backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-xl shadow-lg py-2 min-w-[120px] z-50" style={{backdropFilter: 'blur(20px) saturate(180%)'}}>
              {['en', 'es', 'fr', 'de'].map(lang => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/20 transition-colors"
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {showNotifications && <NotificationsPanel />}
        
        <div className="w-8 h-8 app-gradient rounded-full flex items-center justify-center font-semibold text-white text-sm">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;