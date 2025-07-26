import React, { useState } from 'react';
import { Search, X, Filter, Calendar, DollarSign, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface PaymentCollapsibleSmartSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
  showPending: boolean;
  showFailed: boolean;
  showArchived: boolean;
  onTogglePending: () => void;
  onToggleFailed: () => void;
  onToggleArchived: () => void;
}

const PaymentCollapsibleSmartSearch: React.FC<PaymentCollapsibleSmartSearchProps> = ({
  isOpen,
  onClose,
  onSearch,
  onFilterChange,
  showPending,
  showFailed,
  showArchived,
  onTogglePending,
  onToggleFailed,
  onToggleArchived
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [amountRange, setAmountRange] = useState('all');

  const handleSearch = () => {
    onSearch(searchQuery);
    onFilterChange({
      dateRange,
      amountRange
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div 
        className="relative w-full max-w-2xl rounded-3xl border-2 border-white/40 p-6 space-y-6"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))',
          backdropFilter: 'blur(25px) saturate(200%)'
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Search size={20} className="text-blue-300" />
            Smart Payment Search
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={18} className="text-white" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search payments by tenant, property, or amount..."
              className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 pl-10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={18} className="absolute left-3 top-3.5 text-white/60" />
          </div>
          
          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 flex items-center gap-1">
                <Calendar size={14} className="text-blue-300" />
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full bg-white/10 border border-white/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
            
            {/* Amount Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 flex items-center gap-1">
                <DollarSign size={14} className="text-blue-300" />
                Amount Range
              </label>
              <select
                value={amountRange}
                onChange={(e) => setAmountRange(e.target.value)}
                className="w-full bg-white/10 border border-white/30 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Amounts</option>
                <option value="small">Small (less than $500)</option>
                <option value="medium">Medium ($500 - $2000)</option>
                <option value="large">Large (more than $2000)</option>
              </select>
            </div>
          </div>
          
          {/* Quick Filters */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-white/80 flex items-center gap-1">
              <Filter size={14} className="text-blue-300" />
              Quick Filters
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={onTogglePending}
                className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                  showPending 
                    ? 'bg-yellow-500/80 text-white' 
                    : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                }`}
              >
                <Clock size={14} />
                {showPending ? 'Hide Pending' : 'Pending Only'}
              </button>
              
              <button
                onClick={onToggleFailed}
                className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                  showFailed 
                    ? 'bg-red-500/80 text-white' 
                    : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                }`}
              >
                <AlertTriangle size={14} />
                {showFailed ? 'Hide Failed' : 'Failed Only'}
              </button>
              
              <button
                onClick={onToggleArchived}
                className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                  showArchived 
                    ? 'bg-gray-500/80 text-white' 
                    : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                }`}
              >
                <CheckCircle size={14} />
                {showArchived ? 'Hide Archived' : 'Show Archived'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSearch}
            className="px-4 py-2 rounded-xl bg-blue-500/80 text-white hover:bg-blue-600/80 transition-colors flex items-center gap-2"
          >
            <Search size={16} />
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCollapsibleSmartSearch;