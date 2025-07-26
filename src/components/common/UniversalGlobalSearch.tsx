import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Building2, Users, CreditCard, DollarSign, Wrench, Bell } from 'lucide-react';
import apiClient from '@/lib/api';

interface SearchResult {
  id: string;
  type: 'property' | 'tenant' | 'payment' | 'expense' | 'maintenance' | 'reminder';
  title: string;
  subtitle: string;
  data: any;
}

interface UniversalGlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const UniversalGlobalSearch: React.FC<UniversalGlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScope, setSelectedScope] = useState<string>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length > 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [query, selectedScope]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/search/global', {
        params: { q: query, scope: selectedScope }
      });
      
      const formattedResults: SearchResult[] = [];
      
      // Properties
      if (selectedScope === 'all' || selectedScope === 'properties') {
        data.properties?.forEach((prop: any) => {
          formattedResults.push({
            id: prop._id,
            type: 'property',
            title: prop.name,
            subtitle: prop.address?.formattedAddress || 'No address',
            data: prop
          });
        });
      }
      
      // Tenants
      if (selectedScope === 'all' || selectedScope === 'tenants') {
        data.tenants?.forEach((tenant: any) => {
          formattedResults.push({
            id: tenant._id,
            type: 'tenant',
            title: tenant.name,
            subtitle: `${tenant.email} • Unit ${tenant.unit}`,
            data: tenant
          });
        });
      }
      
      // Payments
      if (selectedScope === 'all' || selectedScope === 'payments') {
        data.payments?.forEach((payment: any) => {
          formattedResults.push({
            id: payment._id,
            type: 'payment',
            title: `$${payment.amount} Payment`,
            subtitle: `${payment.tenantId?.name} • ${new Date(payment.paymentDate).toLocaleDateString()}`,
            data: payment
          });
        });
      }
      
      // Expenses
      if (selectedScope === 'all' || selectedScope === 'expenses') {
        data.expenses?.forEach((expense: any) => {
          formattedResults.push({
            id: expense._id,
            type: 'expense',
            title: expense.description,
            subtitle: `$${expense.amount} • ${expense.category}`,
            data: expense
          });
        });
      }
      
      // Maintenance
      if (selectedScope === 'all' || selectedScope === 'maintenance') {
        data.maintenance?.forEach((maint: any) => {
          formattedResults.push({
            id: maint._id,
            type: 'maintenance',
            title: maint.description,
            subtitle: `${maint.propertyId?.name} • ${maint.status}`,
            data: maint
          });
        });
      }
      
      setResults(formattedResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: string) => {
    const icons = {
      property: Building2,
      tenant: Users,
      payment: CreditCard,
      expense: DollarSign,
      maintenance: Wrench,
      reminder: Bell
    };
    const Icon = icons[type as keyof typeof icons] || Search;
    return <Icon size={20} />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      property: 'bg-blue-100 text-blue-800',
      tenant: 'bg-green-100 text-green-800',
      payment: 'bg-purple-100 text-purple-800',
      expense: 'bg-red-100 text-red-800',
      maintenance: 'bg-orange-100 text-orange-800',
      reminder: 'bg-yellow-100 text-yellow-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleResultClick = (result: SearchResult) => {
    const routes = {
      property: `/dashboard/properties/${result.id}`,
      tenant: `/dashboard/tenants/${result.id}`,
      payment: `/dashboard/payments/${result.id}`,
      expense: `/dashboard/expenses/${result.id}`,
      maintenance: `/dashboard/maintenance/${result.id}`,
      reminder: `/dashboard/reminders/${result.id}`
    };
    
    window.open(routes[result.type], '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across all sections..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
              <X size={20} />
            </button>
          </div>
          
          {/* Scope Filter */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {[
              { key: 'all', label: 'All' },
              { key: 'properties', label: 'Properties' },
              { key: 'tenants', label: 'Tenants' },
              { key: 'payments', label: 'Payments' },
              { key: 'expenses', label: 'Expenses' },
              { key: 'maintenance', label: 'Maintenance' }
            ].map((scope) => (
              <button
                key={scope.key}
                onClick={() => setSelectedScope(scope.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                  selectedScope === scope.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {scope.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full p-4 hover:bg-gray-50 rounded-xl text-left flex items-center gap-4 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeColor(result.type)}`}>
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{result.title}</h3>
                    <p className="text-sm text-gray-500">{result.subtitle}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                    {result.type}
                  </span>
                </button>
              ))}
            </div>
          ) : query.length > 2 ? (
            <div className="p-8 text-center">
              <Search size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Type at least 3 characters to search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniversalGlobalSearch;