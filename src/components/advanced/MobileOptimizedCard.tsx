import React from 'react';
import UniversalCard from '@/components/common/UniversalCard';

interface MobileOptimizedCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  gradient?: 'blue' | 'green' | 'purple' | 'orange';
  delay?: number;
  className?: string;
}

const MobileOptimizedCard: React.FC<MobileOptimizedCardProps> = ({
  children,
  title,
  subtitle,
  icon: Icon,
  gradient = 'blue',
  delay = 0,
  className = ''
}) => {
  return (
    <UniversalCard 
      gradient={gradient} 
      delay={delay} 
      className={`mobile-optimized-card ${className}`}
    >
      {(title || subtitle || Icon) && (
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
          {Icon && (
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon size={20} className="text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="font-bold text-gray-900 text-lg truncate">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 truncate">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      
      <div className="mobile-card-content">
        {children}
      </div>
      
      <style jsx>{`
        .mobile-optimized-card {
          min-height: auto;
          padding: 1rem;
        }
        
        .mobile-card-content {
          font-size: 0.875rem;
          line-height: 1.5;
        }
        
        .mobile-card-content button {
          width: 100%;
          padding: 0.75rem;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
        
        .mobile-card-content .grid {
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        
        @media (min-width: 640px) {
          .mobile-optimized-card {
            padding: 1.5rem;
          }
          
          .mobile-card-content {
            font-size: 1rem;
          }
          
          .mobile-card-content .grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
        }
      `}</style>
    </UniversalCard>
  );
};

export default MobileOptimizedCard;