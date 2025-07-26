import React, { useState } from 'react';
import { Building2, Users, FileText, Download, Search, BarChart3, Wallet, CreditCard, Home, UserCheck, Receipt, CheckSquare, DollarSign, Wrench } from 'lucide-react';

// Enhanced CSS animations from UniversalFloatingActionMenu
const styles = `
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
  
  @keyframes paymentEmitParticle {
    0% {
      opacity: 0;
      transform: scale(0) translateY(0px) rotate(0deg);
    }
    15% {
      opacity: 0.8;
      transform: scale(1.2) translateY(-8px) rotate(45deg);
    }
    50% {
      opacity: 1;
      transform: scale(1) translateY(-18px) rotate(180deg);
    }
    85% {
      opacity: 0.6;
      transform: scale(0.7) translateY(-28px) rotate(270deg);
    }
    100% {
      opacity: 0;
      transform: scale(0) translateY(-40px) rotate(360deg);
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
  onClick: () => void;
  color?: string;
}

interface HeaderActionBarProps {
  actions: ActionItem[];
  primaryAction?: ActionItem;
  sectionName: string;
  onSearch?: () => void;
  onAnalytics?: () => void;
  onExport?: () => void;
}

const HeaderActionBar: React.FC<HeaderActionBarProps> = ({
  actions,
  primaryAction,
  sectionName,
  onSearch,
  onAnalytics,
  onExport
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Inject styles
  React.useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const handleActionClick = (action: ActionItem) => {
    setIsExpanded(false);
    try {
      action.onClick();
    } catch (error) {
      console.error('Action failed:', error);
      // Fallback actions for common action types
      if (action.id === 'search' && onSearch) {
        onSearch();
      } else if (action.id === 'analytics' && onAnalytics) {
        onAnalytics();
      } else if (action.id === 'export' && onExport) {
        onExport();
      }
    }
  };

  return (
    <div className="flex items-center gap-4 mb-6 px-4">
      {/* Primary Action */}
      {primaryAction && (
        <div className="flex items-center gap-3">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 px-4 py-2 rounded-full shadow-lg" style={{background: 'linear-gradient(to right, rgba(255, 218, 185, 0.8), rgba(173, 216, 230, 0.8))'}}>
            <span className="text-sm font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent whitespace-nowrap">
              {sectionName} Actions
            </span>
          </div>
          <button
            onClick={primaryAction.onClick}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${primaryAction.color} hover:scale-110 transition-transform`}
          >
            <primaryAction.icon size={20} />
          </button>
        </div>
      )}

      {/* More Actions */}
      {actions.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl backdrop-blur-xl border-2 border-white/30 transition-all duration-500 hover:scale-125 hover:shadow-3xl ${isExpanded ? 'rotate-45 scale-115' : 'hover:rotate-12'} relative overflow-hidden pulse-glow`}
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
              <Building2 size={22} className={`transition-all duration-500 ${isExpanded ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : sectionName === 'Tenant' ? (
              <Users size={22} className={`transition-all duration-500 ${isExpanded ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : sectionName === 'Payment' ? (
              <CreditCard size={22} className={`transition-all duration-500 ${isExpanded ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : sectionName === 'Maintenance' ? (
              <Home size={22} className={`transition-all duration-500 ${isExpanded ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : sectionName === 'Expense' ? (
              <Receipt size={22} className={`transition-all duration-500 ${isExpanded ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : sectionName === 'Approval' ? (
              <CheckSquare size={22} className={`transition-all duration-500 ${isExpanded ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : sectionName === 'Cash Flow' ? (
              <DollarSign size={22} className={`transition-all duration-500 ${isExpanded ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : sectionName === 'Receipt' ? (
              <Receipt size={22} className={`transition-all duration-500 ${isExpanded ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : sectionName === 'User' ? (
              <UserCheck size={22} className={`transition-all duration-500 ${isExpanded ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            ) : (
              <BarChart3 size={22} className={`transition-all duration-500 ${isExpanded ? 'rotate-45 scale-110' : 'hover:scale-105'} drop-shadow-lg text-gray-700 relative z-10`} style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.6))'}} />
            )}
          </button>

          {/* Waterfall List Dropdown */}
          {isExpanded && (
            <>
              <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 transition-all duration-300" 
                onClick={() => setIsExpanded(false)}
                style={{
                  background: 'radial-gradient(circle at center, rgba(0,0,0,0.4), rgba(0,0,0,0.6))'
                }}
              />
              <div className="absolute top-full left-0 mt-2 w-72 z-50">
                <div className="space-y-1">
                  {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <div
                        key={action.id}
                        className="waterfall-item opacity-0"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: 'waterfallDrop 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
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
      )}
    </div>
  );
};

export default HeaderActionBar;