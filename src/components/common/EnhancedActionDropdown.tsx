import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Archive, 
  Eye, 
  DollarSign, 
  FileText, 
  Share2, 
  Download, 
  Copy, 
  Star,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Settings,
  Users,
  CreditCard,
  Receipt,
  TrendingUp
} from 'lucide-react';

interface ActionItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  color?: string;
  gradient?: string;
  dangerous?: boolean;
}

interface EnhancedActionDropdownProps {
  actions: ActionItem[];
  showPaymentFloat?: boolean;
  onPaymentClick?: () => void;
}

const EnhancedActionDropdown: React.FC<EnhancedActionDropdownProps> = ({
  actions,
  showPaymentFloat = false,
  onPaymentClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPaymentAnimation, setShowPaymentAnimation] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePaymentClick = () => {
    setShowPaymentAnimation(true);
    setTimeout(() => setShowPaymentAnimation(false), 2000);
    onPaymentClick?.();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Water Dropping Animation */}
      <div className="absolute -inset-4 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-bounce opacity-0"
            style={{
              left: `${20 + i * 10}%`,
              top: `${10 + i * 5}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s',
              animationIterationCount: 'infinite'
            }}
          />
        ))}
      </div>

      {/* Payment Floating Action */}
      {showPaymentFloat && (
        <button
          onClick={handlePaymentClick}
          className={`absolute -top-12 -right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
            showPaymentAnimation ? 'animate-ping' : 'hover:scale-110'
          }`}
          style={{
            background: 'linear-gradient(135deg, #FF6B35, #1E88E5)',
            boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)'
          }}
        >
          <DollarSign size={16} className="text-white" />
          {showPaymentAnimation && (
            <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-orange-400 to-blue-400 opacity-50" />
          )}
        </button>
      )}

      {/* Main Action Button with Payment Emitting Animation */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.8), rgba(30, 136, 229, 0.8))',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Payment Emitting Animation - Same as floating payment button */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: i % 2 === 0 ? '#FFD700' : '#FF6B35',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `paymentEmitParticle ${2 + Math.random()}s ease-out infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
        
        <MoreVertical size={16} className="text-white group-hover:rotate-90 transition-transform duration-300 relative z-10" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))'}} />
        
        {/* Scrim Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20 opacity-50" />
        
        {/* Ripple Effect */}
        <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      </button>

      {/* Dropdown Menu - Water Drop Cards */}
      {isOpen && (
        <div className="absolute right-0 top-10 w-64 z-50">
          <div className="grid grid-cols-2 gap-2 p-2">
            {actions.filter(action => 
              !action.label.toLowerCase().includes('payment') && 
              !action.label.toLowerCase().includes('$') &&
              action.id !== 'payment' &&
              action.id !== 'collect-payment'
            ).map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.id}
                  className="water-drop-card opacity-0"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animation: 'waterDropFall 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
                  }}
                >
                  <button
                    onClick={() => {
                      action.onClick();
                      setIsOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl transition-all duration-300 hover:scale-105 group relative overflow-hidden ${
                      action.dangerous ? 'hover:shadow-red-500/30' : 'hover:shadow-blue-500/30'
                    }`}
                    style={{
                      background: action.gradient || (action.dangerous 
                        ? 'linear-gradient(135deg, #FF6B6B 0%, #EE5A24 25%, #FF3838 50%, #C44569 75%, #F8B500 100%)' 
                        : `linear-gradient(135deg, 
                            #FF6B35 0%, 
                            #F7931E 15%, 
                            #1E88E5 30%, 
                            #42A5F5 45%, 
                            #66BB6A 60%, 
                            #AB47BC 75%, 
                            #FF7043 90%, 
                            #5C6BC0 100%)`),
                      backdropFilter: 'blur(25px) saturate(200%)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.3), inset 0 -2px 0 rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    {/* Enhanced Multi-Layer Scrim Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-black/30 opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-tl from-orange-300/20 via-transparent to-blue-300/20 opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30" />
                    
                    {/* Icon */}
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <Icon size={20} className="text-white" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.5))'}} />
                      </div>
                      
                      {/* Label */}
                      <span className="text-xs font-semibold text-white text-center leading-tight" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                        {action.label}
                      </span>
                    </div>
                    
                    {/* Hover Shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes waterDropFall {
          0% {
            opacity: 0;
            transform: translateY(-50px) scale(0.3) rotate(-10deg);
            filter: blur(2px);
          }
          30% {
            opacity: 0.7;
            transform: translateY(-10px) scale(0.8) rotate(-3deg);
            filter: blur(1px);
          }
          70% {
            opacity: 1;
            transform: translateY(8px) scale(1.1) rotate(3deg);
            filter: blur(0px);
          }
          85% {
            transform: translateY(-2px) scale(1.02) rotate(-1deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1) rotate(0deg);
            filter: blur(0px);
          }
        }
        
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
      `}</style>
    </div>
  );
};

export default EnhancedActionDropdown;