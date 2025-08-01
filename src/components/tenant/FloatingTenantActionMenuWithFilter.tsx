import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, Download, Search, Filter, Users, BarChart3, MessageCircle, FileText } from 'lucide-react';
import CompactTenantSmartFilters from './CompactTenantSmartFilters';

interface FloatingTenantActionMenuWithFilterProps {
  onAddTenant: () => void;
  onQuickPayment: () => void;
  onCollectionSheet: () => void;
  onExport: () => void;
  onSearch: () => void;
  onMessage: () => void;
  tenants: any[];
  onFiltersChange: (filters: any) => void;
  activeFilters: any;
}

const FloatingTenantActionMenuWithFilter: React.FC<FloatingTenantActionMenuWithFilterProps> = ({
  onAddTenant,
  onQuickPayment,
  onCollectionSheet,
  onExport,
  onSearch,
  onMessage,
  tenants,
  onFiltersChange,
  activeFilters
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check for modal overlays - only detect actual modal dialogs
  useEffect(() => {
    const checkForModals = () => {
      const modals = document.querySelectorAll('.fixed.inset-0[style*="z-index: 50"], .fixed.inset-0.z-50, .fixed.inset-0.z-\\[50\\]');
      const actualModals = Array.from(modals).filter(modal => {
        const rect = modal.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && modal.children.length > 0;
      });
      setIsModalOpen(actualModals.length > 0);
    };
    
    const observer = new MutationObserver(checkForModals);
    observer.observe(document.body, { childList: true, subtree: true });
    checkForModals();
    
    return () => observer.disconnect();
  }, []);

  const actions = [
    {
      id: 'add',
      icon: Plus,
      label: 'Add Tenant',
      color: 'bg-gradient-to-r from-blue-500 to-purple-600',
      onClick: onAddTenant,
      angle: 270
    },
    {
      id: 'payment',
      icon: DollarSign,
      label: 'Quick Payment',
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
      onClick: onQuickPayment,
      angle: 300
    },
    {
      id: 'collection',
      icon: FileText,
      label: 'Collection Sheet',
      color: 'bg-gradient-to-r from-purple-500 to-pink-600',
      onClick: onCollectionSheet,
      angle: 330
    },
    {
      id: 'export',
      icon: Download,
      label: 'Export Data',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      onClick: onExport,
      angle: 0
    },
    {
      id: 'search',
      icon: Search,
      label: 'Advanced Search',
      color: 'bg-gradient-to-r from-pink-500 to-orange-500',
      onClick: onSearch,
      angle: 30
    },
    {
      id: 'message',
      icon: MessageCircle,
      label: 'Message Tenants',
      color: 'bg-gradient-to-r from-indigo-500 to-purple-600',
      onClick: onMessage,
      angle: 60
    }
  ];

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (showFilters) setShowFilters(false);
  };

  const handleActionClick = (action: any) => {
    try {
      // Immediately collapse menu to prevent further interaction
      setIsExpanded(false);
      // Execute the action after a short delay
      setTimeout(() => {
        action.onClick();
      }, 100);
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const handleTextButtonClick = () => {
    setShowFilters(!showFilters);
    if (isExpanded) setIsExpanded(false);
  };

  // Auto-collapse after 8 seconds
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  return (
    <>
      {/* Background Overlay */}
      {(isExpanded || showFilters) && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          style={{zIndex: 99998}}
          onClick={() => {
            setIsExpanded(false);
            setShowFilters(false);
          }}
        />
      )}

      {/* Smart Filters Panel */}
      {showFilters && (
        <div className="fixed top-20 left-4 right-4 z-[99999] max-w-md mx-auto max-h-[70vh] overflow-auto">
          <CompactTenantSmartFilters 
            tenants={tenants}
            onFiltersChange={onFiltersChange}
            activeFilters={activeFilters}
            className="shadow-2xl"
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}

      <div className="relative" style={{zIndex: 99999, pointerEvents: 'auto'}}>
        {/* Action Buttons */}
        {actions.map((action, index) => {
          const Icon = action.icon;
          const radius = 120;
          const angleRad = (action.angle * Math.PI) / 180;
          const x = Math.cos(angleRad) * radius;
          const y = Math.sin(angleRad) * radius;

          return (
            <div key={action.id} className="absolute bottom-0 right-0" style={{ position: 'absolute', width: '0', height: '0' }}>
              {/* Label - Always visible when expanded, positioned to avoid blocking */}
              {isExpanded && (
                <div 
                  className="absolute bg-black/90 text-white px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap backdrop-blur-sm pointer-events-none shadow-lg border border-white/20"
                  style={{
                    left: `${x - 40}px`,
                    top: `${y - 10}px`,
                    transition: 'none'
                  }}
                >
                  {action.label}
                </div>
              )}

              {/* Action Button */}
              <button 
                onClick={() => handleActionClick(action)}
                className={`
                  w-14 h-14 ${action.color} rounded-full shadow-2xl
                  flex items-center justify-center text-white cursor-pointer
                  ${isExpanded 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 scale-0'
                  }
                `}
                style={{
                  position: 'absolute',
                  zIndex: 99999,
                  pointerEvents: isExpanded ? 'auto' : 'none',
                  touchAction: 'manipulation',
                  left: isExpanded ? `${x}px` : '0px',
                  top: isExpanded ? `${y}px` : '0px',
                  transition: 'none',
                  transform: 'none'
                }}
              >
                <Icon size={20} className="drop-shadow-lg" />
              </button>
            </div>
          );
        })}

        {/* Main FAB with Text */}
        <div className="flex items-center gap-3">
          {/* Text Label - Now clickable */}
          <div 
            onClick={handleTextButtonClick}
            className="backdrop-blur-xl bg-white/10 border border-white/20 px-4 py-2 rounded-full shadow-lg cursor-pointer hover:bg-white/20 transition-colors" 
            style={{background: 'linear-gradient(to right, rgba(255, 218, 185, 0.8), rgba(173, 216, 230, 0.8))'}}
          >
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-700" />
              <span className="text-sm font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
                Tenant Actions
              </span>
            </div>
          </div>
          
          {/* Main Button */}
          <button
            onClick={handleToggle}
            className={`
              w-16 h-16 rounded-full shadow-2xl backdrop-blur-xl border-2 border-white/30
              flex items-center justify-center text-white relative
              transition-all duration-300 hover:scale-110 hover:shadow-3xl
              ${isExpanded ? 'rotate-45 scale-110' : 'hover:rotate-12'}
            `}
            style={{
              background: 'linear-gradient(to right, rgba(255, 218, 185, 0.8), rgba(173, 216, 230, 0.8))', 
              backdropFilter: 'blur(20px) saturate(180%)',
              position: 'relative',
              zIndex: 99999,
              pointerEvents: 'auto'
            }}
          >
            <Users size={24} style={{transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)'}} className="text-gray-700" />
          </button>
        </div>

        {/* Usage Hint */}
        {!isExpanded && !showFilters && (
          <div className="absolute -top-12 right-16 bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300">
            Tenant & Action Menu
            <div className="absolute top-full right-8 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingTenantActionMenuWithFilter;