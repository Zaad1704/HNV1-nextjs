import React from 'react';
import { Clock, Search, X, TrendingUp } from 'lucide-react';

interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  resultCount: number;
  filters?: any;
}

interface TenantSearchHistoryProps {
  onSearchSelect: (query: string, filters?: any) => void;
  className?: string;
}

const TenantSearchHistory: React.FC<TenantSearchHistoryProps> = ({
  onSearchSelect,
  className = ''
}) => {
  const [searchHistory, setSearchHistory] = React.useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = React.useState(false);

  // Load search history from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('tenantSearchHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setSearchHistory(parsed);
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = (history: SearchHistoryItem[]) => {
    localStorage.setItem('tenantSearchHistory', JSON.stringify(history));
    setSearchHistory(history);
  };

  // Add new search to history
  const addToHistory = React.useCallback((query: string, resultCount: number, filters?: any) => {
    if (!query.trim()) return;

    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: new Date(),
      resultCount,
      filters
    };

    setSearchHistory(prev => {
      // Remove duplicate queries
      const filtered = prev.filter(item => item.query !== newItem.query);
      // Add new item at the beginning and limit to 10 items
      const updated = [newItem, ...filtered].slice(0, 10);
      saveSearchHistory(updated);
      return updated;
    });
  }, []);

  // Remove item from history
  const removeFromHistory = (index: number) => {
    const updated = searchHistory.filter((_, i) => i !== index);
    saveSearchHistory(updated);
  };

  // Clear all history
  const clearHistory = () => {
    saveSearchHistory([]);
  };

  // Get popular searches (most frequent)
  const getPopularSearches = () => {
    const queryCount = searchHistory.reduce((acc, item) => {
      acc[item.query] = (acc[item.query] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(queryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([query, count]) => ({ query, count }));
  };

  // Expose addToHistory function to parent components
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    addToHistory
  }));

  if (!showHistory && searchHistory.length === 0) {
    return null;
  }

  const popularSearches = getPopularSearches();

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            <h3 className="font-medium text-gray-900">Search History</h3>
          </div>
          <div className="flex items-center gap-2">
            {searchHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-50"
            >
              {showHistory ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
      </div>

      {showHistory && (
        <div className="p-4 space-y-4">
          {/* Recent Searches */}
          {searchHistory.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h4>
              <div className="space-y-1">
                {searchHistory.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group"
                  >
                    <button
                      onClick={() => onSearchSelect(item.query, item.filters)}
                      className="flex-1 flex items-center gap-3 text-left"
                    >
                      <Search size={14} className="text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 truncate">{item.query}</div>
                        <div className="text-xs text-gray-500">
                          {item.resultCount} results • {item.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => removeFromHistory(index)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {popularSearches.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <TrendingUp size={14} />
                Popular Searches
              </h4>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map(({ query, count }) => (
                  <button
                    key={query}
                    onClick={() => onSearchSelect(query)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    <span>{query}</span>
                    <span className="bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full text-xs">
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Tips */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Search Tips</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Search by tenant name, email, or phone number</div>
              <div>• Use unit numbers to find specific tenants</div>
              <div>• Search property names to filter by location</div>
              <div>• Use $ symbol to search by rent amount</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantSearchHistory;