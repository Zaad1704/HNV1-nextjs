import React from 'react';
import { Search, Filter, Calendar, DollarSign, Star, AlertTriangle, Users, Building2, X } from 'lucide-react';

interface FilterOption {
  key: string;
  label: string;
  value: any;
  count?: number;
  color?: string;
}

interface CompactTenantSmartFiltersProps {
  tenants: any[];
  onFiltersChange: (filters: any) => void;
  activeFilters: any;
  className?: string;
  onClose?: () => void;
}

const CompactTenantSmartFilters: React.FC<CompactTenantSmartFiltersProps> = ({
  tenants,
  onFiltersChange,
  activeFilters,
  className = '',
  onClose
}) => {
  // Generate dynamic filter options based on tenant data
  const filterCategories = React.useMemo(() => {
    const paymentStatuses = ['Current', 'Late', 'Partial', 'Overdue'];
    const leaseStatuses = ['Active', 'Expiring Soon', 'Expired', 'New'];
    
    // Get unique properties
    const properties = [...new Set(tenants.map(t => t.propertyId?.name).filter(Boolean))];
    
    // Calculate counts for each filter
    const getCount = (filterFn: (tenant: any) => boolean) => 
      tenants.filter(filterFn).length;

    return {
      paymentStatus: paymentStatuses.map(status => ({
        key: 'paymentStatus',
        label: status,
        value: status.toLowerCase(),
        count: getCount(t => {
          if (status === 'Current') return t.status === 'Active';
          if (status === 'Late') return t.status === 'Late';
          if (status === 'Partial') return t.status === 'Partial';
          return t.status === 'Overdue';
        }),
        color: status === 'Current' ? 'green' : status === 'Late' ? 'red' : 'yellow'
      })),
      
      leaseStatus: leaseStatuses.map(status => ({
        key: 'leaseStatus',
        label: status,
        value: status.toLowerCase().replace(' ', '_'),
        count: getCount(t => {
          if (!t.leaseEndDate) return status === 'Active';
          const daysUntil = Math.ceil((new Date(t.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          if (status === 'Expiring Soon') return daysUntil <= 90 && daysUntil > 0;
          if (status === 'Expired') return daysUntil < 0;
          if (status === 'New') return t.leaseStartDate && (Date.now() - new Date(t.leaseStartDate).getTime()) < (90 * 24 * 60 * 60 * 1000);
          return daysUntil > 90;
        }),
        color: status === 'Active' ? 'green' : status === 'Expiring Soon' ? 'yellow' : status === 'Expired' ? 'red' : 'blue'
      })),
      
      property: properties.map(prop => ({
        key: 'property',
        label: prop,
        value: prop,
        count: getCount(t => t.propertyId?.name === prop),
        color: 'blue'
      }))
    };
  }, [tenants]);

  const handleFilterToggle = (category: string, value: any) => {
    const currentFilters = activeFilters[category] || [];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter((f: any) => f !== value)
      : [...currentFilters, value];
    
    onFiltersChange({
      ...activeFilters,
      [category]: newFilters.length > 0 ? newFilters : undefined
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((count: number, filters: any) => 
      count + (Array.isArray(filters) ? filters.length : filters ? 1 : 0), 0
    );
  };

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Filter size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Smart Filters</h3>
              <p className="text-xs text-gray-600">Filter tenants by status</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
              >
                <X size={12} />
                Clear ({getActiveFilterCount()})
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-gray-700 hover:bg-gray-300"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => handleFilterToggle('paymentStatus', 'late')}
            className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all ${
              activeFilters.paymentStatus?.includes('late')
                ? 'bg-red-500 text-white'
                : 'bg-white text-red-600 border border-red-200'
            }`}
          >
            <AlertTriangle size={14} />
            <div className="text-left">
              <div className="font-medium">Late</div>
              <div className="text-xs opacity-75">
                {filterCategories.paymentStatus.find(f => f.value === 'late')?.count || 0}
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterToggle('leaseStatus', 'expiring_soon')}
            className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all ${
              activeFilters.leaseStatus?.includes('expiring_soon')
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-yellow-600 border border-yellow-200'
            }`}
          >
            <Calendar size={14} />
            <div className="text-left">
              <div className="font-medium">Expiring</div>
              <div className="text-xs opacity-75">
                {filterCategories.leaseStatus.find(f => f.value === 'expiring_soon')?.count || 0}
              </div>
            </div>
          </button>
        </div>
        
        {/* Properties Filter */}
        {filterCategories.property.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-1">
              <Building2 size={14} className="text-blue-600" />
              <h4 className="font-semibold text-gray-900 text-xs">Properties</h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {filterCategories.property.filter(opt => opt.count > 0).map((option) => {
                const isActive = activeFilters[option.key]?.includes(option.value);
                return (
                  <button
                    key={`${option.key}-${option.value}`}
                    onClick={() => handleFilterToggle(option.key, option.value)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? `bg-blue-500 text-white`
                        : `bg-white text-blue-700 border border-blue-200`
                    }`}
                  >
                    <span>{option.label.substring(0, 10)}{option.label.length > 10 ? '...' : ''}</span>
                    <span className={`ml-1 px-1 rounded-full ${
                      isActive ? 'bg-white/20' : `bg-blue-100`
                    }`}>
                      {option.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs font-medium text-gray-700">Active:</span>
              <span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                {getActiveFilterCount()}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(activeFilters).map(([category, values]) => 
                Array.isArray(values) ? values.map((value: any) => (
                  <span
                    key={`${category}-${value}`}
                    className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs"
                  >
                    {value}
                    <button
                      onClick={() => handleFilterToggle(category, value)}
                      className="hover:bg-blue-200 rounded-full"
                    >
                      <X size={10} />
                    </button>
                  </span>
                )) : null
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactTenantSmartFilters;