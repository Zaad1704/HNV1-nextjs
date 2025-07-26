import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

interface ActionItem {
  id: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
  angle: number;
}

interface UniversalDetailActionWheelProps {
  actions: ActionItem[];
  mainIcon?: React.ElementType;
}

const UniversalDetailActionWheel: React.FC<UniversalDetailActionWheelProps> = ({
  actions,
  mainIcon: MainIcon = MoreHorizontal
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/80 to-purple-500/80 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/30"
        aria-label="Actions"
      >
        <MainIcon size={20} className={`text-white transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
      </button>

      {/* Radial Menu */}
      {isOpen && (
        <div className="absolute z-50">
          {actions.map((action, index) => {
            const Icon = action.icon;
            const radius = 70; // Distance from center
            const angleRad = (action.angle * Math.PI) / 180;
            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;
            
            return (
              <button
                key={action.id}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={`absolute w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/30`}
                style={{
                  background: action.color || 'rgba(59, 130, 246, 0.8)',
                  transform: `translate(${x}px, ${-y}px)`,
                  top: 0,
                  left: 0,
                  transition: `transform 0.3s ease ${index * 50}ms, opacity 0.3s ease ${index * 50}ms`
                }}
                aria-label={action.label}
              >
                <Icon size={16} className="text-white" />
                
                {/* Tooltip */}
                <div className="absolute whitespace-nowrap px-2 py-1 bg-black/80 text-white text-xs rounded-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                     style={{
                       bottom: '120%',
                       left: '50%',
                       transform: 'translateX(-50%)'
                     }}>
                  {action.label}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default UniversalDetailActionWheel;