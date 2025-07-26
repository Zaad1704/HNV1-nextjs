'use client';
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Receipt, Plus, Building2, Download, DollarSign, Calendar, Tag } from 'lucide-react';
import apiClient from '@/lib/api';
import LazyLoader from '@/components/common/LazyLoader';

// Import universal components
import UniversalSectionPage from '@/components/common/UniversalSectionPage';
import UniversalFloatingActionMenu from '@/components/common/UniversalFloatingActionMenu';
import UniversalRadialActionWheel from '@/components/common/UniversalRadialActionWheel';
import UniversalGlassyCard from '@/components/common/UniversalGlassyCard';
import UniversalSearchModal from '@/components/common/UniversalSearchModal';
import UniversalAnalyticsModal from '@/components/common/UniversalAnalyticsModal';

const fetchExpenses = async () => {
  try {
    const { data } = await apiClient.get('/expenses');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return [];
  }
};

const ExpensesPageUniversal = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  
  const { data: expenses = [], isLoading, error } = useQuery({
    queryKey: ['expenses'],
    queryFn: fetchExpenses
  });

  const handleExpenseSelect = (expenseId: string, selected: boolean) => {
    if (selected) {
      setSelectedExpenses(prev => [...prev, expenseId]);
    } else {
      setSelectedExpenses(prev => prev.filter(id => id !== expenseId));
    }
  };

  // Calculate stats
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  const thisMonthExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
    });
  }, [expenses]);

  const thisMonthTotal = useMemo(() => {
    return thisMonthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [thisMonthExpenses]);

  return (
    <>
    <UniversalSectionPage
      title="Expenses"
      subtitle={`Track and manage property expenses (${expenses.length} expenses)`}
      icon={Receipt}
      stats={[
        { label: 'Total', value: expenses.length },
        { label: 'This Month', value: thisMonthExpenses.length },
        { label: 'Amount', value: `$${totalAmount.toLocaleString()}` }
      ]}
      actionWheel={
        <UniversalRadialActionWheel
          actions={[
            { id: 'bulk', icon: Building2, label: 'Bulk Action', onClick: () => setShowBulkAction(true), angle: -60 },
            { id: 'export', icon: Download, label: 'Export Data', onClick: () => setShowExport(true), angle: 0 },
            { id: 'add', icon: Plus, label: 'Add Expense', onClick: () => setShowAddModal(true), angle: 60 }
          ]}
        />
      }
      addButton={
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Add Expense
        </button>
      }
      floatingActionMenu={
        <UniversalFloatingActionMenu
          sectionName="Expense"
          onAddItem={() => setShowAddModal(true)}
          onBulkAction={() => setShowBulkAction(true)}
          onExport={() => setShowExport(true)}
          onSearch={() => setShowSearch(true)}
          onAnalytics={() => setShowAnalytics(true)}
        />
      }
      aiInsightsData={{
        properties: expenses.map(e => e.propertyId).filter(Boolean),
        tenants: []
      }}
      smartSuggestionsData={{
        properties: expenses.map(e => e.propertyId).filter(Boolean),
        tenants: []
      }}
      isLoading={isLoading}
      error={error}
    >
      {expenses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {expenses.map((expense, index) => (
            <LazyLoader key={expense._id}>
              <UniversalGlassyCard
                item={expense}
                index={index}
                icon={Receipt}
                title={expense.description || `Expense #${expense._id.substring(0, 8)}`}
                subtitle={`${expense.propertyId?.name || 'General Expense'} - ${new Date(expense.date).toLocaleDateString()}`}
                status={expense.status || 'Recorded'}
                stats={[
                  { 
                    label: 'Amount', 
                    value: `$${expense.amount?.toLocaleString() || 0}`, 
                    icon: DollarSign,
                    color: 'text-red-300'
                  },
                  { 
                    label: 'Date', 
                    value: new Date(expense.date).toLocaleDateString(), 
                    icon: Calendar,
                    color: 'text-blue-300'
                  },
                  { 
                    label: 'Category', 
                    value: expense.category || 'Miscellaneous', 
                    icon: Tag,
                    color: 'text-purple-300'
                  },
                  { 
                    label: 'Property', 
                    value: expense.propertyId?.name || 'General', 
                    icon: Building2,
                    color: 'text-green-300'
                  }
                ]}
                badges={[
                  { label: 'Amount:', value: `$${expense.amount}`, color: 'bg-red-500' }
                ]}
                detailsPath={`/dashboard/expenses-universal/${expense._id}`}
                onEdit={() => {}}
                onDelete={() => {}}
                secondaryActions={[
                  { 
                    icon: Download, 
                    label: 'Receipt', 
                    onClick: () => {}, 
                    color: 'bg-gradient-to-r from-blue-400 to-blue-500'
                  }
                ]}
                showCheckbox={false}
                isSelected={selectedExpenses.includes(expense._id)}
                onSelect={handleExpenseSelect}
              />
            </LazyLoader>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="rounded-2xl p-12 shadow-lg max-w-lg mx-auto border-2 border-white/20" 
               style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px)'}}>
            <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-white/20"
                 style={{background: 'rgba(249, 115, 22, 0.3)'}}>
              <Receipt size={64} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-4">
              No Expenses Yet
            </h3>
            <p className="text-gray-300 mb-10 text-lg">
              Start tracking your property expenses by adding records.
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium"
            >
              <Plus size={18} className="inline mr-2" />
              Add Expense
            </button>
          </div>
        </div>
      )}
    </UniversalSectionPage>
    
    {/* Modals */}
    <UniversalSearchModal
      isOpen={showSearch}
      onClose={() => setShowSearch(false)}
      sectionName="Expense"
      onSearch={(query, filters) => {
        console.log('Search expenses:', query, filters);
        // Implement search logic here
      }}
      data={expenses}
    />
    
    <UniversalAnalyticsModal
      isOpen={showAnalytics}
      onClose={() => setShowAnalytics(false)}
      sectionName="Expense"
      data={expenses}
    />
  </>
  );
};

export default ExpensesPageUniversal;