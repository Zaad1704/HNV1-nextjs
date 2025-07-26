import React from 'react';

interface PropertyStyleCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: 'primary' | 'secondary' | 'dark';
}

const PropertyStyleCard: React.FC<PropertyStyleCardProps> = ({
  children,
  className = '',
  hover = true,
  gradient = 'primary'
}) => {
  const getGradient = () => {
    switch (gradient) {
      case 'secondary':
        return 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))';
      case 'dark':
        return 'linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(30, 30, 30, 0.3))';
      default:
        return 'linear-gradient(135deg, rgba(255, 138, 101, 0.1), rgba(66, 165, 245, 0.1))';
    }
  };

  return (
    <div
      className={`
        property-style-card
        border-2 border-white/20 rounded-3xl shadow-2xl overflow-hidden relative
        ${className}
      `}
      style={{
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        background: getGradient(),
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      {children}
    </div>
  );
};

export default PropertyStyleCard;