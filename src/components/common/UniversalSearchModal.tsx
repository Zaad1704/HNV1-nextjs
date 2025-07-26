import React, { useState, useEffect } from 'react';
import { Search, X, Filter, Calendar, Building2, Users, DollarSign } from 'lucide-react';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionName: string;
  onSearch: (query: string, filters: any) => void;
  data?: any[];
}

const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({
  isOpen,
  onClose,
  sectionName,
  onSearch,
  data = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchQuery.trim() && data.length > 0) {
      const filtered = data.filter((item: any) => {
        const searchFields = getSearchFields(item, sectionName);
        return searchFields.some(field => 
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setResults(filtered.slice(0, 10)); // Limit to 10 results
    } else {
      setResults([]);
    }
  }, [searchQuery, data, sectionName]);

  const getSearchFields = (item: any, section: string) => {
    switch (section) {
      case 'Property':
        return [item.name, item.address?.formattedAddress, item.type];
      case 'Tenant':
        return [item.name, item.email, item.phone, item.unit];
      case 'Payment':
        return [item.description, item.tenantId?.name, item.propertyId?.name];
      case 'Expense':
        return [item.description, item.category, item.propertyId?.name];
      case 'Maintenance':
        return [item.title, item.description, item.propertyId?.name];
      default:
        return [item.name, item.title, item.description];
    }
  };

  const handleSearch = () => {
    onSearch(searchQuery, filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Search size={24} className="text-blue-500" />
              Search {sectionName}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${sectionName.toLowerCase()}...`}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        <div className="p-6">
          {/* Quick Filters */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Filter size={16} />
              Quick Filters
            </h3>
            <div className="flex flex-wrap gap-2">
              {getQuickFilters(sectionName).map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    [filter.key]: !prev[filter.key]
                  }))}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters[filter.key]
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results */}
          {results.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Search Results ({results.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {results.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => {
                      setSearchQuery(getDisplayName(item, sectionName));
                    }}
                  >
                    <div className="font-medium text-gray-900">
                      {getDisplayName(item, sectionName)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getDisplaySubtitle(item, sectionName)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSearch}
              className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Search size={18} />
              Search
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const getQuickFilters = (sectionName: string) => {
  switch (sectionName) {
    case 'Property':
      return [
        { key: 'active', label: 'Active' },
        { key: 'vacant', label: 'Vacant' },
        { key: 'multiUnit', label: 'Multi-Unit' }
      ];
    case 'Tenant':
      return [
        { key: 'active', label: 'Active' },
        { key: 'late', label: 'Late Payment' },
        { key: 'expiring', label: 'Expiring Lease' }
      ];
    case 'Payment':
      return [
        { key: 'thisMonth', label: 'This Month' },
        { key: 'pending', label: 'Pending' },
        { key: 'completed', label: 'Completed' }
      ];
    default:
      return [
        { key: 'recent', label: 'Recent' },
        { key: 'active', label: 'Active' }
      ];
  }
};

const getDisplayName = (item: any, sectionName: string) => {
  switch (sectionName) {
    case 'Property':
      return item.name || 'Unnamed Property';
    case 'Tenant':
      return item.name || 'Unnamed Tenant';
    case 'Payment':
      return item.description || `Payment #${item._id?.substring(0, 8)}`;
    default:
      return item.name || item.title || item.description || 'Unnamed Item';
  }
};

const getDisplaySubtitle = (item: any, sectionName: string) => {
  switch (sectionName) {
    case 'Property':
      return item.address?.formattedAddress || 'No address';
    case 'Tenant':
      return `${item.email || 'No email'} • Unit ${item.unit || 'N/A'}`;
    case 'Payment':
      return `$${item.amount || 0} • ${item.tenantId?.name || 'Unknown'}`;
    default:
      return item.subtitle || '';
  }
};

export default UniversalSearchModal;