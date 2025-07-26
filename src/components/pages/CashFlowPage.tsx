'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign, ArrowUp, ArrowDown, Plus, Download } from 'lucide-react';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { useBackgroundRefresh } from '@/hooks/useBackgroundRefresh';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalActionButton from '@/components/common/UniversalActionButton';
import { useCrossData } from '@/hooks/useCrossData';
import apiClient from '@/lib/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import AddCashFlowModal from '@/components/common/AddCashFlowModal';
import UniversalSearch, { SearchFilters } from '@/components/common/UniversalSearch';
import UniversalExport from '@/components/common/UniversalExport';
import MessageButtons from '@/components/common/MessageButtons';

const fetchCashFlow = async () => {
  try {
    const { data } = await apiClient.get('/dashboard/cashflow');
    return data.data || { income: 0, expenses: 0, netFlow: 0, monthlyData: [] };
  } catch (error) {
    console.error('Failed to fetch cash flow:', error);
    return { income: 0, expenses: 0, netFlow: 0, monthlyData: [] };
  }
};

const CashFlowPage = () => {
  const { currency } = useCurrency();
  const { stats } = useCrossData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const { data: cashFlow, isLoading } = useQuery({
    queryKey: ['cashFlow'],
    queryFn: fetchCashFlow,
    retry: 1
  });

  // Background refresh
  useBackgroundRefresh([['cashFlow']], 60000);

  if (isLoading) {
    return <SkeletonLoader type="card" count={3} />;
  }

  return (
    <div className="space-y-8">
      <UniversalHeader
        title="Cash Flow"
        subtitle="Track income, expenses, and financial performance"
        icon={TrendingUp}
        stats={[
          { label: 'Income', value: `$${stats?.totalIncome?.toLocaleString() || 0}`, color: 'green' },
          { label: 'Expenses', value: `$${stats?.totalExpenses?.toLocaleString() || 0}`, color: 'red' },
          { label: 'Net Flow', value: `$${((stats?.totalIncome || 0) - (stats?.totalExpenses || 0)).toLocaleString()}`, color: (stats?.totalIncome || 0) >= (stats?.totalExpenses || 0) ? 'green' : 'red' }
        ]}
        actions={
          <>
            <UniversalActionButton variant="success" size="sm" icon={Download} onClick={() => setShowExport(true)}>Export</UniversalActionButton>
            <UniversalActionButton variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>Add Record</UniversalActionButton>
          </>
        }
      />

      {/* Summary Cards */}
      <div className="universal-grid universal-grid-3">
        <UniversalCard gradient="green">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <ArrowUp size={24} className="text-white" />
            </div>
            <span className="text-green-500 text-sm font-semibold bg-green-100 px-3 py-1 rounded-full">Income</span>
          </div>
          <h3 className="text-3xl font-bold text-text-primary group-hover:text-green-600 transition-colors">
            {currency}{cashFlow?.income?.toLocaleString() || '0'}
          </h3>
          <p className="text-text-secondary text-sm mt-2">Total income this month</p>
        </UniversalCard>

        <div className="group app-surface rounded-3xl p-6 border border-app-border hover:shadow-2xl hover:shadow-red-500/10 hover:border-red-500/30 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-rose-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <ArrowDown size={24} className="text-white" />
              </div>
              <span className="text-red-500 text-sm font-semibold bg-red-100 px-3 py-1 rounded-full">Expenses</span>
            </div>
            <h3 className="text-3xl font-bold text-text-primary group-hover:text-red-600 transition-colors">
              {currency}{cashFlow?.expenses?.toLocaleString() || '0'}
            </h3>
            <p className="text-text-secondary text-sm mt-2">Total expenses this month</p>
          </div>
        </div>

        <div className={`group app-surface rounded-3xl p-6 border border-app-border hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden ${
          (cashFlow?.netFlow || 0) >= 0 
            ? 'hover:shadow-green-500/10 hover:border-green-500/30' 
            : 'hover:shadow-red-500/10 hover:border-red-500/30'
        }`}>
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ${
            (cashFlow?.netFlow || 0) >= 0 
              ? 'bg-gradient-to-br from-green-500/5 to-emerald-500/5' 
              : 'bg-gradient-to-br from-red-500/5 to-rose-500/5'
          }`}></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ${
                (cashFlow?.netFlow || 0) >= 0 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-br from-red-500 to-rose-600'
              }`}>
                <TrendingUp size={24} className="text-white" />
              </div>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                (cashFlow?.netFlow || 0) >= 0 
                  ? 'text-green-500 bg-green-100' 
                  : 'text-red-500 bg-red-100'
              }`}>
                Net Flow
              </span>
            </div>
            <h3 className={`text-3xl font-bold transition-colors ${
              (cashFlow?.netFlow || 0) >= 0 
                ? 'text-green-500 group-hover:text-green-600' 
                : 'text-red-500 group-hover:text-red-600'
            }`}>
              {currency}{cashFlow?.netFlow?.toLocaleString() || '0'}
            </h3>
            <p className="text-text-secondary text-sm mt-2">Net cash flow this month</p>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="app-surface rounded-3xl p-8 border border-app-border">
        <h2 className="text-xl font-bold text-text-primary mb-6">Monthly Breakdown</h2>
        {cashFlow?.monthlyData?.length > 0 ? (
          <div className="space-y-4">
            {cashFlow.monthlyData.map((month: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-app-bg rounded-xl">
                <div>
                  <p className="font-medium text-text-primary">{month.month}</p>
                  <p className="text-sm text-text-secondary">Net: {currency}{month.net?.toLocaleString() || '0'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-green-500">+{currency}{month.income?.toLocaleString() || '0'}</p>
                    <p className="text-sm text-red-500">-{currency}{month.expenses?.toLocaleString() || '0'}</p>
                  </div>
                  <MessageButtons
                    email="finance@company.com"
                    name="Finance Team"
                    customMessage={`Cash flow report for ${month.month}: Net ${currency}${month.net?.toLocaleString() || '0'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-secondary">No cash flow data available yet.</p>
            <p className="text-text-secondary text-sm mt-1">Data will appear as you record payments and expenses.</p>
          </div>
        )}
      </div>
      
      <UniversalSearch
        onSearch={setSearchFilters}
        placeholder="Search cash flow records..."
        showStatusFilter={false}
      />
      
      <AddCashFlowModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      
      <UniversalExport
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={cashFlow?.monthlyData || []}
        filename="cashflow"
        filters={searchFilters}
        title="Export Cash Flow"
      />
    </div>
  );
};

export default CashFlowPage;