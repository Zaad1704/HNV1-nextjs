import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState('Unknown');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(userAgent)) {
      setPlatform('iOS');
    } else if (/Android/.test(userAgent)) {
      setPlatform('Android');
    } else {
      setPlatform('Desktop');
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return false;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        setIsInstalled(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('PWA install failed:', error);
      return false;
    }
  };

  const getInstallInstructions = () => {
    switch (platform) {
      case 'iOS':
        return 'Tap the Share button and select "Add to Home Screen"';
      case 'Android':
        return 'Tap the menu and select "Add to Home Screen"';
      default:
        return 'Use your browser\'s install option';
    }
  };

  return {
    isInstallable,
    isInstalled,
    platform,
    installPWA,
    getInstallInstructions,
    canDirectInstall: !!deferredPrompt
  };
};