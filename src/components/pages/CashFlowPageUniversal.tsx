'use client';
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Plus, Calendar, TrendingUp, TrendingDown, Download, Building2, Filter } from 'lucide-react';
import apiClient from '@/lib/api';
import LazyLoader from '@/components/common/LazyLoader';

// Import universal components
import UniversalSectionPage from '@/components/common/UniversalSectionPage';
import UniversalFloatingActionMenu from '@/components/common/UniversalFloatingActionMenu';
import UniversalRadialActionWheel from '@/components/common/UniversalRadialActionWheel';
import UniversalGlassyCard from '@/components/common/UniversalGlassyCard';
import UniversalSearchModal from '@/components/common/UniversalSearchModal';
import UniversalAnalyticsModal from '@/components/common/UniversalAnalyticsModal';

const fetchCashFlow = async () => {
  try {
    const { data } = await apiClient.get('/cashflow');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch cash flow data:', error);
    return [];
  }
};

const CashFlowPageUniversal = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const { data: cashFlowData = [], isLoading, error } = useQuery({
    queryKey: ['cashflow'],
    queryFn: fetchCashFlow
  });

  const handleItemSelect = (itemId: string, selected: boolean) => {
    if (selected) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  // Calculate stats
  const totalIncome = useMemo(() => {
    return cashFlowData.reduce((sum: number, item: any) => {
      return sum + (item.type === 'income' ? (item.amount || 0) : 0);
    }, 0);
  }, [cashFlowData]);

  const totalExpenses = useMemo(() => {
    return cashFlowData.reduce((sum: number, item: any) => {
      return sum + (item.type === 'expense' ? (item.amount || 0) : 0);
    }, 0);
  }, [cashFlowData]);

  const netCashFlow = totalIncome - totalExpenses;

  return (
    <>
    <UniversalSectionPage
      title="Cash Flow"
      subtitle={`Track your income and expenses (${cashFlowData.length} transactions)`}
      icon={DollarSign}
      stats={[
        { label: 'Income', value: `$${totalIncome.toLocaleString()}` },
        { label: 'Expenses', value: `$${totalExpenses.toLocaleString()}` },
        { label: 'Net', value: `$${netCashFlow.toLocaleString()}`, color: netCashFlow >= 0 ? 'green' : 'red' }
      ]}
      actionWheel={
        <UniversalRadialActionWheel
          actions={[
            { id: 'filter', icon: Filter, label: 'Filter', onClick: () => setShowFilters(true), angle: -60 },
            { id: 'export', icon: Download, label: 'Export Data', onClick: () => setShowExport(true), angle: 0 },
            { id: 'add', icon: Plus, label: 'Add Transaction', onClick: () => setShowAddModal(true), angle: 60 }
          ]}
        />
      }
      addButton={
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Add Transaction
        </button>
      }
      floatingActionMenu={
        <UniversalFloatingActionMenu
          sectionName="Cash Flow"
          onAddItem={() => setShowAddModal(true)}
          onBulkAction={() => setShowFilters(true)}
          onExport={() => setShowExport(true)}
          onSearch={() => setShowSearch(true)}
          onAnalytics={() => setShowAnalytics(true)}
          onFilter={() => setShowFilters(true)}
        />
      }
      aiInsightsData={{
        properties: cashFlowData.map((item: any) => item.propertyId).filter(Boolean),
        tenants: []
      }}
      smartSuggestionsData={{
        properties: cashFlowData.map((item: any) => item.propertyId).filter(Boolean),
        tenants: []
      }}
      isLoading={isLoading}
      error={error}
    >
      {cashFlowData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cashFlowData.map((item: any, index: number) => {
            const isIncome = item.type === 'income';
            return (
              <LazyLoader key={item._id}>
                <UniversalGlassyCard
                  item={item}
                  index={index}
                  icon={isIncome ? TrendingUp : TrendingDown}
                  title={item.description || `${isIncome ? 'Income' : 'Expense'} #${item._id.substring(0, 8)}`}
                  subtitle={`${item.category || 'Uncategorized'} - ${new Date(item.date).toLocaleDateString()}`}
                  status={isIncome ? 'Income' : 'Expense'}
                  stats={[
                    { 
                      label: 'Amount', 
                      value: `$${item.amount?.toLocaleString() || 0}`, 
                      icon: DollarSign,
                      color: isIncome ? 'text-green-300' : 'text-red-300'
                    },
                    { 
                      label: 'Date', 
                      value: new Date(item.date).toLocaleDateString(), 
                      icon: Calendar,
                      color: 'text-blue-300'
                    },
                    { 
                      label: 'Property', 
                      value: item.propertyName || 'General', 
                      icon: Building2,
                      color: 'text-purple-300'
                    }
                  ]}
                  badges={[
                    { 
                      label: isIncome ? 'Income' : 'Expense', 
                      value: `$${item.amount}`, 
                      color: isIncome ? 'bg-green-500' : 'bg-red-500' 
                    }
                  ]}
                  detailsPath={`/dashboard/cashflow-universal/${item._id}`}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  secondaryActions={[
                    { 
                      icon: Download, 
                      label: 'Export', 
                      onClick: () => {}, 
                      color: 'bg-gradient-to-r from-blue-400 to-blue-500'
                    }
                  ]}
                  showCheckbox={false}
                  isSelected={selectedItems.includes(item._id)}
                  onSelect={handleItemSelect}
                />
              </LazyLoader>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="rounded-2xl p-12 shadow-lg max-w-lg mx-auto border-2 border-white/20" 
               style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px)'}}>
            <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-white/20"
                 style={{background: 'rgba(249, 115, 22, 0.3)'}}>
              <DollarSign size={64} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-4">
              No Cash Flow Data
            </h3>
            <p className="text-gray-300 mb-10 text-lg">
              Start tracking your income and expenses to monitor your cash flow.
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium"
            >
              <Plus size={18} className="inline mr-2" />
              Add Transaction
            </button>
          </div>
        </div>
      )}
    </UniversalSectionPage>
    
    {/* Modals */}
    <UniversalSearchModal
      isOpen={showSearch}
      onClose={() => setShowSearch(false)}
      sectionName="Cash Flow"
      onSearch={(query, filters) => {
        console.log('Search cash flow:', query, filters);
        // Implement search logic here
      }}
      data={cashFlowData}
    />
    
    <UniversalAnalyticsModal
      isOpen={showAnalytics}
      onClose={() => setShowAnalytics(false)}
      sectionName="Cash Flow"
      data={cashFlowData}
    />
  </>
  );
};

export default CashFlowPageUniversal;