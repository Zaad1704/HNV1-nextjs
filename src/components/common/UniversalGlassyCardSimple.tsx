import React, { ReactNode } from 'react';

interface UniversalGlassyCardSimpleProps {
  children: ReactNode;
  className?: string;
}

const UniversalGlassyCardSimple: React.FC<UniversalGlassyCardSimpleProps> = ({
  children,
  className = ''
}) => {
  return (
    <div 
      className={`border-2 border-white/20 rounded-3xl shadow-2xl overflow-hidden p-6 ${className}`}
      style={{ 
        backdropFilter: 'blur(10px)', 
        WebkitBackdropFilter: 'blur(10px)', 
        background: 'rgba(0, 0, 0, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      {children}
    </div>
  );
};

export default UniversalGlassyCardSimple;