import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

interface ActionItem {
  id: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

interface SimpleActionMenuProps {
  actions: ActionItem[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  buttonStyle?: 'glass' | 'solid' | 'outline';
}

const SimpleActionMenu: React.FC<SimpleActionMenuProps> = ({
  actions,
  position = 'bottom',
  buttonStyle = 'glass'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleActionClick = (action: ActionItem) => {
    setIsOpen(false);
    action.onClick();
  };

  // Button style classes
  const buttonClasses = {
    glass: "backdrop-blur-xl bg-white/20 border border-white/30 shadow-lg",
    solid: "bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg",
    outline: "bg-transparent border-2 border-white/50 shadow-md"
  };

  // Position classes for the dropdown
  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2"
  };

  return (
    <div className="relative inline-block">
      {/* Main button */}
      <button
        onClick={toggleMenu}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${buttonClasses[buttonStyle]}`}
      >
        <MoreHorizontal size={20} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop for closing */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div 
            className={`absolute ${positionClasses[position]} z-50 min-w-[180px] rounded-lg overflow-hidden bg-black/80 backdrop-blur-xl border border-white/20 shadow-xl`}
          >
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors text-left"
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SimpleActionMenu;