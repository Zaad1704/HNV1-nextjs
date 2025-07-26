import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Eye, EyeOff, Archive } from 'lucide-react';

interface SmartCollapsibleSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
  showVacant: boolean;
  showArchived: boolean;
  onToggleVacant: () => void;
  onToggleArchived: () => void;
}

const SmartCollapsibleSearch: React.FC<SmartCollapsibleSearchProps> = ({
  onSearch,
  onFilterChange,
  showVacant,
  showArchived,
  onToggleVacant,
  onToggleArchived
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ status: '', units: '', rentRange: '' });
  const [autoCollapseTimer, setAutoCollapseTimer] = useState<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => searchRef.current?.focus(), 300);
    }
    if (autoCollapseTimer) {
      clearTimeout(autoCollapseTimer);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
    resetAutoCollapse();
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
    resetAutoCollapse();
  };

  const resetAutoCollapse = () => {
    if (autoCollapseTimer) {
      clearTimeout(autoCollapseTimer);
    }
    const timer = setTimeout(() => {
      if (!searchQuery && !Object.values(filters).some(Boolean)) {
        setIsExpanded(false);
      }
    }, 8000);
    setAutoCollapseTimer(timer);
  };

  const clearAll = () => {
    setSearchQuery('');
    setFilters({ status: '', units: '', rentRange: '' });
    onSearch('');
    onFilterChange({});
    setIsExpanded(false);
  };

  useEffect(() => {
    if (isExpanded) {
      resetAutoCollapse();
    }
    return () => {
      if (autoCollapseTimer) clearTimeout(autoCollapseTimer);
    };
  }, [isExpanded]);

  const hasActiveFilters = searchQuery || Object.values(filters).some(Boolean) || showVacant || showArchived;

  return (
    <div className="relative">
      {/* Collapsed State - Round Search Button */}
      <button
        onClick={handleToggle}
        className={`
          w-12 h-12 rounded-full shadow-lg border-2 transition-all duration-500 relative z-20
          flex items-center justify-center
          ${isExpanded ? 'scale-0 opacity-0' : 'hover:scale-110 hover:shadow-xl'}
          ${hasActiveFilters ? 'border-orange-400/60 bg-orange-500/30' : 'border-white/30 bg-orange-600/20'}
        `}
        style={{
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)'
        }}
      >
        <Search size={20} className={hasActiveFilters ? 'text-orange-400' : 'text-white'} />
        {hasActiveFilters && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
        )}
      </button>

      {/* Expanded State - Floating Search Bar */}
      <div
        className={`
          absolute top-0 left-0 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/20 p-6 z-50
          transition-all duration-500 origin-left
          ${isExpanded 
            ? 'scale-100 opacity-100 w-96' 
            : 'scale-0 opacity-0 w-12 pointer-events-none'
          }
        `}
        style={{backdropFilter: 'blur(20px) saturate(180%)', background: 'linear-gradient(to right, #FFDAB9, #ADD8E6)'}}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Search size={18} className="text-gray-700" />
            Smart Search
          </h3>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 hover:bg-white/20 rounded-full"
          >
            <X size={16} className="text-gray-300" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search properties..."
            className="w-full px-4 py-3 backdrop-blur-lg bg-white/20 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500/50 text-gray-800 placeholder-gray-600"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="space-y-3 mb-4">
          <div className="flex gap-2">
            <button
              onClick={onToggleVacant}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                showVacant 
                  ? 'backdrop-blur-lg bg-orange-500/20 text-orange-300 border border-orange-400/40' 
                  : 'backdrop-blur-lg bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <EyeOff size={14} />
              Vacant Only
            </button>

            <button
              onClick={onToggleArchived}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                showArchived 
                  ? 'backdrop-blur-lg bg-white/20 text-gray-300 border border-white/30' 
                  : 'backdrop-blur-lg bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Archive size={14} />
              {showArchived ? 'Show Active' : 'Show Archived'}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="space-y-3">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 backdrop-blur-lg bg-white/10 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-orange-400 text-white text-sm"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Under Renovation">Under Renovation</option>
          </select>

          <select
            value={filters.units}
            onChange={(e) => handleFilterChange('units', e.target.value)}
            className="w-full px-3 py-2 backdrop-blur-lg bg-white/10 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-orange-400 text-white text-sm"
          >
            <option value="">All Unit Types</option>
            <option value="single">Single Unit</option>
            <option value="multiple">Multiple Units</option>
          </select>

          <select
            value={filters.rentRange}
            onChange={(e) => handleFilterChange('rentRange', e.target.value)}
            className="w-full px-3 py-2 backdrop-blur-lg bg-white/10 border-2 border-white/20 rounded-lg focus:ring-2 focus:ring-orange-400 text-white text-sm"
          >
            <option value="">All Rent Ranges</option>
            <option value="0-1000">$0 - $1,000</option>
            <option value="1000-2000">$1,000 - $2,000</option>
            <option value="2000+">$2,000+</option>
          </select>
        </div>

        {/* Clear All */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="w-full mt-4 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors backdrop-blur-lg"
          >
            Clear All Filters
          </button>
        )}

        {/* Auto-collapse indicator */}
        <div className="mt-3 text-xs text-gray-300 text-center">
          Auto-collapse in 8s if unused
        </div>
      </div>

      {/* Background Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/5 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default SmartCollapsibleSearch;