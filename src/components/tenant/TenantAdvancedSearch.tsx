'use client';
import React from 'react';
import { Search, Calendar, DollarSign, MapPin, User, Filter, X, ChevronDown } from 'lucide-react';

interface SearchCriteria {
  query: string;
  paymentStatus: string[];
  rentRange: { min: number; max: number };
  leaseExpiry: string;
  tenantScore: string;
  property: string;
  dateRange: { start: string; end: string };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface TenantAdvancedSearchProps {
  onSearch: (criteria: SearchCriteria) => void;
  tenants: any[];
  className?: string;
}

const TenantAdvancedSearch: React.FC<TenantAdvancedSearchProps> = ({
  onSearch,
  tenants,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [criteria, setCriteria] = React.useState<SearchCriteria>({
    query: '',
    paymentStatus: [],
    rentRange: { min: 0, max: 10000 },
    leaseExpiry: '',
    tenantScore: '',
    property: '',
    dateRange: { start: '', end: '' },
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Get unique properties for dropdown
  const properties = React.useMemo(() => 
    [...new Set(tenants.map(t => t.propertyId?.name).filter(Boolean))],
    [tenants]
  );

  // Get rent range from tenant data
  const rentStats = React.useMemo(() => {
    const rents = tenants.map(t => t.rentAmount || 0).filter(r => r > 0);
    return {
      min: Math.min(...rents, 0),
      max: Math.max(...rents, 10000)
    };
  }, [tenants]);

  const handleCriteriaChange = (key: keyof SearchCriteria, value: any) => {
    const newCriteria = { ...criteria, [key]: value };
    setCriteria(newCriteria);
    onSearch(newCriteria);
  };

  const handlePaymentStatusToggle = (status: string) => {
    const newStatuses = criteria.paymentStatus.includes(status)
      ? criteria.paymentStatus.filter(s => s !== status)
      : [...criteria.paymentStatus, status];
    handleCriteriaChange('paymentStatus', newStatuses);
  };

  const clearAllFilters = () => {
    const defaultCriteria: SearchCriteria = {
      query: '',
      paymentStatus: [],
      rentRange: { min: 0, max: 10000 },
      leaseExpiry: '',
      tenantScore: '',
      property: '',
      dateRange: { start: '', end: '' },
      sortBy: 'name',
      sortOrder: 'asc'
    };
    setCriteria(defaultCriteria);
    onSearch(defaultCriteria);
  };

  const hasActiveFilters = () => {
    return criteria.query || 
           criteria.paymentStatus.length > 0 ||
           criteria.rentRange.min > 0 ||
           criteria.rentRange.max < 10000 ||
           criteria.leaseExpiry ||
           criteria.tenantScore ||
           criteria.property ||
           criteria.dateRange.start ||
           criteria.dateRange.end;
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
      {/* Basic Search Bar */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={criteria.query}
              onChange={(e) => handleCriteriaChange('query', e.target.value)}
              placeholder="Search by name, email, phone, unit..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
              isExpanded || hasActiveFilters()
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            <Filter size={16} />
            <span>Filters</span>
            <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            {hasActiveFilters() && (
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                {[
                  criteria.paymentStatus.length,
                  criteria.leaseExpiry ? 1 : 0,
                  criteria.tenantScore ? 1 : 0,
                  criteria.property ? 1 : 0,
                  (criteria.rentRange.min > 0 || criteria.rentRange.max < 10000) ? 1 : 0
                ].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>
          
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl border border-red-200 hover:bg-red-100 transition-colors"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 space-y-6">
          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Status</label>
            <div className="flex flex-wrap gap-2">
              {['Current', 'Late', 'Partial', 'Overdue'].map(status => (
                <button
                  key={status}
                  onClick={() => handlePaymentStatusToggle(status.toLowerCase())}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    criteria.paymentStatus.includes(status.toLowerCase())
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Rent Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Rent Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={criteria.rentRange.min}
                    onChange={(e) => handleCriteriaChange('rentRange', {
                      ...criteria.rentRange,
                      min: parseInt(e.target.value) || 0
                    })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={criteria.rentRange.max}
                    onChange={(e) => handleCriteriaChange('rentRange', {
                      ...criteria.rentRange,
                      max: parseInt(e.target.value) || 10000
                    })}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10000"
                  />
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Range: ${rentStats.min.toLocaleString()} - ${rentStats.max.toLocaleString()}
            </div>
          </div>

          {/* Grid for other filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lease Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lease Expiry</label>
              <select
                value={criteria.leaseExpiry}
                onChange={(e) => handleCriteriaChange('leaseExpiry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Leases</option>
                <option value="expired">Expired</option>
                <option value="expiring_30">Expiring in 30 days</option>
                <option value="expiring_90">Expiring in 90 days</option>
                <option value="active">Active (&gt;90 days)</option>
              </select>
            </div>

            {/* Tenant Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tenant Score</label>
              <select
                value={criteria.tenantScore}
                onChange={(e) => handleCriteriaChange('tenantScore', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Scores</option>
                <option value="excellent">Excellent (90-100)</option>
                <option value="good">Good (80-89)</option>
                <option value="fair">Fair (70-79)</option>
                <option value="poor">Poor (&lt;70)</option>
              </select>
            </div>

            {/* Property */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property</label>
              <select
                value={criteria.property}
                onChange={(e) => handleCriteriaChange('property', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Properties</option>
                {properties.map(property => (
                  <option key={property} value={property}>{property}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Lease Start Date Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={criteria.dateRange.start}
                  onChange={(e) => handleCriteriaChange('dateRange', {
                    ...criteria.dateRange,
                    start: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={criteria.dateRange.end}
                  onChange={(e) => handleCriteriaChange('dateRange', {
                    ...criteria.dateRange,
                    end: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={criteria.sortBy}
                onChange={(e) => handleCriteriaChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="rentAmount">Rent Amount</option>
                <option value="leaseStartDate">Lease Start Date</option>
                <option value="leaseEndDate">Lease End Date</option>
                <option value="status">Status</option>
                <option value="score">Tenant Score</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={criteria.sortOrder}
                onChange={(e) => handleCriteriaChange('sortOrder', e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantAdvancedSearch;