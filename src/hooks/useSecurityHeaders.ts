import { useEffect } from 'react';

export const useSecurityHeaders = () => {
  useEffect(() => {
    // Only add non-conflicting security measures

    // Add security event listeners
    const handleContextMenu = (e: Event) => {
      if (import.meta.env.PROD) {
        e.preventDefault();
      }
    };
    
    const handleSelectStart = (e: Event) => {
      if (import.meta.env.PROD) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);
};