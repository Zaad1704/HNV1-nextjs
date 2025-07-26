// PWA utilities for enhanced offline functionality

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

export const checkOnlineStatus = () => {
  return navigator.onLine;
};

export const enableBackgroundSync = (tag: string) => {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then((registration) => {
      return registration.sync.register(tag);
    });
  }
};

export const cacheUserData = (key: string, data: any) => {
  try {
    localStorage.setItem(`hnv1_cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));
  } catch (error) {
    console.error('Failed to cache data:', error);
  }
};

export const getCachedUserData = (key: string) => {
  try {
    const cached = localStorage.getItem(`hnv1_cache_${key}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.expires > Date.now()) {
        return parsed.data;
      } else {
        localStorage.removeItem(`hnv1_cache_${key}`);
      }
    }
  } catch (error) {
    console.error('Failed to get cached data:', error);
  }
  return null;
};

export const clearExpiredCache = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('hnv1_cache_')) {
      try {
        const cached = JSON.parse(localStorage.getItem(key) || '{}');
        if (cached.expires && cached.expires < Date.now()) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        localStorage.removeItem(key);
      }
    }
  });
};