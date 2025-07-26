'use client';
import React from 'react';
import { Search, Filter, Calendar, DollarSign, Star, AlertTriangle, Users, Building2, X } from 'lucide-react';

interface FilterOption {
  key: string;
  label: string;
  value: any;
  count?: number;
  color?: string;
}

interface TenantSmartFiltersProps {
  tenants: any[];
  onFiltersChange: (filters: any) => void;
  activeFilters: any;
  className?: string;
}

const TenantSmartFilters: React.FC<TenantSmartFiltersProps> = ({
  tenants,
  onFiltersChange,
  activeFilters,
  className = ''
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // Generate dynamic filter options based on tenant data
  const filterCategories = React.useMemo(() => {
    const paymentStatuses = ['Current', 'Late', 'Partial', 'Overdue'];
    const leaseStatuses = ['Active', 'Expiring Soon', 'Expired', 'New'];
    const scoreRanges = ['Excellent (90-100)', 'Good (80-89)', 'Fair (70-79)', 'Poor (<70)'];
    const rentRanges = ['<$1000', '$1000-2000', '$2000-3000', '$3000+'];
    
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
      
      tenantScore: scoreRanges.map(range => ({
        key: 'tenantScore',
        label: range,
        value: range.split(' ')[0].toLowerCase(),
        count: getCount(t => {
          // Mock score calculation for filtering
          const score = t.status === 'Active' ? 85 : t.status === 'Late' ? 60 : 75;
          if (range.includes('90-100')) return score >= 90;
          if (range.includes('80-89')) return score >= 80 && score < 90;
          if (range.includes('70-79')) return score >= 70 && score < 80;
          return score < 70;
        }),
        color: range.includes('90-100') ? 'green' : range.includes('80-89') ? 'blue' : range.includes('70-79') ? 'yellow' : 'red'
      })),
      
      rentRange: rentRanges.map(range => ({
        key: 'rentRange',
        label: range,
        value: range,
        count: getCount(t => {
          const rent = t.rentAmount || 0;
          if (range === '<$1000') return rent < 1000;
          if (range === '$1000-2000') return rent >= 1000 && rent < 2000;
          if (range === '$2000-3000') return rent >= 2000 && rent < 3000;
          return rent >= 3000;
        }),
        color: 'purple'
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

  const renderFilterGroup = (title: string, icon: React.ReactNode, options: FilterOption[]) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.filter(opt => opt.count > 0).map((option) => {
          const isActive = activeFilters[option.key]?.includes(option.value);
          return (
            <button
              key={`${option.key}-${option.value}`}
              onClick={() => handleFilterToggle(option.key, option.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? `bg-${option.color}-500 text-white shadow-lg scale-105`
                  : `bg-${option.color}-50 text-${option.color}-700 hover:bg-${option.color}-100 border border-${option.color}-200`
              }`}
            >
              <span>{option.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-white/20' : `bg-${option.color}-200`
              }`}>
                {option.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Filter size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">Smart Filters</h3>
              <p className="text-sm text-gray-600">Filter tenants by behavior and status</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                <X size={14} />
                Clear All ({getActiveFilterCount()})
              </button>
            )}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 border border-gray-200 transition-colors"
            >
              {showAdvanced ? 'Simple' : 'Advanced'} Filters
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => handleFilterToggle('paymentStatus', 'late')}
            className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
              activeFilters.paymentStatus?.includes('late')
                ? 'bg-red-500 text-white shadow-lg scale-105'
                : 'bg-white text-red-600 hover:bg-red-50 border border-red-200'
            }`}
          >
            <AlertTriangle size={20} />
            <div className="text-left">
              <div className="font-medium">Late Payments</div>
              <div className="text-xs opacity-75">
                {filterCategories.paymentStatus.find(f => f.value === 'late')?.count || 0} tenants
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterToggle('leaseStatus', 'expiring_soon')}
            className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
              activeFilters.leaseStatus?.includes('expiring_soon')
                ? 'bg-yellow-500 text-white shadow-lg scale-105'
                : 'bg-white text-yellow-600 hover:bg-yellow-50 border border-yellow-200'
            }`}
          >
            <Calendar size={20} />
            <div className="text-left">
              <div className="font-medium">Expiring Soon</div>
              <div className="text-xs opacity-75">
                {filterCategories.leaseStatus.find(f => f.value === 'expiring_soon')?.count || 0} leases
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterToggle('tenantScore', 'excellent')}
            className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
              activeFilters.tenantScore?.includes('excellent')
                ? 'bg-green-500 text-white shadow-lg scale-105'
                : 'bg-white text-green-600 hover:bg-green-50 border border-green-200'
            }`}
          >
            <Star size={20} />
            <div className="text-left">
              <div className="font-medium">Top Tenants</div>
              <div className="text-xs opacity-75">
                {filterCategories.tenantScore.find(f => f.value === 'excellent')?.count || 0} excellent
              </div>
            </div>
          </button>

          <button
            onClick={() => handleFilterToggle('leaseStatus', 'new')}
            className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
              activeFilters.leaseStatus?.includes('new')
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
            }`}
          >
            <Users size={20} />
            <div className="text-left">
              <div className="font-medium">New Tenants</div>
              <div className="text-xs opacity-75">
                {filterCategories.leaseStatus.find(f => f.value === 'new')?.count || 0} recent
              </div>
            </div>
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 pt-6 border-t border-gray-200">
            {renderFilterGroup('Payment Status', <DollarSign size={16} className="text-green-600" />, filterCategories.paymentStatus)}
            {renderFilterGroup('Lease Status', <Calendar size={16} className="text-blue-600" />, filterCategories.leaseStatus)}
            {renderFilterGroup('Tenant Score', <Star size={16} className="text-yellow-600" />, filterCategories.tenantScore)}
            {renderFilterGroup('Rent Range', <DollarSign size={16} className="text-purple-600" />, filterCategories.rentRange)}
            {filterCategories.property.length > 0 && renderFilterGroup('Property', <Building2 size={16} className="text-gray-600" />, filterCategories.property)}
          </div>
        )}

        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {getActiveFilterCount()} applied
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(activeFilters).map(([category, values]) => 
                Array.isArray(values) ? values.map((value: any) => (
                  <span
                    key={`${category}-${value}`}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                  >
                    {value}
                    <button
                      onClick={() => handleFilterToggle(category, value)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
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

export default TenantSmartFilters;