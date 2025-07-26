import React, { useState, useMemo } from 'react';
import { Search, DollarSign, Calendar, User, TrendingUp } from 'lucide-react';

interface PaymentPredictiveSearchProps {
  payments: any[];
  onPaymentSelect: (payment: any) => void;
}

const PaymentPredictiveSearch: React.FC<PaymentPredictiveSearchProps> = ({ payments, onPaymentSelect }) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const searchResults = useMemo(() => {
    if (!query || query.length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    return payments
      .filter(payment => 
        payment.tenantId?.name?.toLowerCase().includes(lowerQuery) ||
        payment.propertyId?.name?.toLowerCase().includes(lowerQuery) ||
        payment.amount?.toString().includes(query) ||
        payment.paymentMethod?.toLowerCase().includes(lowerQuery) ||
        payment.description?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 8);
  }, [query, payments]);

  const handleSelect = (payment: any) => {
    onPaymentSelect(payment);
    setQuery('');
    setShowResults(false);
  };

  const getPaymentPreview = (payment: any) => {
    const amount = payment.amount || 0;
    const tenant = payment.tenantId?.name || 'Unknown Tenant';
    const date = payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'No date';
    const method = payment.paymentMethod || 'Unknown method';
    
    return { amount, tenant, date, method };
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Search payments by tenant, amount, or method..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp size={16} />
              <span>{searchResults.length} payment{searchResults.length !== 1 ? 's' : ''} found</span>
            </div>
          </div>
          
          <div className="py-2">
            {searchResults.map((payment) => {
              const preview = getPaymentPreview(payment);
              return (
                <button
                  key={payment._id}
                  onClick={() => handleSelect(payment)}
                  className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <DollarSign size={14} className="text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">${preview.amount.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{preview.tenant}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 ml-11">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{preview.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={12} />
                          <span>{preview.method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'Completed' || payment.status === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showResults && query.length >= 2 && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
          <div className="text-center text-gray-500">
            <Search size={24} className="mx-auto mb-2 opacity-50" />
            <p>No payments found for "{query}"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPredictiveSearch;