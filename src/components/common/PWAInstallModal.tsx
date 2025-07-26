import React from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: string;
  canDirectInstall: boolean;
  onInstall: () => void;
  instructions: string;
}

const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  platform,
  canDirectInstall,
  onInstall,
  instructions
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="app-surface rounded-3xl p-6 max-w-md w-full border border-app-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 app-gradient rounded-xl flex items-center justify-center">
              <Smartphone size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Install App</h2>
          </div>
          <button onClick={onClose} className="p-2 text-text-secondary hover:text-text-primary">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-text-secondary mb-6">
          Get the native app experience with offline access and push notifications.
        </p>
        
        {canDirectInstall ? (
          <button
            onClick={onInstall}
            className="w-full btn-gradient py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Install Now
          </button>
        ) : (
          <div className="text-center">
            <p className="text-sm text-text-secondary mb-4">
              {instructions}
            </p>
            <button
              onClick={onClose}
              className="btn-gradient px-6 py-2 rounded-xl font-semibold"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallModal;