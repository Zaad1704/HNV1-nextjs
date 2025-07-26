// frontend/src/components/landing/InstallAppSection.tsx

import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { DownloadCloud } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const InstallAppSection = () => {
    const { t } = useTranslation(); // Initialize useTranslation
    const { data: settings } = useSiteSettings();
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallButton, setShowInstallButton] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setDeferredPrompt(event);
            // Show the button if the PWA is not already installed
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                setShowInstallButton(true);
            }
        };

        const handleAppInstalled = () => {
            setShowInstallButton(false); // Hide button if app is installed
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

                setShowInstallButton(false); // Hide button if user installs
            } else {

            }
            setDeferredPrompt(null);
        } else {
            // Fallback for browsers that don't support beforeinstallprompt or if already dismissed
            alert(t('install_app_manual_prompt', "To install, please use the 'Install' option in your browser's menu (usually found in the three-dot menu)."));
        }
    };

    // Only render the section if the install button should be shown
    if (!showInstallButton) return null;

    return (
        <section id="install-app" className="text-center bg-light-card dark:bg-dark-card py-20 rounded-xl shadow-lg border border-border-color dark:border-border-color-dark transition-all duration-200">
            <h2 className="text-4xl font-bold text-dark-text dark:text-dark-text-dark">{settings?.installAppSection?.title || t('install_app.title')}</h2>
            <p className="mt-4 text-light-text dark:text-light-text-dark max-w-2xl mx-auto">{settings?.installAppSection?.subtitle || t('install_app.subtitle')}</p>
            <button
                onClick={handleInstallClick}
                className="mt-10 inline-flex items-center gap-3 bg-brand-primary text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-brand-secondary shadow-xl transition-all transform hover:scale-105"
            >
                <DownloadCloud />
                {t('install_app.cta', 'Install App on Your Device')}
            </button>
        </section>
    );
};

export default InstallAppSection;
