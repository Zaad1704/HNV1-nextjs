'use client';
import React from 'react';
import { Search, Clock, User, DollarSign, Calendar, MapPin, Phone, Mail, Star } from 'lucide-react';

interface SearchResult {
  tenant: any;
  matchType: 'name' | 'email' | 'phone' | 'unit' | 'property' | 'payment' | 'lease';
  matchText: string;
  score: number;
}

interface TenantPredictiveSearchProps {
  tenants: any[];
  onTenantSelect: (tenant: any) => void;
  className?: string;
}

const TenantPredictiveSearch: React.FC<TenantPredictiveSearchProps> = ({
  tenants,
  onTenantSelect,
  className = ''
}) => {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);

  // Advanced search algorithm
  const searchTenants = React.useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    tenants.forEach(tenant => {
      const matches: { type: SearchResult['matchType'], text: string, score: number }[] = [];

      // Name search (highest priority)
      if (tenant.name?.toLowerCase().includes(query)) {
        const exactMatch = tenant.name.toLowerCase() === query;
        const startsWithMatch = tenant.name.toLowerCase().startsWith(query);
        matches.push({
          type: 'name',
          text: tenant.name,
          score: exactMatch ? 100 : startsWithMatch ? 90 : 70
        });
      }

      // Email search
      if (tenant.email?.toLowerCase().includes(query)) {
        matches.push({
          type: 'email',
          text: tenant.email,
          score: tenant.email.toLowerCase().startsWith(query) ? 85 : 60
        });
      }

      // Phone search
      if (tenant.phone?.replace(/\D/g, '').includes(query.replace(/\D/g, ''))) {
        matches.push({
          type: 'phone',
          text: tenant.phone,
          score: 75
        });
      }

      // Unit search
      if (tenant.unit?.toLowerCase().includes(query)) {
        matches.push({
          type: 'unit',
          text: `Unit ${tenant.unit}`,
          score: 80
        });
      }

      // Property search
      if (tenant.propertyId?.name?.toLowerCase().includes(query)) {
        matches.push({
          type: 'property',
          text: tenant.propertyId.name,
          score: 65
        });
      }

      // Payment amount search
      if (tenant.rentAmount && query.includes('$')) {
        const amount = query.replace(/\D/g, '');
        if (amount && tenant.rentAmount.toString().includes(amount)) {
          matches.push({
            type: 'payment',
            text: `$${tenant.rentAmount}`,
            score: 70
          });
        }
      }

      // Status search
      if (tenant.status?.toLowerCase().includes(query)) {
        matches.push({
          type: 'lease',
          text: tenant.status,
          score: 60
        });
      }

      // Add best match for this tenant
      if (matches.length > 0) {
        const bestMatch = matches.reduce((best, current) => 
          current.score > best.score ? current : best
        );
        
        searchResults.push({
          tenant,
          matchType: bestMatch.type,
          matchText: bestMatch.text,
          score: bestMatch.score
        });
      }
    });

    // Sort by score and limit results
    const sortedResults = searchResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    setResults(sortedResults);
  }, [tenants]);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchTenants(query);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [query, searchTenants]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleTenantSelect(results[selectedIndex].tenant);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  const handleTenantSelect = (tenant: any) => {
    onTenantSelect(tenant);
    setIsOpen(false);
    setQuery('');
    
    // Add to recent searches
    const searchTerm = tenant.name;
    setRecentSearches(prev => {
      const filtered = prev.filter(term => term !== searchTerm);
      return [searchTerm, ...filtered].slice(0, 5);
    });
  };

  const getMatchIcon = (matchType: SearchResult['matchType']) => {
    switch (matchType) {
      case 'name': return <User size={16} className="text-blue-500" />;
      case 'email': return <Mail size={16} className="text-green-500" />;
      case 'phone': return <Phone size={16} className="text-purple-500" />;
      case 'unit': return <MapPin size={16} className="text-orange-500" />;
      case 'property': return <MapPin size={16} className="text-gray-500" />;
      case 'payment': return <DollarSign size={16} className="text-green-600" />;
      case 'lease': return <Calendar size={16} className="text-blue-600" />;
      default: return <Search size={16} className="text-gray-400" />;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Search tenants by name, email, phone, unit..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <span className="text-gray-400 hover:text-gray-600">×</span>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query || recentSearches.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-2">
              <div className="text-xs text-gray-500 px-3 py-2 font-medium">
                Search Results ({results.length})
              </div>
              {results.map((result, index) => (
                <button
                  key={`${result.tenant._id}-${result.matchType}`}
                  onClick={() => handleTenantSelect(result.tenant)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 transition-colors ${
                    index === selectedIndex ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getMatchIcon(result.matchType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-gray-900 truncate">
                        {highlightMatch(result.tenant.name, query)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-500" />
                        <span className="text-xs text-gray-500">{result.score}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 truncate">
                      {result.matchType === 'name' && result.tenant.email}
                      {result.matchType === 'email' && highlightMatch(result.matchText, query)}
                      {result.matchType === 'phone' && result.matchText}
                      {result.matchType === 'unit' && `${result.matchText} • ${result.tenant.propertyId?.name}`}
                      {result.matchType === 'property' && highlightMatch(result.matchText, query)}
                      {result.matchType === 'payment' && `Monthly rent: ${result.matchText}`}
                      {result.matchType === 'lease' && `Status: ${result.matchText}`}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>Unit {result.tenant.unit}</span>
                      <span>${result.tenant.rentAmount}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        result.tenant.status === 'Active' ? 'bg-green-100 text-green-800' :
                        result.tenant.status === 'Late' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {result.tenant.status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-6 text-center text-gray-500">
              <Search size={32} className="mx-auto mb-2 text-gray-300" />
              <p>No tenants found for "{query}"</p>
              <p className="text-sm mt-1">Try searching by name, email, phone, or unit number</p>
            </div>
          ) : recentSearches.length > 0 ? (
            <div className="p-2">
              <div className="text-xs text-gray-500 px-3 py-2 font-medium flex items-center gap-2">
                <Clock size={12} />
                Recent Searches
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(search)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 transition-colors"
                >
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-gray-700">{search}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default TenantPredictiveSearch;