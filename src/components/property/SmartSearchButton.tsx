import React from 'react';
import { Search, BarChart3 } from 'lucide-react';

interface SmartSearchButtonProps {
  onClick: () => void;
  properties?: any[];
  tenants?: any[];
}

const SmartSearchButton: React.FC<SmartSearchButtonProps> = ({ 
  onClick, 
  properties = [], 
  tenants = [] 
}) => {
  const occupancyRate = properties.length > 0 
    ? Math.round((tenants.filter(t => t.status === 'Active').length / properties.reduce((sum, p) => sum + (p.numberOfUnits || 1), 0)) * 100) 
    : 0;

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={onClick}
        className="w-full p-6 rounded-3xl border-2 border-white/40 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-3xl group"
        style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)'}}
      >
        <div className="flex items-center justify-between">
          {/* Search Icon */}
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border-2 border-white/40 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
            <Search size={28} className="text-white drop-shadow-lg" />
          </div>

          {/* Text */}
          <div className="flex-1 mx-4 text-left">
            <h3 className="text-xl font-bold text-white drop-shadow-lg mb-1">Smart Search</h3>
            <p className="text-white/90 font-medium drop-shadow-sm">Find properties instantly</p>
          </div>

          {/* Analytics Circle */}
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border-2 border-white/40 flex flex-col items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
            <BarChart3 size={20} className="text-white drop-shadow-lg" />
            <div className="text-xs font-bold text-white drop-shadow-sm mt-1" style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>
              {occupancyRate}%
            </div>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
    </div>
  );
};

export default SmartSearchButton;