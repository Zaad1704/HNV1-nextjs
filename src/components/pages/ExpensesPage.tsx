'use client';
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { DollarSign, Plus, Calendar, Tag, Building, Download, Eye } from 'lucide-react';
import PropertyStyleBackground from '@/components/common/PropertyStyleBackground';
import PropertyStyleCard from '@/components/common/PropertyStyleCard';
import LazyLoader from '@/components/common/LazyLoader';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import SwipeableCard from '@/components/mobile/SwipeableCard';
import { useBackgroundRefresh } from '@/hooks/useBackgroundRefresh';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';
import UniversalActionButton from '@/components/common/UniversalActionButton';
import { useCrossData } from '@/hooks/useCrossData';
import apiClient from '@/lib/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import UniversalSearch, { SearchFilters } from '@/components/common/UniversalSearch';
import UniversalExport from '@/components/common/UniversalExport';
import AddExpenseModal from '@/components/common/AddExpenseModal';
import MessageButtons from '@/components/common/MessageButtons';
import { useQueryClient } from '@tanstack/react-query';
import { deleteExpense, confirmDelete, handleDeleteError, handleDeleteSuccess } from '@/utils/deleteHelpers';
import { useWorkflowTriggers } from '@/hooks/useWorkflowTriggers';

const fetchExpenses = async (propertyId?: string) => {
  try {
    const url = propertyId ? `/expenses?propertyId=${propertyId}` : '/expenses';
    const { data } = await apiClient.get(url);
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return [];
  }
};

const ExpensesPage = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const { currency } = useCurrency();
  const { stats } = useCrossData();
  const { triggerExpenseWorkflow } = useWorkflowTriggers();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const { data: expenses = [], isLoading, error } = useQuery({
    queryKey: ['expenses', propertyId],
    queryFn: () => fetchExpenses(propertyId || undefined),
    retry: 1,
    staleTime: 300000, // 5 minutes
    cacheTime: 600000, // 10 minutes
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Expenses query error:', error);
    }
  });

  const handleExpenseAdded = async (newExpense: any) => {
    queryClient.setQueryData(['expenses'], (old: any) => [...(old || []), newExpense]);
    
    // Trigger smart workflow
    await triggerExpenseWorkflow(newExpense);
  };

  const handleDeleteExpense = async (expenseId: string, description: string) => {
    if (confirmDelete(description, 'expense')) {
      try {
        await deleteExpense(expenseId);
        queryClient.setQueryData(['expenses'], (old: any) => 
          (old || []).filter((e: any) => e._id !== expenseId)
        );
        handleDeleteSuccess('expense');
      } catch (error: any) {
        handleDeleteError(error, 'expense');
      }
    }
  };

  // Enhanced expense data with memoized calculations
  const enhancedExpenses = useMemo(() => {
    return expenses.map((expense: any) => {
      const expenseDate = new Date(expense.date || expense.createdAt);
      const now = new Date();
      const daysSinceExpense = Math.floor((now.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate expense age category
      let ageCategory = 'Recent';
      if (daysSinceExpense > 90) ageCategory = 'Old';
      else if (daysSinceExpense > 30) ageCategory = 'Medium';
      
      return {
        ...expense,
        daysSinceExpense,
        ageCategory,
        isRecent: daysSinceExpense <= 7,
        formattedAmount: `$${expense.amount?.toLocaleString() || '0'}`,
        formattedDate: expenseDate.toLocaleDateString()
      };
    });
  }, [expenses]);
  
  const filteredExpenses = useMemo(() => {
    let filtered = [...enhancedExpenses];

    if (searchFilters.query) {
      filtered = filtered.filter(expense => 
        expense.description?.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
        expense.category?.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
        expense.vendor?.name?.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchFilters.query.toLowerCase())
      );
    }

    if (searchFilters.dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (searchFilters.dateRange) {
        case 'today': startDate.setHours(0, 0, 0, 0); break;
        case 'week': startDate.setDate(now.getDate() - 7); break;
        case 'month': startDate.setMonth(now.getMonth() - 1); break;
        case 'quarter': startDate.setMonth(now.getMonth() - 3); break;
        case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
        case 'custom': if (searchFilters.startDate) startDate = new Date(searchFilters.startDate); break;
      }
      
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.date || expense.createdAt);
        return expenseDate >= startDate;
      });
    }

    filtered.sort((a, b) => {
      const aValue = searchFilters.sortBy === 'amount' ? a.amount : new Date(a.date || a.createdAt);
      const bValue = searchFilters.sortBy === 'amount' ? b.amount : new Date(b.date || b.createdAt);
      return searchFilters.sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    return filtered;
  }, [enhancedExpenses, searchFilters]);

  // Background refresh
  useBackgroundRefresh([['expenses']], 60000);

  if (isLoading) {
    return <SkeletonLoader type="card" count={8} />;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign size={32} className="text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Unable to Load Expenses</h2>
        <p className="text-text-secondary mb-4">We're having trouble connecting to our servers.</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-gradient px-6 py-3 rounded-2xl font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <PropertyStyleBackground variant="secondary">
      <div className="space-y-8 p-6">
      <UniversalHeader
        title="Expenses"
        subtitle={propertyId ? `Expenses for selected property (${filteredExpenses.length} expenses)` : `Track property expenses and costs (${filteredExpenses.length} expenses)`}
        icon={DollarSign}
        stats={[
          { label: 'Total', value: expenses.length, color: 'blue' },
          { label: 'This Month', value: expenses.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).length, color: 'green' },
          { label: 'Amount', value: `$${stats?.totalExpenses?.toLocaleString() || 0}`, color: 'red' },
          { label: 'Archived', value: expenses.filter(e => e.status === 'Archived').length, color: 'yellow' }
        ]}
        actions={
          <>
            <UniversalActionButton
              variant="success"
              size="sm"
              icon={Download}
              onClick={() => setShowExport(true)}
            >
              Export
            </UniversalActionButton>
            <UniversalActionButton
              variant="primary"
              icon={Plus}
              onClick={() => setShowAddModal(true)}
            >
              Add Expense
            </UniversalActionButton>
          </>
        }
      />

      <UniversalSearch
        onSearch={setSearchFilters}
        placeholder="Search expenses by description or category..."
        showStatusFilter={false}
      />

      {filteredExpenses.length > 0 ? (
        <div className="universal-grid universal-grid-4">
          {filteredExpenses.map((expense: any, index: number) => (
            <LazyLoader key={expense._id}>
              <div className="md:hidden">
                <SwipeableCard
                  onEdit={() => console.log('Edit expense', expense._id)}
                  onDelete={() => handleDeleteExpense(expense._id, expense.description)}
                  onView={() => window.open(`/dashboard/expenses/${expense._id}`, '_blank')}
                >
                  <PropertyStyleCard gradient="secondary">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <DollarSign size={24} className="text-white" />
                </div>
                <UniversalStatusBadge 
                  status={expense.category || 'Expense'} 
                  variant="error"
                />
              </div>
              
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-text-primary group-hover:text-red-600 transition-colors duration-300">
                  {currency}{expense.amount?.toLocaleString() || '0'}
                </h3>
              </div>
              
              <p className="text-text-primary font-medium mb-3">
                {expense.description || 'No description'}
              </p>
              
              <div className="space-y-2 text-sm text-text-secondary mb-4">
                <div className="flex items-center gap-2">
                  <Building size={14} />
                  <span>{expense.propertyId?.name || 'General'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{expense.date ? new Date(expense.date).toLocaleDateString() : 'No date'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Link
                  to={`/dashboard/expenses/${expense._id}`}
                  className="w-full gradient-dark-orange-blue text-white py-3 px-4 rounded-2xl text-sm font-semibold transition-all hover:shadow-xl text-center block group-hover:scale-105 transform"
                >
                  View Details
                </Link>
                <div className="flex gap-2">
                  <UniversalActionButton
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteExpense(expense._id, expense.description)}
                  >
                    Delete
                  </UniversalActionButton>
                  <MessageButtons
                    phone={expense.vendorPhone}
                    email={expense.vendorEmail}
                    name={expense.vendorName || 'Vendor'}
                    customMessage={`Expense record: ${expense.description} - ${currency}${expense.amount}`}
                  />
                </div>
              </div>
                  </PropertyStyleCard>
                </SwipeableCard>
              </div>
              <div className="hidden md:block">
                <PropertyStyleCard gradient="secondary">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <DollarSign size={24} className="text-white" />
                    </div>
                    <UniversalStatusBadge status={expense.category || 'Expense'} variant="error" />
                  </div>
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-text-primary group-hover:text-red-600 transition-colors duration-300">
                      {currency}{expense.amount?.toLocaleString() || '0'}
                    </h3>
                  </div>
                </PropertyStyleCard>
              </div>
            </LazyLoader>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <DollarSign size={48} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">No Expenses Yet</h3>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Start tracking expenses by adding your first expense.
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-gradient px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Add First Expense
          </button>
        </div>
      )}
      <UniversalExport
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={filteredExpenses}
        filename="expenses"
        filters={searchFilters}
        title="Export Expenses"
      />

      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onExpenseAdded={handleExpenseAdded}
      />
      </div>
    </PropertyStyleBackground>
  );
};

export default ExpensesPage;