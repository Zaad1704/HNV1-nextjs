import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Globe, Sun, Moon, Download, ArrowRight } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import LanguageDropdown from './LanguageDropdown';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: settings } = useSiteSettings();

  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { href: '#hero', label: t('nav.home', 'Home') },
    { href: '#about', label: t('nav.about', 'About') },
    { href: '#features', label: t('nav.features', 'Features') },
    { href: '#pricing', label: t('nav.pricing', 'Pricing') },
    { href: '#contact', label: t('nav.contact', 'Contact') },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="app-gradient sticky top-0 z-50 backdrop-blur-md lg:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white">
              {settings?.logos?.faviconUrl && (
                <img 
                  src={settings.logos.faviconUrl} 
                  alt="Logo" 
                  className="h-6 w-6 rounded" 
                />
              )}
              <span>{settings?.logos?.companyName || 'HNV'}</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="btn-glass p-2 rounded-lg"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleMenu}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white dark:bg-gray-900 shadow-xl z-50 lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    {settings?.logos?.faviconUrl && (
                      <img 
                        src={settings.logos.faviconUrl} 
                        alt="Logo" 
                        className="h-6 w-6 rounded" 
                      />
                    )}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {settings?.logos?.companyName || 'HNV Solutions'}
                    </span>
                  </div>
                  <button
                    onClick={toggleMenu}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-6">
                  <ul className="space-y-4">
                    {menuItems.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          onClick={toggleMenu}
                          className="block py-3 px-4 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Controls */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div onClick={toggleMenu}>
                      <LanguageDropdown />
                    </div>

                    <button
                      onClick={() => {
                        toggleTheme();
                        toggleMenu();
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                      <span className="text-sm">
                        {theme === 'light' ? 'Dark' : 'Light'}
                      </span>
                    </button>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      onClick={toggleMenu}
                      className="block w-full text-center py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {t('auth.sign_in', 'Sign In')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={toggleMenu}
                      className="block w-full text-center py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700"
                    >
                      {t('header.get_started', 'Get Started')}
                      <ArrowRight size={16} className="inline ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavbar;