import React, { useState, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';

interface UniversalRadialActionWheelProps {
  actions: Array<{
    id: string;
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    angle: number;
  }>;
}

const UniversalRadialActionWheel: React.FC<UniversalRadialActionWheelProps> = ({
  actions
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [autoCollapseTimer, setAutoCollapseTimer] = useState<NodeJS.Timeout | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => setShowOverlay(true), 300);
    } else {
      setShowOverlay(false);
    }
    if (autoCollapseTimer) {
      clearTimeout(autoCollapseTimer);
    }
  };

  const handleActionClick = (action: any) => {
    action.onClick();
    setIsExpanded(false);
    setShowOverlay(false);
    if (autoCollapseTimer) {
      clearTimeout(autoCollapseTimer);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
        setShowOverlay(false);
      }, 6000);
      setAutoCollapseTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [isExpanded]);

  return (
    <>
      {/* Background Overlay */}
      {showOverlay && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          style={{zIndex: 9998}}
          onClick={() => {
            setIsExpanded(false);
            setShowOverlay(false);
          }}
        />
      )}

      <div className="relative" style={{zIndex: 9999}}>
        {/* Main Toggle Button */}
        <button
          onClick={handleToggle}
          className={`
            w-16 h-16 rounded-full backdrop-blur-xl border-2 border-white/50 text-white shadow-2xl
            flex items-center justify-center transition-all duration-500 relative group
            hover:scale-110 cursor-pointer
            ${isExpanded ? 'rotate-45 scale-110' : ''}
          `}
          style={{background: 'linear-gradient(135deg, rgba(255,218,185,0.5), rgba(173,216,230,0.5))', zIndex: 1, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'}}
        >
          <MoreHorizontal size={24} className={`transition-transform duration-300 text-white font-bold ${isExpanded ? 'rotate-90' : ''} pointer-events-none`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'}} />
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-xl" style={{zIndex: -1}}></div>
        </button>

        {/* Action Buttons */}
        {actions.map((action, index) => {
          const Icon = action.icon;
          const radius = 120;
          const angleRad = (action.angle * Math.PI) / 180;
          const x = Math.cos(angleRad) * radius;
          const y = Math.sin(angleRad) * radius;

          return (
            <div key={action.id} className="absolute top-0 left-0">
              {/* Action Label */}
              {isExpanded && (
                <div 
                  className="absolute backdrop-blur-xl border-2 border-white/50 text-white px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap shadow-lg pointer-events-none"
                  style={{
                    transform: `translate(${x + 75}px, ${-y - 15}px)`,
                    transition: 'all 0.3s ease',
                    background: 'rgba(0, 0, 0, 0.6)',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    zIndex: 101
                  }}
                >
                  {action.label}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => handleActionClick(action)}
                onMouseEnter={() => setHoveredAction(action.id)}
                onMouseLeave={() => setHoveredAction(null)}
                className={`
                  w-16 h-16 rounded-full backdrop-blur-xl
                  border-2 border-white/50 text-white shadow-2xl
                  flex items-center justify-center transition-all duration-500 ease-out
                  hover:scale-110 hover:shadow-3xl group cursor-pointer
                  ${isExpanded 
                    ? 'opacity-100 scale-100 pointer-events-auto' 
                    : 'opacity-0 scale-0 pointer-events-none'
                  }
                `}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,218,185,0.4), rgba(173,216,230,0.4))',
                  position: 'absolute',
                  left: isExpanded ? `${x}px` : '0px',
                  top: isExpanded ? `${-y}px` : '0px',
                  opacity: isExpanded ? 1 : 0,
                  transitionDelay: isExpanded ? `${index * 100}ms` : '0ms',
                  transition: 'none',
                  pointerEvents: isExpanded ? 'auto' : 'none',
                  zIndex: 9999
                }}
              >
                <Icon size={24} className="text-white font-bold" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'}} />
                
                {/* Button glow */}
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          );
        })}

        {/* Connecting Lines */}
        {isExpanded && (
          <svg className="absolute inset-0 pointer-events-none" style={{ width: '200px', height: '200px', top: '-90px', right: '-90px' }}>
            {actions.map((action, index) => {
              const radius = 90;
              const angleRad = (action.angle * Math.PI) / 180;
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;
              
              return (
                <line
                  key={`line-${index}`}
                  x1="100"
                  y1="100"
                  x2={100 + x}
                  y2={100 - y}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="2"
                  className="animate-draw-line"
                  style={{
                    strokeDasharray: radius,
                    strokeDashoffset: isExpanded ? 0 : radius,
                    transition: `stroke-dashoffset 0.6s ease ${index * 100}ms`
                  }}
                />
              );
            })}
          </svg>
        )}

        {/* Usage Hint */}
        {!isExpanded && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 backdrop-blur-xl border-2 border-white/50 text-white px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap opacity-0 hover:opacity-100 transition-all duration-300 pointer-events-none" style={{background: 'rgba(0, 0, 0, 0.6)', textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
            Quick Actions
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/60"></div>
          </div>
        )}
      </div>
    </>
  );
};

export default UniversalRadialActionWheel;