import React from 'react';

interface PropertyStyleBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'header' | 'card';
  animated?: boolean;
}

const PropertyStyleBackground: React.FC<PropertyStyleBackgroundProps> = ({
  children,
  variant = 'default',
  animated = true
}) => {
  const getBackgroundStyle = () => {
    switch (variant) {
      case 'header':
        return {
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))',
          backdropFilter: 'blur(25px) saturate(200%)',
          border: '2px solid rgba(255, 255, 255, 0.4)'
        };
      case 'card':
        return {
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 255, 255, 0.2)'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #FF8A65, #42A5F5, #66BB6A)',
          backgroundAttachment: 'fixed'
        };
    }
  };

  return (
    <div className="min-h-screen relative" style={getBackgroundStyle()}>
      {animated && variant === 'default' && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse" 
            style={{backgroundColor: '#FF6B35', opacity: 0.4}}
          />
          <div 
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" 
            style={{backgroundColor: '#1E88E5', opacity: 0.4}}
          />
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-2000" 
            style={{backgroundColor: '#43A047', opacity: 0.3}}
          />
        </div>
      )}
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default PropertyStyleBackground;