import React, { useState } from 'react';
import { Search, Calendar, DollarSign, User, Building2, CreditCard } from 'lucide-react';

interface PaymentAdvancedSearchProps {
  onSearch: (criteria: any) => void;
  payments: any[];
}

const PaymentAdvancedSearch: React.FC<PaymentAdvancedSearchProps> = ({ onSearch, payments }) => {
  const [criteria, setCriteria] = useState({
    query: '',
    amountRange: { min: '', max: '' },
    dateRange: { start: '', end: '' },
    paymentMethod: '',
    status: '',
    tenantName: '',
    propertyName: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const handleSearch = () => {
    onSearch(criteria);
  };

  const handleReset = () => {
    const resetCriteria = {
      query: '',
      amountRange: { min: '', max: '' },
      dateRange: { start: '', end: '' },
      paymentMethod: '',
      status: '',
      tenantName: '',
      propertyName: '',
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setCriteria(resetCriteria);
    onSearch(resetCriteria);
  };

  const paymentMethods = [...new Set(payments.map(p => p.paymentMethod).filter(Boolean))];
  const statuses = [...new Set(payments.map(p => p.status).filter(Boolean))];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Search size={20} className="text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Advanced Payment Search</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            value={criteria.query}
            onChange={(e) => setCriteria({ ...criteria, query: e.target.value })}
            placeholder="Search payments..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={criteria.amountRange.min}
              onChange={(e) => setCriteria({ ...criteria, amountRange: { ...criteria.amountRange, min: e.target.value } })}
              placeholder="Min"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="number"
              value={criteria.amountRange.max}
              onChange={(e) => setCriteria({ ...criteria, amountRange: { ...criteria.amountRange, max: e.target.value } })}
              placeholder="Max"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={criteria.dateRange.start}
              onChange={(e) => setCriteria({ ...criteria, dateRange: { ...criteria.dateRange, start: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="date"
              value={criteria.dateRange.end}
              onChange={(e) => setCriteria({ ...criteria, dateRange: { ...criteria.dateRange, end: e.target.value } })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <select
            value={criteria.paymentMethod}
            onChange={(e) => setCriteria({ ...criteria, paymentMethod: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Methods</option>
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={criteria.status}
            onChange={(e) => setCriteria({ ...criteria, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <div className="flex gap-2">
            <select
              value={criteria.sortBy}
              onChange={(e) => setCriteria({ ...criteria, sortBy: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="tenant">Tenant</option>
              <option value="status">Status</option>
            </select>
            <select
              value={criteria.sortOrder}
              onChange={(e) => setCriteria({ ...criteria, sortOrder: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Search
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PaymentAdvancedSearch;