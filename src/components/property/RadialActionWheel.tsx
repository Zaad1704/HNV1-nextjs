import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Download, MoreHorizontal } from 'lucide-react';

interface RadialActionWheelProps {
  onBulkPayment: () => void;
  onBulkLeaseActions: () => void;
  onExport: () => void;
}

const RadialActionWheel: React.FC<RadialActionWheelProps> = ({
  onBulkPayment,
  onBulkLeaseActions,
  onExport
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoCollapseTimer, setAutoCollapseTimer] = useState<NodeJS.Timeout | null>(null);

  const actions = [
    {
      icon: DollarSign,
      label: 'Bulk Payment',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: onBulkPayment,
      angle: -60 // degrees
    },
    {
      icon: Calendar,
      label: 'Bulk Lease Actions',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: onBulkLeaseActions,
      angle: 0
    },
    {
      icon: Download,
      label: 'Export',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: onExport,
      angle: 60
    }
  ];

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (autoCollapseTimer) {
      clearTimeout(autoCollapseTimer);
    }
  };

  const handleActionClick = (action: any) => {
    action.onClick();
    setIsExpanded(false);
    if (autoCollapseTimer) {
      clearTimeout(autoCollapseTimer);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 5000); // Auto-collapse after 5 seconds
      setAutoCollapseTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [isExpanded]);

  return (
    <div className="relative">
      {/* Main Toggle Button */}
      <button
        onClick={handleToggle}
        className={`
          w-12 h-12 rounded-full bg-gray-600 hover:bg-gray-700 text-white shadow-lg
          flex items-center justify-center transition-all duration-300 relative z-20
          ${isExpanded ? 'rotate-45 scale-110' : 'hover:scale-105'}
        `}
      >
        <MoreHorizontal size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Action Buttons */}
      {actions.map((action, index) => {
        const Icon = action.icon;
        const radius = 80; // Distance from center
        const angleRad = (action.angle * Math.PI) / 180;
        const x = Math.cos(angleRad) * radius;
        const y = Math.sin(angleRad) * radius;

        return (
          <button
            key={index}
            onClick={() => handleActionClick(action)}
            className={`
              absolute w-10 h-10 rounded-full ${action.color} text-white shadow-lg
              flex items-center justify-center transition-all duration-500 z-10
              ${isExpanded 
                ? 'opacity-100 scale-100 pointer-events-auto' 
                : 'opacity-0 scale-0 pointer-events-none'
              }
            `}
            style={{
              transform: isExpanded 
                ? `translate(${x}px, ${y}px) scale(1)` 
                : 'translate(0, 0) scale(0)',
              transitionDelay: isExpanded ? `${index * 100}ms` : '0ms'
            }}
            title={action.label}
          >
            <Icon size={16} />
          </button>
        );
      })}

      {/* Background Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/10 z-0"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Connecting Lines Animation */}
      {isExpanded && (
        <div className="absolute inset-0 pointer-events-none z-5">
          {actions.map((action, index) => {
            const radius = 80;
            const angleRad = (action.angle * Math.PI) / 180;
            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;
            
            return (
              <div
                key={`line-${index}`}
                className="absolute w-0.5 bg-gray-400/30 origin-bottom"
                style={{
                  height: `${radius}px`,
                  transform: `rotate(${action.angle + 90}deg)`,
                  left: '50%',
                  top: '50%',
                  transformOrigin: 'bottom center',
                  animation: `drawLine 0.5s ease-out ${index * 100}ms forwards`
                }}
              />
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes drawLine {
          from {
            height: 0;
          }
          to {
            height: ${80}px;
          }
        }
      `}</style>
    </div>
  );
};

export default RadialActionWheel;