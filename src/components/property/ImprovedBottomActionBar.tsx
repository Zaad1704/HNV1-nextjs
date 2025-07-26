import React, { useState } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';

interface ActionItem {
  id: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
}

interface ImprovedBottomActionBarProps {
  actions: ActionItem[];
  primaryAction?: ActionItem;
}

const ImprovedBottomActionBar: React.FC<ImprovedBottomActionBarProps> = ({
  actions,
  primaryAction
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = (action: ActionItem) => {
    setIsExpanded(false);
    action.onClick();
  };

  return (
    <div className="fixed bottom-4 right-4" style={{zIndex: 9999}}>
      {/* Action buttons - shown when expanded */}
      {isExpanded && (
        <div className="absolute bottom-24 right-0 space-y-3 mb-2" style={{zIndex: 9998}}>
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.id} className="flex items-center gap-2 justify-end">
                <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-white text-sm whitespace-nowrap">
                  {action.label}
                </div>
                <button
                  onClick={() => handleActionClick(action)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${action.color || 'bg-gray-700'} hover:scale-110 transition-transform`}
                  style={{position: 'relative', zIndex: 9999}}
                >
                  <Icon size={20} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Backdrop for closing when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          style={{zIndex: 9997}}
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Main buttons */}
      <div className="flex flex-col gap-3 items-end">
        {/* Primary action button with text label */}
        {primaryAction && (
          <div className="flex items-center gap-3">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 px-4 py-2 rounded-full shadow-lg" style={{background: 'linear-gradient(to right, rgba(255, 218, 185, 0.8), rgba(173, 216, 230, 0.8))'}}>
              <span className="text-sm font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
                {primaryAction.label}
              </span>
            </div>
            <button
              onClick={primaryAction.onClick}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl ${primaryAction.color} hover:scale-110 transition-transform z-50`}
              style={{position: 'relative', zIndex: 50}}
            >
              <primaryAction.icon size={24} />
            </button>
          </div>
        )}
        
        {/* Menu button with text label (if there are additional actions) */}
        {actions.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 px-4 py-2 rounded-full shadow-lg" style={{background: 'linear-gradient(to right, rgba(255, 218, 185, 0.8), rgba(173, 216, 230, 0.8))'}}>
              <span className="text-sm font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
                More Actions
              </span>
            </div>
            <button
              onClick={toggleExpand}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl bg-gradient-to-r from-gray-600 to-gray-700 hover:scale-110 transition-transform z-50 ${isExpanded ? 'rotate-45' : ''}`}
              style={{position: 'relative', zIndex: 50}}
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovedBottomActionBar;