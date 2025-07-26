import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '@/lib/api';

interface GlobalSearchProps {
  onResults?: (results: any) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onResults }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    status: '',
    type: ''
  });

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['globalSearch', query, filters],
    queryFn: async () => {
      if (!query.trim()) return null;
      const response = await apiClient.get('/integrations/search', {
        params: { query, filters: JSON.stringify(filters) }
      });
      return response.data.data;
    },
    enabled: query.length > 2
  });

  const { data: suggestions } = useQuery({
    queryKey: ['searchSuggestions', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = await apiClient.get('/integrations/search/suggestions', {
        params: { query, type: 'properties' }
      });
      return response.data.data;
    },
    enabled: query.length > 1
  });

  useEffect(() => {
    if (searchResults && onResults) {
      onResults(searchResults);
    }
  }, [searchResults, onResults]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('common.search_placeholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 rounded-xl border transition-colors ${
            showFilters 
              ? 'bg-blue-500 text-white border-blue-500' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {suggestions && suggestions.length > 0 && query.length > 1 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
          {suggestions.slice(0, 5).map((suggestion: string, index: number) => (
            <button
              key={index}
              onClick={() => setQuery(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-40">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Advanced Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Types</option>
                <option value="properties">Properties</option>
                <option value="tenants">Tenants</option>
                <option value="payments">Payments</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setFilters({ dateRange: { start: '', end: '' }, status: '', type: '' })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto z-30">
          {Object.entries(searchResults).map(([category, results]: [string, any]) => {
            if (!results.data || results.data.length === 0) return null;
            
            return (
              <div key={category} className="p-4 border-b border-gray-100 last:border-b-0">
                <h4 className="font-medium text-gray-900 mb-2 capitalize">{category}</h4>
                <div className="space-y-2">
                  {results.data.slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name || item.title || item.description}</p>
                        <p className="text-sm text-gray-500">
                          {category === 'properties' && item.address?.formattedAddress}
                          {category === 'tenants' && item.email}
                          {category === 'payments' && `$${item.amount} - ${item.status}`}
                          {category === 'maintenance' && item.priority}
                        </p>
                      </div>
                    </div>
                  ))}
                  {results.total > 3 && (
                    <p className="text-sm text-blue-600 font-medium">
                      +{results.total - 3} more {category}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;