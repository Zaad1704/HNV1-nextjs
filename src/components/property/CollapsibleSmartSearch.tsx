import React, { useState } from 'react';
import { Search, Filter, X, BarChart3 } from 'lucide-react';

interface CollapsibleSmartSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
  showVacant: boolean;
  showArchived: boolean;
  onToggleVacant: () => void;
  onToggleArchived: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const CollapsibleSmartSearch: React.FC<CollapsibleSmartSearchProps> = ({
  onSearch,
  onFilterChange,
  showVacant,
  showArchived,
  onToggleVacant,
  onToggleArchived,
  isOpen,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-2xl rounded-3xl border-2 border-white/40 shadow-2xl backdrop-blur-xl p-6 space-y-6"
        style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)'}}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl border-2 border-white/40 flex items-center justify-center">
              <Search size={24} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white drop-shadow-lg">Smart Search</h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl border-2 border-white/40 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70" />
          <input
            type="text"
            placeholder="Search properties by name, address, or details..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-4 bg-white/30 backdrop-blur-xl border-2 border-white/40 rounded-2xl text-white placeholder-white/80 font-bold focus:outline-none focus:border-white/80 focus:bg-white/40 transition-all duration-300"
            style={{
              fontSize: '16px',
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}
            autoFocus
          />
        </div>

        {/* Filter Toggle */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl backdrop-blur-xl border-2 border-white/40 transition-all duration-300 hover:scale-105 ${
              showFilters ? 'bg-white/30 shadow-xl' : 'bg-white/20'
            }`}
          >
            <Filter size={20} className="text-white" />
            <span className="text-white font-bold">Filters</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-4">
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
    </div>
  );
};

export default CollapsibleSmartSearch;