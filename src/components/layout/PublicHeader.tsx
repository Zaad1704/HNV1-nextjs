// frontend/src/components/layout/PublicHeader.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useTranslation } from 'react-i18next';
import { Menu, X, Sun, Moon, Globe, Download } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLang } from '@/contexts/LanguageContext';
import SmartLanguageSwitcher from '@/components/common/SmartLanguageSwitcher';

const PublicHeader = () => {
    const { data: settings } = useSiteSettings();
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { setLang, getNextToggleLanguage } = useLang();
    const location = usePathname();

    useEffect(() => {
        // Check if app is already installed
        const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                           (window.navigator as any).standalone === true;
        
        if (!isInstalled) {
            // Listen for install prompt
            const handleBeforeInstallPrompt = (e: Event) => {
                e.preventDefault();
                setDeferredPrompt(e);
                setShowInstallButton(true);
            };

            window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            
            // Show install button for all browsers after 2 seconds
            const timer = setTimeout(() => {
                setShowInstallButton(true);
            }, 2000);

            return () => {
                window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
                clearTimeout(timer);
            };
        }
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            try {
                await deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    setShowInstallButton(false);
                }
                setDeferredPrompt(null);
            } catch (error) {

            }
        }
    };

    const navLinks = [
        { name: t('header.about', 'About'), href: '#about' },
        { name: t('header.services', 'Services'), href: '#services' },
        { name: t('header.pricing', 'Pricing'), href: '#pricing' },
        { name: t('header.contact', 'Contact'), href: '#contact' },
    ];

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
            setIsMenuOpen(false);
        }
    };

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    return (
        <header className="bg-gradient-to-r from-brand-orange to-brand-blue backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-white/20 transition-all duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo and Company Name */}
                    <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
                        <img src={settings?.logos?.faviconUrl || "/logo-min.png"} alt="HNV Logo" className="h-10 w-10 rounded-lg" />
                        <span className="hidden md:block text-xl font-bold text-white">{settings?.logos?.companyName || "HNV Property Management Solutions"}</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex md:space-x-8">
                        {navLinks.map(link => (
                            <a key={link.name} href={link.href} onClick={(e) => handleScroll(e, link.href)} className="font-semibold text-white/90 hover:text-white transition-colors">
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    {/* Action Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <SmartLanguageSwitcher />
                        {showInstallButton && (
                            <button
                                onClick={handleInstall}
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
                                title="Install App"
                            >
                                <Download size={16} />
                                Install
                            </button>
                        )}
                        <Link to="/login" className="font-semibold text-white/90 hover:text-white transition-colors">
                            {t('header.login', 'Log In')}
                        </Link>
                        <Link to="/register" className="px-5 py-2.5 bg-white text-brand-blue font-semibold rounded-lg shadow-md hover:bg-gray-100 transition-all">
                            {t('header.get_started', 'Get Started')}
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <SmartLanguageSwitcher />
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)} 
                            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-white/20 focus:outline-none transition-colors relative z-[70]"
                            aria-label="Toggle menu"
                        >
                            <div className="w-6 h-6 flex flex-col justify-center items-center">
                                <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                                <span className={`block h-0.5 w-6 bg-white transition-all duration-300 mt-1 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                                <span className={`block h-0.5 w-6 bg-white transition-all duration-300 mt-1 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <div className={`md:hidden fixed top-20 left-0 w-full bg-white dark:bg-gray-900 shadow-2xl border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out z-[65] ${isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-full'}`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {navLinks.map(link => (
                        <a key={link.name} href={link.href} onClick={(e) => handleScroll(e, link.href)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            {link.name}
                        </a>
                    ))}
                    <div className="px-3 py-2">
                        <Link to="/login" className="block w-full text-center py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary-dark transition-colors">
                            {t('header.login', 'Log In')}
                        </Link>
                        <Link to="/register" className="block w-full text-center mt-2 py-2 px-4 bg-brand-primary text-white font-semibold rounded-lg shadow-md hover:bg-opacity-90 transition-all">
                            {t('header.get_started', 'Get Started')}
                        </Link>
                    </div>
                </div>
                <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="mt-3 px-2 space-y-2">
                         <button onClick={toggleTheme} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors">
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />} <span>{t('common.switch_to')} {theme === 'light' ? t('common.theme_dark', 'Dark') : t('common.theme_light', 'Light')} {t('common.mode', 'Mode')}</span>
                        </button>
                         <button onClick={() => setLang(getNextToggleLanguage().code)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors">
                           <Globe size={18} /> <span>{t('common.switch_to')} {getNextToggleLanguage().name}</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default PublicHeader;
