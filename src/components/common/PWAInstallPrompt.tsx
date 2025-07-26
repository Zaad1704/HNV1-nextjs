import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const { isInstallable, installApp } = usePWA();

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installApp();
    setIsInstalling(false);
    
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if not installable, already dismissed, or on desktop
  if (!isInstallable || !showPrompt || localStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
      >
        <div className="app-surface rounded-2xl p-4 border border-app-border shadow-app-lg">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 app-gradient rounded-xl flex items-center justify-center flex-shrink-0">
              <Smartphone size={20} className="text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-text-primary mb-1">
                Install HNV Property Management App
              </h4>
              <p className="text-sm text-text-secondary mb-3">
                Get the native app experience with offline access and push notifications.
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isInstalling ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download size={16} />
                  )}
                  {isInstalling ? 'Installing...' : 'Install'}
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;