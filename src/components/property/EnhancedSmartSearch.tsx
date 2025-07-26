import React, { useState, useEffect } from 'react';
import { Search, Filter, BarChart3, TrendingUp, Users, DollarSign, Calendar, X, Sparkles } from 'lucide-react';

interface EnhancedSmartSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
  showVacant: boolean;
  showArchived: boolean;
  onToggleVacant: () => void;
  onToggleArchived: () => void;
  properties?: any[];
  tenants?: any[];
}

const EnhancedSmartSearch: React.FC<EnhancedSmartSearchProps> = ({
  onSearch,
  onFilterChange,
  showVacant,
  showArchived,
  onToggleVacant,
  onToggleArchived,
  properties = [],
  tenants = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [currentAnalytic, setCurrentAnalytic] = useState(0);

  const analytics = [
    {
      icon: Users,
      label: 'Occupancy',
      value: properties.length > 0 ? Math.round((tenants.filter(t => t.status === 'Active').length / properties.reduce((sum, p) => sum + (p.numberOfUnits || 1), 0)) * 100) : 0,
      suffix: '%',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: DollarSign,
      label: 'Revenue',
      value: tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0),
      prefix: '$',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Calendar,
      label: 'Expiring',
      value: tenants.filter(t => {
        if (!t.leaseEndDate) return false;
        const endDate = new Date(t.leaseEndDate);
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
        return endDate <= threeMonthsFromNow && endDate >= new Date();
      }).length,
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: TrendingUp,
      label: 'Properties',
      value: properties.filter(p => p.status !== 'Archived').length,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAnalytic(prev => (prev + 1) % analytics.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [analytics.length]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const currentAnalyticData = analytics[currentAnalytic];
  const AnalyticIcon = currentAnalyticData.icon;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Main Search Bar with Integrated Analytics Circle */}
      <div className="relative">
        <div 
          className="flex items-center gap-4 p-4 rounded-3xl border-2 border-white/40 shadow-2xl backdrop-blur-xl"
          style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)'}}
        >
          {/* Analytics Circle Button */}
          <div 
            className="relative flex-shrink-0 cursor-pointer group"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <div className="w-16 h-16 rounded-full backdrop-blur-xl border-2 border-white/40 flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl bg-white/20">
              <div className="flex flex-col items-center">
                <AnalyticIcon size={20} className="text-white drop-shadow-lg" />
                <div className="text-xs font-bold text-white drop-shadow-lg mt-1" style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>
                  {currentAnalyticData.prefix}{currentAnalyticData.value.toLocaleString()}{currentAnalyticData.suffix}
                </div>
              </div>
            </div>
            
            {/* Rotating indicator dots */}
            <div className="absolute -top-1 -right-1 flex gap-1">
              {analytics.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentAnalytic ? 'bg-white shadow-lg' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white/30 backdrop-blur-xl border-2 border-white/50 text-white px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap" style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>
              {currentAnalyticData.label}
            </div>
          </div>

          {/* Search Input */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70" />
            <input
              type="text"
              placeholder="Search properties by name, address, or details..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 bg-white/30 backdrop-blur-xl border-2 border-white/40 rounded-2xl text-white placeholder-white/80 font-bold focus:outline-none focus:border-white/80 focus:bg-white/40 transition-all duration-300 enhanced-search-input"
              style={{
                fontSize: '16px',
                color: 'white',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
              }}
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-shrink-0 w-12 h-12 rounded-2xl backdrop-blur-xl border-2 border-white/40 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl ${
              showFilters ? 'bg-white/30 shadow-xl' : 'bg-white/20'
            }`}
          >
            <Filter size={20} className="text-white drop-shadow-lg" />
          </button>
        </div>

        {/* Expanded Analytics Panel */}
        {showAnalytics && (
          <div 
            className="absolute top-full left-0 right-0 mt-2 p-6 rounded-3xl border-2 border-white/40 shadow-2xl backdrop-blur-xl z-50"
            style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)'}}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white drop-shadow-lg flex items-center gap-2">
                <BarChart3 size={24} className="text-white" />
                Analytics Overview
              </h3>
              <button
                onClick={() => setShowAnalytics(false)}
                className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xl border-2 border-white/40 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analytics.map((analytic, index) => {
                const Icon = analytic.icon;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-2xl bg-white/20 backdrop-blur-xl border-2 border-white/40 text-center transition-all duration-300 hover:scale-105 hover:bg-white/30 ${
                      index === currentAnalytic ? 'ring-2 ring-white/60 shadow-xl' : ''
                    }`}
                  >
                    <Icon size={24} className="text-white mx-auto mb-2 drop-shadow-lg" />
                    <div className="text-2xl font-bold text-white drop-shadow-lg" style={{textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                      {analytic.prefix}{analytic.value.toLocaleString()}{analytic.suffix}
                    </div>
                    <div className="text-sm text-white font-bold drop-shadow-md" style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}>
                      {analytic.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div 
          className="p-6 rounded-3xl border-2 border-white/40 shadow-2xl backdrop-blur-xl"
          style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)'}}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white drop-shadow-lg flex items-center gap-2">
              <Filter size={24} className="text-white" />
              Smart Filters
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xl border-2 border-white/40 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={onToggleVacant}
              className={`p-4 rounded-2xl backdrop-blur-xl border-2 border-white/40 text-white font-bold transition-all duration-300 hover:scale-105 ${
                showVacant ? 'bg-white/30 shadow-xl' : 'bg-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 border-white ${showVacant ? 'bg-white' : ''}`}></div>
                Show Vacant Only
              </div>
            </button>
            
            <button
              onClick={onToggleArchived}
              className={`p-4 rounded-2xl backdrop-blur-xl border-2 border-white/40 text-white font-bold transition-all duration-300 hover:scale-105 ${
                showArchived ? 'bg-white/30 shadow-xl' : 'bg-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 border-white ${showArchived ? 'bg-white' : ''}`}></div>
                Show Archived
              </div>
            </button>
            
            <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-xl border-2 border-white/40">
              <select
                onChange={(e) => onFilterChange({ status: e.target.value })}
                className="w-full bg-white/20 backdrop-blur-xl border-2 border-white/40 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:bg-white/30"
                style={{color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}
              >
                <option value="" style={{color: '#333', backgroundColor: 'white'}}>All Status</option>
                <option value="Active" style={{color: '#333', backgroundColor: 'white'}}>Active</option>
                <option value="Maintenance" style={{color: '#333', backgroundColor: 'white'}}>Maintenance</option>
                <option value="Archived" style={{color: '#333', backgroundColor: 'white'}}>Archived</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSmartSearch;