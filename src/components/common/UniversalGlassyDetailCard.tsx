import React, { ReactNode } from 'react';

interface UniversalGlassyDetailCardProps {
  children: ReactNode;
  title?: string;
  icon?: React.ElementType;
  gradient?: 'primary' | 'secondary' | 'dark' | 'custom';
  customGradient?: string;
  className?: string;
  headerAction?: ReactNode;
}

const UniversalGlassyDetailCard: React.FC<UniversalGlassyDetailCardProps> = ({
  children,
  title,
  icon: Icon,
  gradient = 'primary',
  customGradient,
  className = '',
  headerAction
}) => {
  const getGradientStyle = () => {
    switch (gradient) {
      case 'primary':
        return 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))';
      case 'secondary':
        return 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(217, 70, 239, 0.05))';
      case 'dark':
        return 'linear-gradient(135deg, rgba(17, 24, 39, 0.3), rgba(75, 85, 99, 0.1))';
      case 'custom':
        return customGradient || 'linear-gradient(135deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1))';
      default:
        return 'linear-gradient(135deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1))';
    }
  };

  return (
    <div 
      className={`border-2 border-white/20 rounded-3xl shadow-2xl overflow-hidden p-6 ${className}`}
      style={{ 
        backdropFilter: 'blur(10px)', 
        WebkitBackdropFilter: 'blur(10px)', 
        background: getGradientStyle(),
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
                <Icon size={18} className="text-white" />
              </div>
            )}
            {title && <h3 className="text-lg font-bold text-white/90">{title}</h3>}
          </div>
          {headerAction}
        </div>
      )}
      {children}
    </div>
  );
};

export default UniversalGlassyDetailCard;