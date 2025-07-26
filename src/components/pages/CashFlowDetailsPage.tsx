'use client';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, DollarSign, ArrowUp, ArrowDown, Calendar, Building, Download, Edit } from 'lucide-react';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalActionButton from '@/components/common/UniversalActionButton';
import { useCurrency } from '@/contexts/CurrencyContext';

const CashFlowDetailsPage = () => {
  const { month, year } = useParams<{ month: string; year: string }>();
  const { currency } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: cashFlowDetails, isLoading } = useQuery({
    queryKey: ['cashFlowDetails', month, year],
    queryFn: async () => {
      const { data } = await apiClient.get(`/dashboard/cashflow/${year}/${month}`);
      return data.data;
    },
    enabled: !!month && !!year
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading cash flow details...</span>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'income', label: 'Income Breakdown', icon: ArrowUp },
    { id: 'expenses', label: 'Expense Breakdown', icon: ArrowDown },
    { id: 'properties', label: 'By Property', icon: Building }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cashflow" className="p-2 rounded-xl hover:bg-app-bg transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Cash Flow Details</h1>
            <p className="text-text-secondary">{month} {year}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <UniversalActionButton variant="success" size="sm" icon={Download}>
            Export Report
          </UniversalActionButton>
          <UniversalActionButton variant="primary" icon={Edit}>
            Add Entry
          </UniversalActionButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="universal-grid universal-grid-3">
        <UniversalCard gradient="green">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ArrowUp size={24} className="text-white" />
            </div>
            <span className="text-green-500 text-sm font-semibold bg-green-100 px-3 py-1 rounded-full">Income</span>
          </div>
          <h3 className="text-3xl font-bold text-green-600">
            {currency}{cashFlowDetails?.income?.toLocaleString() || '0'}
          </h3>
          <p className="text-text-secondary text-sm mt-2">Total income for {month}</p>
        </UniversalCard>

        <UniversalCard gradient="red">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ArrowDown size={24} className="text-white" />
            </div>
            <span className="text-red-500 text-sm font-semibold bg-red-100 px-3 py-1 rounded-full">Expenses</span>
          </div>
          <h3 className="text-3xl font-bold text-red-600">
            {currency}{cashFlowDetails?.expenses?.toLocaleString() || '0'}
          </h3>
          <p className="text-text-secondary text-sm mt-2">Total expenses for {month}</p>
        </UniversalCard>

        <UniversalCard gradient={cashFlowDetails?.netFlow >= 0 ? "green" : "red"}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
              cashFlowDetails?.netFlow >= 0 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                : 'bg-gradient-to-br from-red-500 to-rose-600'
            }`}>
              <TrendingUp size={24} className="text-white" />
            </div>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
              cashFlowDetails?.netFlow >= 0 
                ? 'text-green-500 bg-green-100' 
                : 'text-red-500 bg-red-100'
            }`}>
              Net Flow
            </span>
          </div>
          <h3 className={`text-3xl font-bold ${
            cashFlowDetails?.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {currency}{cashFlowDetails?.netFlow?.toLocaleString() || '0'}
          </h3>
          <p className="text-text-secondary text-sm mt-2">Net cash flow for {month}</p>
        </UniversalCard>
      </div>

      {/* Tabs */}
      <div className="border-b border-app-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <UniversalCard gradient="blue">
            <h3 className="text-lg font-bold mb-4">Monthly Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-app-bg rounded-xl">
                <span>Total Properties</span>
                <span className="font-bold">{cashFlowDetails?.propertyCount || 0}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-app-bg rounded-xl">
                <span>Active Tenants</span>
                <span className="font-bold">{cashFlowDetails?.tenantCount || 0}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-app-bg rounded-xl">
                <span>Payment Transactions</span>
                <span className="font-bold">{cashFlowDetails?.paymentCount || 0}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-app-bg rounded-xl">
                <span>Expense Transactions</span>
                <span className="font-bold">{cashFlowDetails?.expenseCount || 0}</span>
              </div>
            </div>
          </UniversalCard>
        )}

        {activeTab === 'income' && (
          <UniversalCard gradient="green">
            <h3 className="text-lg font-bold mb-4">Income Breakdown</h3>
            <div className="space-y-3">
              {cashFlowDetails?.incomeBreakdown?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-4 bg-app-bg rounded-xl">
                  <div>
                    <p className="font-medium">{item.source}</p>
                    <p className="text-sm text-text-secondary">{item.description}</p>
                  </div>
                  <p className="font-bold text-green-600">{currency}{item.amount}</p>
                </div>
              ))}
            </div>
          </UniversalCard>
        )}

        {activeTab === 'expenses' && (
          <UniversalCard gradient="red">
            <h3 className="text-lg font-bold mb-4">Expense Breakdown</h3>
            <div className="space-y-3">
              {cashFlowDetails?.expenseBreakdown?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-4 bg-app-bg rounded-xl">
                  <div>
                    <p className="font-medium">{item.category}</p>
                    <p className="text-sm text-text-secondary">{item.description}</p>
                  </div>
                  <p className="font-bold text-red-600">{currency}{item.amount}</p>
                </div>
              ))}
            </div>
          </UniversalCard>
        )}

        {activeTab === 'properties' && (
          <UniversalCard gradient="purple">
            <h3 className="text-lg font-bold mb-4">Cash Flow by Property</h3>
            <div className="space-y-3">
              {cashFlowDetails?.propertyBreakdown?.map((property: any, index: number) => (
                <div key={index} className="p-4 bg-app-bg rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{property.name}</h4>
                    <p className={`font-bold ${property.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {currency}{property.netFlow}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Income: </span>
                      <span className="text-green-600">{currency}{property.income}</span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Expenses: </span>
                      <span className="text-red-600">{currency}{property.expenses}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </UniversalCard>
        )}
      </div>
    </motion.div>
  );
};

export default CashFlowDetailsPage;