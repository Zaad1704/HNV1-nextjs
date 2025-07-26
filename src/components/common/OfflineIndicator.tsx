import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline || showReconnected) {
    return (
      <div
        className={`fixed top-0 left-0 right-0 z-50 p-3 text-center text-white font-medium transition-all ${
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
          {isOnline ? 'Connection restored' : 'You are offline'}
        </div>
      </div>
    );
  }

  return null;
};

export default OfflineIndicator;