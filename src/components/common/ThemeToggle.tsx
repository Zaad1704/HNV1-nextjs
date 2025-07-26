import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeContext, Theme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = false,
  size = 'md'
}) => {
  const { theme, setTheme, isDark } = useThemeContext();

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} /> },
    { value: 'dark', label: 'Dark', icon: <Moon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} /> },
    { value: 'system', label: 'System', icon: <Monitor size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} /> }
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  const handleThemeChange = () => {
    const currentIndex = themes.findIndex(t => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-3 text-base'
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleThemeChange}
        className={`
          ${sizeClasses[size]}
          flex items-center gap-2 rounded-lg
          bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700
          text-gray-700 dark:text-gray-300
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          dark:focus:ring-offset-gray-800
        `}
        title={`Current theme: ${currentTheme.label}. Click to cycle themes.`}
        aria-label={`Switch theme. Current: ${currentTheme.label}`}
      >
        <span className="flex items-center justify-center">
          {currentTheme.icon}
        </span>
        {showLabel && (
          <span className="font-medium">
            {currentTheme.label}
          </span>
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;