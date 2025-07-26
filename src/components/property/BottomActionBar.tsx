import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface ActionItem {
  id: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  color?: string;
}

interface BottomActionBarProps {
  actions: ActionItem[];
  primaryAction?: ActionItem;
}

const BottomActionBar: React.FC<BottomActionBarProps> = ({
  actions,
  primaryAction
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = (action: ActionItem) => {
    setIsExpanded(false);
    action.onClick();
  };

  // Default primary action if not provided
  const mainAction = primaryAction || {
    id: 'main',
    icon: Plus,
    label: 'Actions',
    onClick: toggleExpand,
    color: 'bg-gradient-to-r from-blue-500 to-purple-500'
  };

  const handleMainClick = () => {
    if (primaryAction && !isExpanded) {
      primaryAction.onClick();
    } else {
      toggleExpand();
    }
  };

  const handleLongPressStart = () => {
    if (actions.length > 0) {
      const timer = setTimeout(() => {
        setIsExpanded(true);
      }, 500);
      setLongPressTimer(timer);
    }
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Action buttons - shown when expanded */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3 mb-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.id} className="flex items-center gap-2 justify-end">
                <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-white text-sm">
                  {action.label}
                </div>
                <button
                  onClick={() => handleActionClick(action)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${action.color || 'bg-gray-700'}`}
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
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Main action button */}
      <div className="relative">
        <button
          onClick={handleMainClick}
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl ${mainAction.color} transition-transform ${isExpanded ? 'rotate-45' : ''}`}
        >
          <mainAction.icon size={24} />
        </button>
        
        {/* Long press indicator for more actions */}
        {actions.length > 0 && !isExpanded && (
          <button
            onClick={toggleExpand}
            className="absolute -top-2 -right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs"
          >
            •••
          </button>
        )}
      </div>
    </div>
  );
};

export default BottomActionBar;