import React, { useState, useEffect } from 'react';
import { Plus, DollarSign, Calendar, Download, Search, Filter, Users, BarChart3, FileText, CreditCard, Building2, Wallet, Printer, Receipt } from 'lucide-react';

interface EnhancedPaymentFloatingActionMenuProps {
  onAddPayment: () => void;
  onBulkPayment: () => void;
  onQuickPayment: () => void;
  onPrintReceipts?: () => void;
  onGeneratePdf?: () => void;
}

const EnhancedPaymentFloatingActionMenu: React.FC<EnhancedPaymentFloatingActionMenuProps> = ({
  onAddPayment,
  onBulkPayment,
  onQuickPayment,
  onPrintReceipts,
  onGeneratePdf
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check for modal overlays
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
      label: 'Record Payment',
      color: 'bg-gradient-to-r from-blue-500 to-purple-600',
      onClick: onAddPayment,
      angle: 270
    },
    {
      id: 'bulk',
      icon: Building2,
      label: 'Bulk Payment',
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
      onClick: onBulkPayment,
      angle: 315
    },
    {
      id: 'quick',
      icon: Users,
      label: 'Quick Payment',
      color: 'bg-gradient-to-r from-purple-500 to-pink-600',
      onClick: onQuickPayment,
      angle: 0
    },
    {
      id: 'print',
      icon: Printer,
      label: 'Print Receipt',
      color: 'bg-gradient-to-r from-amber-500 to-yellow-600',
      onClick: onPrintReceipts || (() => {}),
      angle: 45
    },
    {
      id: 'pdf',
      icon: FileText,
      label: 'Generate PDF',
      color: 'bg-gradient-to-r from-pink-500 to-orange-500',
      onClick: onGeneratePdf || (() => {}),
      angle: 90
    }
  ];

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = (action: any) => {
    try {
      setIsExpanded(false);
      setTimeout(() => {
        action.onClick();
      }, 100);
    } catch (error) {
      console.error('Action failed:', error);
    }
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
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          style={{zIndex: 99998}}
          onClick={() => setIsExpanded(false)}
        />
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
              {/* Label - Always visible when expanded */}
              {isExpanded && (
                <div 
                  className="absolute bg-black/80 text-white px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap backdrop-blur-sm pointer-events-none"
                  style={{
                    transform: action.angle === 0 ? `translate(${x - 80}px, ${y - 10}px)` :
                              action.angle === 30 ? `translate(${x - 90}px, ${y + 10}px)` :
                              action.angle === 60 ? `translate(${x - 70}px, ${y + 20}px)` :
                              `translate(${x + 40}px, ${y + Math.sin(angleRad) * 40}px)`,
                    transition: 'all 0.3s ease'
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
                
                {/* Ripple Effect */}
                <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200"></div>
              </button>
            </div>
          );
        })}

        {/* Connection Lines */}
        {isExpanded && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: '300px', height: '300px', top: '-120px', right: '-120px' }}>
            {actions.map((action, index) => {
              const radius = 120;
              const angleRad = (action.angle * Math.PI) / 180;
              const x = Math.cos(angleRad) * radius + 120;
              const y = Math.sin(angleRad) * radius + 120;
              
              return (
                <line
                  key={action.id}
                  x1="120"
                  y1="120"
                  x2={x}
                  y2={y}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  className="animate-draw-line"
                  style={{
                    strokeDasharray: radius,
                    strokeDashoffset: isExpanded ? 0 : radius,
                    transition: `stroke-dashoffset 0.5s ease ${index * 50}ms`
                  }}
                />
              );
            })}
          </svg>
        )}

        {/* Main FAB with Text */}
        <div className="flex items-center gap-3">
          {/* Text Label */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 px-4 py-2 rounded-full shadow-lg" style={{background: 'linear-gradient(to right, rgba(255, 218, 185, 0.8), rgba(173, 216, 230, 0.8))'}}>
            <span className="text-sm font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
              Payment Actions
            </span>
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
            }}>
            <CreditCard size={24} className={`transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''} drop-shadow-lg text-gray-700`} />
            
            {/* Pulse Animation */}
            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{background: 'linear-gradient(to right, rgba(255, 218, 185, 0.5), rgba(173, 216, 230, 0.5))'}}></div>
            
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full blur-xl scale-150 opacity-40" style={{background: 'linear-gradient(to right, rgba(255, 218, 185, 0.6), rgba(173, 216, 230, 0.6))'}}></div>
          </button>
        </div>
      </div>
    </>
  );
};

export default EnhancedPaymentFloatingActionMenu;