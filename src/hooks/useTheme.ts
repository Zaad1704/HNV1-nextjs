import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  actualTheme: 'light' | 'dark';
}

export const useTheme = () => {
  const [themeState, setThemeState] = useState<ThemeState>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme || 'system';
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const actualTheme = savedTheme === 'system' ? systemTheme : savedTheme;
    
    return {
      theme: savedTheme,
      actualTheme: actualTheme as 'light' | 'dark'
    };
  });

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const actualTheme = newTheme === 'system' ? systemTheme : newTheme;
    
    setThemeState({
      theme: newTheme,
      actualTheme: actualTheme as 'light' | 'dark'
    });
    
    // Apply theme to document
    applyTheme(actualTheme as 'light' | 'dark');
  };

  const applyTheme = (theme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff');
    }
  };

  useEffect(() => {
    // Apply initial theme
    applyTheme(themeState.actualTheme);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (themeState.theme === 'system') {
        const newActualTheme = e.matches ? 'dark' : 'light';
        setThemeState(prev => ({
          ...prev,
          actualTheme: newActualTheme
        }));
        applyTheme(newActualTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [themeState.theme]);

  return {
    theme: themeState.theme,
    actualTheme: themeState.actualTheme,
    setTheme,
    isDark: themeState.actualTheme === 'dark'
  };
};