import React from 'react';
import { LucideIcon } from 'lucide-react';

interface UniversalActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
}

const UniversalActionButton: React.FC<UniversalActionButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  className = ''
}) => {
  const getVariantClasses = () => {
    const variants = {
      primary: 'btn-gradient text-white shadow-xl hover:shadow-2xl',
      secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
      success: 'bg-green-500 hover:bg-green-600 text-white',
      warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      danger: 'bg-red-500 hover:bg-red-600 text-white'
    };
    return variants[variant];
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };
    return sizes[size];
  };

  const getIconSize = () => {
    const iconSizes = {
      sm: 16,
      md: 20,
      lg: 24
    };
    return iconSizes[size];
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group rounded-3xl flex items-center gap-3 font-bold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      style={{
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      {Icon && (
        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
          <Icon size={getIconSize() - 6} />
        </div>
      )}
      {children}
    </button>
  );
};

export default UniversalActionButton;