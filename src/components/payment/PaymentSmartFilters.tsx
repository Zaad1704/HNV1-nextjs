import React from 'react';
import { DollarSign, Calendar, CreditCard, User, TrendingUp, AlertTriangle } from 'lucide-react';

interface PaymentSmartFiltersProps {
  payments: any[];
  onFilterChange: (filters: any) => void;
  activeFilters: any;
}

const PaymentSmartFilters: React.FC<PaymentSmartFiltersProps> = ({ payments, onFilterChange, activeFilters }) => {
  const getPaymentStats = () => {
    const total = payments.length;
    const completed = payments.filter(p => p.status === 'Completed' || p.status === 'Paid').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const failed = payments.filter(p => p.status === 'failed').length;
    const thisMonth = payments.filter(p => {
      const paymentDate = new Date(p.paymentDate || p.createdAt);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
    }).length;
    
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const avgAmount = total > 0 ? totalAmount / total : 0;
    
    return { total, completed, pending, failed, thisMonth, totalAmount, avgAmount };
  };

  const stats = getPaymentStats();

  const filterOptions = [
    {
      key: 'thisMonth',
      label: 'This Month',
      count: stats.thisMonth,
      icon: Calendar,
      color: 'blue',
      active: activeFilters.dateFilter === 'thisMonth'
    },
    {
      key: 'highValue',
      label: 'High Value',
      count: payments.filter(p => (p.amount || 0) > stats.avgAmount * 1.5).length,
      icon: TrendingUp,
      color: 'green',
      active: activeFilters.amountFilter === 'high'
    },
    {
      key: 'pending',
      label: 'Pending',
      count: stats.pending,
      icon: AlertTriangle,
      color: 'yellow',
      active: activeFilters.statusFilter === 'pending'
    },
    {
      key: 'failed',
      label: 'Failed',
      count: stats.failed,
      icon: AlertTriangle,
      color: 'red',
      active: activeFilters.statusFilter === 'failed'
    }
  ];

  const handleFilterClick = (filterKey: string) => {
    let newFilters = { ...activeFilters };
    
    switch (filterKey) {
      case 'thisMonth':
        newFilters.dateFilter = newFilters.dateFilter === 'thisMonth' ? '' : 'thisMonth';
        break;
      case 'highValue':
        newFilters.amountFilter = newFilters.amountFilter === 'high' ? '' : 'high';
        break;
      case 'pending':
        newFilters.statusFilter = newFilters.statusFilter === 'pending' ? '' : 'pending';
        break;
      case 'failed':
        newFilters.statusFilter = newFilters.statusFilter === 'failed' ? '' : 'failed';
        break;
    }
    
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {filterOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.key}
              onClick={() => handleFilterClick(option.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                option.active
                  ? option.color === 'blue' ? 'bg-blue-500 text-white' :
                    option.color === 'green' ? 'bg-green-500 text-white' :
                    option.color === 'yellow' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  : option.color === 'blue' ? 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50' :
                    option.color === 'green' ? 'bg-white text-green-600 border border-green-200 hover:bg-green-50' :
                    option.color === 'yellow' ? 'bg-white text-yellow-600 border border-yellow-200 hover:bg-yellow-50' :
                    'bg-white text-red-600 border border-red-200 hover:bg-red-50'
              }`}
            >
              <Icon size={14} />
              <span>{option.label}</span>
              <span className={`ml-auto px-1.5 py-0.5 rounded-full text-xs ${
                option.active ? 'bg-white/20' : 
                option.color === 'blue' ? 'bg-blue-100' :
                option.color === 'green' ? 'bg-green-100' :
                option.color === 'yellow' ? 'bg-yellow-100' :
                'bg-red-100'
              }`}>
                {option.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Quick Stats</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total:</span>
            <span className="font-medium">{stats.total}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Completed:</span>
            <span className="font-medium text-green-600">{stats.completed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">${stats.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Average:</span>
            <span className="font-medium">${Math.round(stats.avgAmount).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSmartFilters;