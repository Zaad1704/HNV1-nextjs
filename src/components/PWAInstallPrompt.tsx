import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Apple } from 'lucide-react';


interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt = () => {

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceType, setDeviceType] = useState<'android' | 'ios' | 'desktop' | 'other'>('other');

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android/.test(userAgent)) {
      setDeviceType('android');
    } else if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/windows|macintosh|linux/.test(userAgent)) {
      setDeviceType('desktop');
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, Samsung Internet)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show prompt immediately for better visibility
    const timer = setTimeout(() => {
      if (!isInstalled) {
        setShowPrompt(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
      } catch (error) {

      }
    }
  };

  const getInstallInstructions = () => {
    switch (deviceType) {
      case 'android':
        return {
          icon: <Smartphone className="w-6 h-6" />,
          title: 'Install on Android',
          steps: [
            'Tap the menu button',
            'Select "Add to Home screen"',
            'Tap "Add" to install'
          ]
        };
      case 'ios':
        return {
          icon: <Apple className="w-6 h-6" />,
          title: 'Add to Home Screen',
          steps: [
            'Tap the Share button',
            'Select "Add to Home Screen"',
            'Tap "Add" to install'
          ]
        };
      case 'desktop':
        return {
          icon: <Monitor className="w-6 h-6" />,
          title: 'Install on Desktop',
          steps: [
            'Click the install icon in address bar',
            'Click "Install" in the popup',
            'App will be added to your desktop'
          ]
        };
      default:
        return {
          icon: <Download className="w-6 h-6" />,
          title: 'Install App',
          steps: [
            'Look for install option in browser',
            'Follow browser prompts',
            'App will be installed'
          ]
        };
    }
  };

  if (isInstalled || !showPrompt) return null;

  const instructions = getInstallInstructions();

  const [showInstructions, setShowInstructions] = useState(false);

  if (showInstructions) {
    return (
      <div className="fixed top-4 right-4 w-80 max-w-[calc(100vw-2rem)] z-50">
        <div className="app-surface rounded-xl p-4 border border-app-border shadow-lg backdrop-blur-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {instructions.icon}
              <h3 className="font-semibold text-text-primary text-sm">{instructions.title}</h3>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2 mb-3">
            {instructions.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-2 text-xs text-text-secondary">
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setShowInstructions(false)}
            className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg px-3 py-2 flex items-center gap-2 max-w-xs">
        <Download size={16} />
        <span className="text-sm font-medium truncate">
          Install for offline access
        </span>
        <div className="flex items-center gap-1 ml-auto">
          {deferredPrompt ? (
            <button
              onClick={handleInstall}
              className="bg-white/20 hover:bg-white/30 rounded px-2 py-1 text-xs font-medium transition-colors"
            >
              Install
            </button>
          ) : (
            <button
              onClick={() => setShowInstructions(true)}
              className="bg-white/20 hover:bg-white/30 rounded px-2 py-1 text-xs font-medium transition-colors"
            >
              How
            </button>
          )}
          <button
            onClick={() => setShowPrompt(false)}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;