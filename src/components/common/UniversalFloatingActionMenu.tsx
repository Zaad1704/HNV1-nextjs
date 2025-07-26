import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, Building2, Users, CreditCard, Home, FileText, Download, Search, Wallet, Receipt, CheckSquare, DollarSign, UserCheck, Wrench, MessageCircle } from 'lucide-react';

// Add CSS animations
const styles = `
  @keyframes paymentEmitParticle {
    0% {
      opacity: 0;
      transform: scale(0) translateY(0px);
    }
    20% {
      opacity: 1;
      transform: scale(1) translateY(-5px);
    }
    80% {
      opacity: 1;
      transform: scale(0.8) translateY(-15px);
    }
    100% {
      opacity: 0;
      transform: scale(0) translateY(-25px);
    }
  }
  
  @keyframes waterfallDrop {
    0% {
      opacity: 0;
      transform: translateY(-40px) translateX(-15px) scale(0.6) rotate(-5deg);
      filter: blur(2px);
    }
    30% {
      opacity: 0.6;
      transform: translateY(-10px) translateX(-5px) scale(0.9) rotate(-2deg);
      filter: blur(1px);
    }
    70% {
      opacity: 0.9;
      transform: translateY(8px) translateX(3px) scale(1.08) rotate(1deg);
      filter: blur(0.3px);
    }
    100% {
      opacity: 1;
      transform: translateY(0px) translateX(0px) scale(1) rotate(0deg);
      filter: blur(0px);
    }
  }
  
  @keyframes pulseGlow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(255, 218, 185, 0.4), 0 0 40px rgba(173, 216, 230, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(255, 218, 185, 0.6), 0 0 60px rgba(173, 216, 230, 0.5);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  .waterfall-item {
    animation: waterfallDrop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  
  .pulse-glow {
    animation: pulseGlow 2s ease-in-out infinite;
  }
  
  .shimmer-effect {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
`;

interface ActionItem {
  id: string;
  icon: React.ElementType;
  label: string;
  color: string;
  onClick: () => void;
  angle: number;
}

interface UniversalFloatingActionMenuProps {
  onAddItem: () => void;
  onBulkAction: () => void;
  onExport: () => void;
  onSearch: () => void;
  onAnalytics: () => void;
  sectionName: string;
  onPaymentHandover?: () => void;
  onInviteUser?: () => void;
  onFilter?: () => void;
  onQuickPayment?: () => void;
  onCollectionSheet?: () => void;
  onBulkPayment?: () => void;
  onBulkLeaseActions?: () => void;
  onMessage?: () => void;
}

const UniversalFloatingActionMenu: React.FC<UniversalFloatingActionMenuProps> = ({
  onAddItem,
  onBulkAction,
  onExport,
  onSearch,
  onAnalytics,
  sectionName,
  onPaymentHandover,
  onInviteUser,
  onFilter,
  onQuickPayment,
  onCollectionSheet,
  onBulkPayment,
  onBulkLeaseActions,
  onMessage
}) => {
  const [showDropdownList, setShowDropdownList] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Inject styles
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

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

  const getSectionActions = () => {
    const baseActions = [
      {
        id: 'add',
        icon: Plus,
        label: `Add ${sectionName}`,
        onClick: onAddItem
      },
      {
        id: 'export',
        icon: Download,
        label: 'Export Data',
        onClick: onExport
      },
      {
        id: 'search',
        icon: Search,
        label: 'Smart Search',
        onClick: onSearch
      },
      {
        id: 'analytics',
        icon: BarChart3,
        label: 'Analytics',
        onClick: onAnalytics
      }
    ];

    // Section-specific actions based on universal pages
    const sectionSpecificActions = {
      'Property': [{
        id: 'bulk-payment',
        icon: DollarSign,
        label: 'Bulk Payment',
        onClick: onBulkPayment || onBulkAction
      }, {
        id: 'bulk-lease',
        icon: FileText,
        label: 'Bulk Lease Actions',
        onClick: onBulkLeaseActions || (() => alert('Bulk lease actions - Renewal, increase, termination'))
      }],
      'Payment': [{
        id: 'quick-payment',
        icon: CreditCard,
        label: 'Quick Payment',
        onClick: onQuickPayment || (() => alert('Quick payment for individual tenant'))
      }, {
        id: 'bulk-payment',
        icon: Building2,
        label: 'Bulk Payment',
        onClick: onBulkPayment || onBulkAction
      }, {
        id: 'collection-sheet',
        icon: FileText,
        label: 'Collection Sheet',
        onClick: onCollectionSheet || (() => alert('Monthly collection sheet'))
      }, {
        id: 'handover',
        icon: Wallet,
        label: 'Payment Handover',
        onClick: onPaymentHandover || (() => alert('Payment handover feature'))
      }],
      'Tenant': [{
        id: 'quick-payment',
        icon: DollarSign,
        label: 'Quick Payment',
        onClick: onQuickPayment || (() => alert('Quick payment for tenant'))
      }, {
        id: 'collection-sheet',
        icon: FileText,
        label: 'Collection Sheet',
        onClick: onCollectionSheet || (() => alert('Monthly collection sheet'))
      }, {
        id: 'message',
        icon: Users,
        label: 'Message Tenants',
        onClick: onMessage || (() => alert('Message tenants feature'))
      }],
      'Maintenance': [{
        id: 'bulk-action',
        icon: Wrench,
        label: 'Bulk Action',
        onClick: onBulkAction
      }],
      'Expense': [{
        id: 'bulk-action',
        icon: Receipt,
        label: 'Bulk Action',
        onClick: onBulkAction
      }],
      'Approval': [{
        id: 'bulk-action',
        icon: CheckSquare,
        label: 'Bulk Action',
        onClick: onBulkAction
      }],
      'Cash Flow': [{
        id: 'filter',
        icon: DollarSign,
        label: 'Filter',
        onClick: onFilter || onSearch
      }],
      'Receipt': [{
        id: 'bulk-action',
        icon: Receipt,
        label: 'Bulk Action',
        onClick: onBulkAction
      }],
      'User': [{
        id: 'invite',
        icon: UserCheck,
        label: 'Invite User',
        onClick: onInviteUser || (() => alert('User invitation feature'))
      }]
    };
    
    return [...baseActions, ...(sectionSpecificActions[sectionName] || [])];
  };

  const actions = getSectionActions();

  const handleActionClick = (action: ActionItem) => {
    try {
      setShowDropdownList(false);
      setTimeout(() => {
        action.onClick();
      }, 100);
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const handleDropdownToggle = () => {
    setShowDropdownList(!showDropdownList);
  };



  return (
    <>
      <div className="flex items-center gap-4" style={{zIndex: 99999, pointerEvents: 'auto'}}>

        {/* Text Label */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 px-4 py-2 rounded-full shadow-lg" style={{background: 'linear-gradient(to right, rgba(255, 218, 185, 0.8), rgba(173, 216, 230, 0.8))'}}>
          <span className="text-sm font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
            {sectionName} Actions
          </span>
        </div>
        
        {/* Main Action Button */}
        <button
          onClick={onAddItem}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl backdrop-blur-xl border-2 border-white/30 transition-all duration-500 hover:scale-125 hover:shadow-3xl relative overflow-hidden pulse-glow"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 218, 185, 0.9), rgba(173, 216, 230, 0.9), rgba(255, 182, 193, 0.8))', 
            backdropFilter: 'blur(25px) saturate(200%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}
          title={`Add ${sectionName === 'Cash Flow' ? 'Transaction' : sectionName === 'Payment' ? 'Quick Payment' : sectionName === 'Property' ? 'Property' : sectionName === 'Tenant' ? 'Tenant' : sectionName === 'Maintenance' ? 'Request' : sectionName === 'Expense' ? 'Expense' : sectionName === 'Approval' ? 'Request' : sectionName === 'Receipt' ? 'Receipt' : sectionName === 'User' ? 'User' : sectionName}`}
        >
          {sectionName === 'Cash Flow' ? (
            <DollarSign size={22} className="drop-shadow-lg text-gray-700 relative z-10" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
          ) : sectionName === 'Payment' ? (
            <CreditCard size={22} className="drop-shadow-lg text-gray-700 relative z-10" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
          ) : sectionName === 'Property' ? (
            <Building2 size={22} className="drop-shadow-lg text-gray-700 relative z-10" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
          ) : sectionName === 'Tenant' ? (
            <Users size={22} className="drop-shadow-lg text-gray-700 relative z-10" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
          ) : sectionName === 'Maintenance' ? (
            <Wrench size={22} className="drop-shadow-lg text-gray-700 relative z-10" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
          ) : sectionName === 'Expense' ? (
            <Receipt size={22} className="drop-shadow-lg text-gray-700 relative z-10" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
          ) : sectionName === 'Approval' ? (
            <CheckSquare size={22} className="drop-shadow-lg text-gray-700 relative z-10" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
          ) : sectionName === 'Receipt' ? (
            <Download size={22} className="drop-shadow-lg text-gray-700 relative z-10" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
          ) : sectionName === 'User' ? (
            <UserCheck size={22} className="drop-shadow-lg text-gray-700 relative z-10" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
          ) : (
            <Plus size={22} className="drop-shadow-lg text-gray-700 relative z-10" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
          )}
        </button>

        {/* Dropdown Menu */}
        <div className="relative">
          <button
            onClick={handleDropdownToggle}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl backdrop-blur-xl border-2 border-white/30 transition-all duration-500 hover:scale-125 hover:shadow-3xl ${showDropdownList ? 'rotate-45 scale-110' : 'hover:rotate-12'} relative overflow-hidden pulse-glow`}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 218, 185, 0.9), rgba(173, 216, 230, 0.9), rgba(255, 182, 193, 0.8))', 
              backdropFilter: 'blur(25px) saturate(200%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}
          >
            {/* Enhanced Payment Emitting Animation */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: `${1 + Math.random() * 2}px`,
                    height: `${1 + Math.random() * 2}px`,
                    background: i % 4 === 0 ? '#FFD700' : i % 4 === 1 ? '#FF6B35' : i % 4 === 2 ? '#87CEEB' : '#FF69B4',
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                    animation: `paymentEmitParticle ${1.5 + Math.random() * 2}s ease-out infinite`,
                    animationDelay: `${i * 0.15}s`,
                    boxShadow: '0 0 4px currentColor'
                  }}
                />
              ))}
            </div>
            
            {/* Shimmer Effect */}
            <div className="absolute inset-0 rounded-full shimmer-effect opacity-30" />
            
            {/* Enhanced Pulse Animation */}
            <div className="absolute inset-0 rounded-full animate-ping opacity-60" style={{
              background: 'linear-gradient(135deg, rgba(255, 218, 185, 0.9), rgba(173, 216, 230, 0.9), rgba(255, 182, 193, 0.8))',
              animationDuration: '2s'
            }}></div>
            
            {/* Multi-layer Glow Effect */}
            <div className="absolute inset-0 rounded-full blur-lg scale-125 opacity-50" style={{
              background: 'radial-gradient(circle, rgba(255, 218, 185, 0.8), rgba(173, 216, 230, 0.6))'
            }}></div>
            <div className="absolute inset-0 rounded-full blur-2xl scale-200 opacity-30" style={{
              background: 'radial-gradient(circle, rgba(255, 182, 193, 0.6), rgba(135, 206, 235, 0.4))'
            }}></div>
            
            {sectionName === 'Property' ? (
              <Building2 size={22} className={`transition-all duration-500 ${showDropdownList ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : sectionName === 'Tenant' ? (
              <Users size={22} className={`transition-all duration-500 ${showDropdownList ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : sectionName === 'Payment' ? (
              <CreditCard size={22} className={`transition-all duration-500 ${showDropdownList ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : sectionName === 'Maintenance' ? (
              <Home size={22} className={`transition-all duration-500 ${showDropdownList ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : sectionName === 'Expense' ? (
              <Receipt size={22} className={`transition-all duration-500 ${showDropdownList ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : sectionName === 'Approval' ? (
              <CheckSquare size={22} className={`transition-all duration-500 ${showDropdownList ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : sectionName === 'Cash Flow' ? (
              <DollarSign size={22} className={`transition-all duration-500 ${showDropdownList ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : sectionName === 'Receipt' ? (
              <Receipt size={22} className={`transition-all duration-500 ${showDropdownList ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : sectionName === 'User' ? (
              <UserCheck size={22} className={`transition-all duration-500 ${showDropdownList ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : (
              <BarChart3 size={22} className={`transition-all duration-500 ${showDropdownList ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            )}
          </button>

          {/* Waterfall List Dropdown */}
          {showDropdownList && (
            <>
              <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 transition-all duration-300" 
                onClick={() => setShowDropdownList(false)}
                style={{
                  background: 'radial-gradient(circle at center, rgba(0,0,0,0.4), rgba(0,0,0,0.6))'
                }}
              />
              <div className="absolute top-full left-0 mt-2 w-72 z-50">
                <div className="space-y-1">
                  {actions.slice(1).map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <div
                        key={action.id}
                        className="waterfall-item opacity-0"
                        style={{
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        <button
                          onClick={() => handleActionClick(action)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-500 hover:scale-110 hover:-translate-y-1 group relative overflow-hidden shadow-lg hover:shadow-2xl"
                          style={{
                            background: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(25px) saturate(200%)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                          }}
                        >
                          {/* Enhanced Dark Scrim Background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/50 to-black/30 opacity-95" />
                          <div className="absolute inset-0 shimmer-effect opacity-20" />
                          
                          {/* Enhanced Icon with gradient background */}
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xl relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                            style={{
                              background: `linear-gradient(135deg, 
                                ${index % 3 === 0 ? '#87CEEB, #FF8A65, #FFD700' : 
                                  index % 3 === 1 ? '#FF6B35, #87CEEB, #FF69B4' : 
                                  '#FFD700, #FF6B35, #87CEEB'})`,
                              backdropFilter: 'blur(15px)',
                              boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                            }}
                          >
                            <Icon size={18} className="text-white transition-transform duration-300 group-hover:scale-110" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
                          </div>
                          
                          {/* Gradient Text */}
                          <span 
                            className="font-semibold text-base relative z-10"
                            style={{
                              background: `linear-gradient(135deg, 
                                ${index % 3 === 0 ? '#FF6B35, #F7931E, #1E88E5' : 
                                  index % 3 === 1 ? '#42A5F5, #66BB6A, #AB47BC' : 
                                  '#FF7043, #5C6BC0, #FF6B35'})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                              textShadow: 'none'
                            }}
                          >
                            {action.label}
                          </span>
                          
                          {/* Enhanced Hover Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/0 via-blue-400/30 via-pink-400/20 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl" />
                          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UniversalFloatingActionMenu;