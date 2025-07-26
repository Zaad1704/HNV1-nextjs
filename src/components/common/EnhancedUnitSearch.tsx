import React, { useState, useEffect, useRef } from 'react';
import { Search, Home, X, Building2 } from 'lucide-react';
import apiClient from '@/lib/api';

interface Unit {
  _id: string;
  unitNumber: string;
  nickname?: string;
  alternativeName?: string;
  displayName: string;
  status: string;
  tenantId?: any;
  propertyId: any;
}

interface EnhancedUnitSearchProps {
  onUnitSelect: (unit: Unit) => void;
  propertyId?: string;
  placeholder?: string;
  className?: string;
}

const EnhancedUnitSearch: React.FC<EnhancedUnitSearchProps> = ({
  onUnitSelect,
  propertyId,
  placeholder = "Search units by number or nickname...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      searchUnits();
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query, propertyId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchUnits = async () => {
    setIsLoading(true);
    try {
      const params: any = { query };
      if (propertyId) params.propertyId = propertyId;

      const { data } = await apiClient.get('/units/search', { params });
      setResults(data.data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to search units:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnitSelect = (unit: Unit) => {
    onUnitSelect(unit);
    setQuery('');
    setShowResults(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Available': 'bg-green-100 text-green-800',
      'Occupied': 'bg-blue-100 text-blue-800',
      'Maintenance': 'bg-orange-100 text-orange-800',
      'Reserved': 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          onFocus={() => query.length > 1 && setShowResults(true)}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showResults && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((unit) => (
                <button
                  key={unit._id}
                  onClick={() => handleUnitSelect(unit)}
                  className="w-full p-3 hover:bg-gray-50 rounded-lg text-left flex items-center gap-3 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {unit.unitNumber}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        Unit {unit.unitNumber}
                      </span>
                      {unit.nickname && (
                        <span className="text-sm text-gray-600">({unit.nickname})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Building2 size={14} />
                      <span>{unit.propertyId?.name || 'Unknown Property'}</span>
                      {unit.tenantId && (
                        <span>• {unit.tenantId.name}</span>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}>
                    {unit.status}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <Home size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No units found for "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedUnitSearch;