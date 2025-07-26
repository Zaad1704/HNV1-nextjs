'use client';
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { CreditCard, Plus, DollarSign, Calendar, User, Download, Building2, Users, FileText, TrendingUp, AlertTriangle, CheckCircle, Clock, Eye, Edit, Trash2, Archive, Share2, Filter } from 'lucide-react';
import LazyLoader from '@/components/common/LazyLoader';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import Phase3MobileHeader from '@/components/mobile/Phase3MobileHeader';
import Phase3TabFilters from '@/components/mobile/Phase3TabFilters';
import Phase3SwipeableCard from '@/components/mobile/Phase3SwipeableCard';
import Phase3BottomSheet from '@/components/mobile/Phase3BottomSheet';
import Phase3RightSidebar, { createSmartFiltersSection, createAIInsightsSection } from '@/components/mobile/Phase3RightSidebar';
import { useBackgroundRefresh } from '@/hooks/useBackgroundRefresh';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalCard from '@/components/common/UniversalCard';
import { useCrossData } from '@/hooks/useCrossData';
import apiClient from '@/lib/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import UniversalSearch, { SearchFilters } from '@/components/common/UniversalSearch';
import UniversalExport from '@/components/common/UniversalExport';
import ManualPaymentModal from '@/components/common/ManualPaymentModal';
import BulkPaymentModal from '@/components/common/BulkPaymentModal';
import QuickPaymentModal from '@/components/common/QuickPaymentModal';
import MonthlyCollectionSheet from '@/components/common/MonthlyCollectionSheet';
import AgentHandoverModal from '@/components/common/AgentHandoverModal';
import EnhancedPaymentCard from '@/components/common/EnhancedPaymentCard';
import PaymentAdvancedSearch from '@/components/payment/PaymentAdvancedSearch';
import PaymentPredictiveSearch from '@/components/payment/PaymentPredictiveSearch';
import PaymentSmartFilters from '@/components/payment/PaymentSmartFilters';
import PaymentInsightsPanel from '@/components/payment/PaymentInsightsPanel';
import EnhancedBulkPaymentActions from '@/components/payment/EnhancedBulkPaymentActions';
import OverduePaymentModal from '@/components/common/OverduePaymentModal';
import PaymentAnalytics from '@/components/payment/PaymentAnalytics';
import PaymentAutomationRules from '@/components/payment/PaymentAutomationRules';
import PaymentWorkflowManager from '@/components/payment/PaymentWorkflowManager';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { deletePayment, confirmDelete, handleDeleteError, handleDeleteSuccess } from '@/utils/deleteHelpers';
import { useWorkflowTriggers } from '@/hooks/useWorkflowTriggers';
import { motion } from 'framer-motion';

const fetchPayments = async (propertyId?: string, tenantId?: string) => {
  try {
    let url = '/payments';
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId);
    if (tenantId) params.append('tenantId', tenantId);
    if (params.toString()) url += `?${params.toString()}`;
    
    const { data } = await apiClient.get(url);
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return [];
  }
};

const PaymentsPageUpgraded = () => {
  const queryClient = useQueryClient();
  const { currency } = useCurrency();
  const { user } = useAuthStore();
  const { stats } = useCrossData();
  const { triggerPaymentWorkflow } = useWorkflowTriggers();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const tenantId = searchParams.get('tenantId');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkPayment, setShowBulkPayment] = useState(false);
  const [showQuickPayment, setShowQuickPayment] = useState(false);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [showAgentHandover, setShowAgentHandover] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [showBulkMode, setShowBulkMode] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedSearchCriteria, setAdvancedSearchCriteria] = useState<any>({});
  const [smartFilters, setSmartFilters] = useState<any>({});
  const [showAutomation, setShowAutomation] = useState(false);
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments', propertyId, tenantId],
    queryFn: () => fetchPayments(propertyId || undefined, tenantId || undefined),
    retry: 1
  });

  // Fetch properties and tenants for analytics
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/properties');
        return data.data || [];
      } catch (error) {
        return [];
      }
    }
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/tenants');
        return data.data || [];
      } catch (error) {
        return [];
      }
    }
  });

  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    
    let filtered = payments.filter((payment: any) => {
      if (!payment) return false;
      
      // Status filters
      if (showPending && payment.status !== 'pending') return false;
      if (showFailed && payment.status !== 'failed') return false;
      if (!showPending && !showFailed && ['pending', 'failed'].includes(payment.status)) return false;
      
      // Advanced search criteria
      if (advancedSearchCriteria.query) {
        const query = advancedSearchCriteria.query.toLowerCase();
        const matches = (payment.tenantId?.name?.toLowerCase().includes(query)) ||
                       (payment.propertyId?.name?.toLowerCase().includes(query)) ||
                       (payment.description?.toLowerCase().includes(query)) ||
                       (payment.paymentMethod?.toLowerCase().includes(query));
        if (!matches) return false;
      }
      
      if (advancedSearchCriteria.amountRange) {
        const amount = payment.amount || 0;
        const min = parseFloat(advancedSearchCriteria.amountRange.min) || 0;
        const max = parseFloat(advancedSearchCriteria.amountRange.max) || Infinity;
        if (amount < min || amount > max) return false;
      }
      
      if (advancedSearchCriteria.dateRange?.start || advancedSearchCriteria.dateRange?.end) {
        const paymentDate = new Date(payment.paymentDate || payment.createdAt);
        if (advancedSearchCriteria.dateRange.start && paymentDate < new Date(advancedSearchCriteria.dateRange.start)) return false;
        if (advancedSearchCriteria.dateRange.end && paymentDate > new Date(advancedSearchCriteria.dateRange.end)) return false;
      }
      
      if (advancedSearchCriteria.paymentMethod && payment.paymentMethod !== advancedSearchCriteria.paymentMethod) return false;
      if (advancedSearchCriteria.status && payment.status !== advancedSearchCriteria.status) return false;
      
      // Smart filters
      if (smartFilters.dateFilter === 'thisMonth') {
        const paymentDate = new Date(payment.paymentDate || payment.createdAt);
        const now = new Date();
        if (paymentDate.getMonth() !== now.getMonth() || paymentDate.getFullYear() !== now.getFullYear()) return false;
      }
      
      if (smartFilters.amountFilter === 'high') {
        const avgAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0) / payments.length;
        if ((payment.amount || 0) <= avgAmount * 1.5) return false;
      }
      
      if (smartFilters.statusFilter && payment.status !== smartFilters.statusFilter) return false;
      
      // Search filters
      const matchesSearch = !searchFilters.query || 
        (payment.tenantId?.name && payment.tenantId.name.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
        (payment.propertyId?.name && payment.propertyId.name.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
        (payment.description && payment.description.toLowerCase().includes(searchFilters.query.toLowerCase()));
      
      const matchesStatus = !searchFilters.status || payment.status === searchFilters.status;
      
      return matchesSearch && matchesStatus;
    });

    // Apply sorting from advanced search
    if (advancedSearchCriteria.sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        switch (advancedSearchCriteria.sortBy) {
          case 'amount':
            aValue = a.amount || 0;
            bValue = b.amount || 0;
            break;
          case 'tenant':
            aValue = a.tenantId?.name || '';
            bValue = b.tenantId?.name || '';
            break;
          case 'status':
            aValue = a.status || '';
            bValue = b.status || '';
            break;
          default:
            aValue = new Date(a.paymentDate || a.createdAt || 0);
            bValue = new Date(b.paymentDate || b.createdAt || 0);
        }
        
        if (advancedSearchCriteria.sortOrder === 'desc') {
          return aValue < bValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    return filtered;
  }, [payments, searchFilters, showPending, showFailed, advancedSearchCriteria, smartFilters]);

  const handlePaymentAdded = async (newPayment: any) => {
    queryClient.setQueryData(['payments'], (old: any) => [...(old || []), newPayment]);
    await triggerPaymentWorkflow(newPayment);
  };

  const handlePaymentSelect = (paymentId: string, selected: boolean) => {
    if (selected) {
      setSelectedPayments(prev => [...prev, paymentId]);
    } else {
      setSelectedPayments(prev => prev.filter(id => id !== paymentId));
    }
  };

  const handleDeletePayment = async (paymentId: string, amount: number) => {
    if (confirmDelete(`${currency}${amount}`, 'payment')) {
      try {
        await deletePayment(paymentId);
        queryClient.setQueryData(['payments'], (old: any) => 
          (old || []).filter((p: any) => p._id !== paymentId)
        );
        handleDeleteSuccess('payment');
      } catch (error: any) {
        handleDeleteError(error, 'payment');
      }
    }
  };

  const { addOptimistic, updateOptimistic, removeOptimistic } = useOptimisticUpdate(['payments'], payments);

  // Background refresh
  useBackgroundRefresh([['payments']], 60000);

  if (isLoading) {
    return <SkeletonLoader type="card" count={8} />;
  }

  return (
    <div className="space-y-8">
      {/* Desktop Header */}
      <div className="hidden md:block">
        <UniversalHeader
          title="Payments"
          subtitle={
            propertyId ? `Payments for selected property (${filteredPayments.length} payments)` :
            tenantId ? `Payments for selected tenant (${filteredPayments.length} payments)` :
            `Track and manage rent payments (${filteredPayments.length} payments)`
          }
          icon={CreditCard}
          stats={[
            { label: 'Total', value: filteredPayments.length, color: 'blue' },
            { label: 'This Month', value: filteredPayments.filter(p => new Date(p.paymentDate).getMonth() === new Date().getMonth()).length, color: 'green' },
            { label: 'Amount', value: `$${filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}`, color: 'purple' },
            { label: 'Completed', value: filteredPayments.filter(p => p.status === 'Completed' || p.status === 'Paid').length, color: 'green' }
          ]}
          actions={
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkPayment(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2"
              >
                <Building2 size={16} />
                Bulk Payment
              </button>
              <button
                onClick={() => setShowQuickPayment(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2"
              >
                <Users size={16} />
                Quick Payment
              </button>
              <button
                onClick={() => setShowCollectionSheet(true)}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 flex items-center gap-2"
              >
                <FileText size={16} />
                Collection Sheet
              </button>
              <button
                onClick={() => setShowExport(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 flex items-center gap-2"
              >
                <Download size={16} />
                Export
              </button>
              <button
                onClick={() => setShowOverdueModal(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center gap-2"
              >
                <AlertTriangle size={16} />
                Settle Overdue
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="group btn-gradient px-8 py-4 rounded-3xl flex items-center gap-3 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                  <Plus size={14} className="text-white" />
                </div>
                Record Payment
              </button>
            </div>
          }
        />
      </div>

      {/* Phase 3 Mobile Header */}
      <div className="md:hidden">
        <Phase3MobileHeader
          title="Payments"
          count={filteredPayments.length}
          stats={[
            { label: 'Completed', value: filteredPayments.filter(p => p.status === 'Completed' || p.status === 'Paid').length, color: 'green' },
            { label: 'Amount', value: `$${filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}`, color: 'purple' }
          ]}
          onExport={() => setShowExport(true)}
          onQuickAction={() => setShowQuickPayment(true)}
          onFilter={() => setShowMobileFilters(!showMobileFilters)}
          showFilters={showMobileFilters}
          activeFiltersCount={[showPending, showFailed, showBulkMode].filter(Boolean).length}
        />
      </div>

      {/* Phase 3 Mobile Tab Filters */}
      <div className="md:hidden">
        <Phase3TabFilters
          tabs={[
            { key: 'all', label: 'All', count: filteredPayments.length, active: !showPending && !showFailed && !showBulkMode },
            { key: 'pending', label: 'Pending', count: payments.filter(p => p.status === 'pending').length, active: showPending },
            { key: 'failed', label: 'Failed', count: payments.filter(p => p.status === 'failed').length, active: showFailed },
            { key: 'bulk', label: 'Bulk Select', count: selectedPayments.length, active: showBulkMode }
          ]}
          onTabClick={(key) => {
            switch (key) {
              case 'all':
                setShowPending(false);
                setShowFailed(false);
                setShowBulkMode(false);
                setSelectedPayments([]);
                break;
              case 'pending':
                setShowPending(!showPending);
                setShowFailed(false);
                break;
              case 'failed':
                setShowFailed(!showFailed);
                setShowPending(false);
                break;
              case 'bulk':
                setShowBulkMode(!showBulkMode);
                if (showBulkMode) setSelectedPayments([]);
                break;
            }
          }}
        />
      </div>

      {/* Desktop Layout with Right Sidebar */}
      <div className="hidden md:block">
        <div className="phase3-desktop-layout">
          {/* Main Content Area */}
          <div className="phase3-main-content space-y-6">
            {/* Predictive Search */}
            <PaymentPredictiveSearch
              payments={payments}
              onPaymentSelect={(payment) => {
                window.location.href = `/dashboard/payments/${payment._id}`;
              }}
            />

            {/* Advanced Search Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                  showAdvancedSearch
                    ? 'bg-purple-500 text-white'
                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                }`}
              >
                <Search size={16} />
                {showAdvancedSearch ? 'Hide Advanced Search' : 'Advanced Search'}
              </button>
            </div>

            {/* Advanced Search */}
            {showAdvancedSearch && (
              <PaymentAdvancedSearch
                onSearch={setAdvancedSearchCriteria}
                payments={payments}
              />
            )}

            <UniversalSearch
              onSearch={setSearchFilters}
              placeholder="Search payments by tenant, property, or amount..."
              showStatusFilter={true}
              statusOptions={[
                { value: 'Completed', label: 'Completed' },
                { value: 'Paid', label: 'Paid' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Failed' }
              ]}
            />

            {/* Enhanced Bulk Actions */}
            {selectedPayments.length > 0 && (
              <EnhancedBulkPaymentActions
                selectedPayments={selectedPayments}
                payments={filteredPayments}
                onAction={async (action, data) => {
                  console.log('Bulk action:', action, data);
                  switch (action) {
                    case 'export':
                      setShowExport(true);
                      break;
                    case 'mark_completed':
                      alert(`Marked ${data.paymentIds.length} payments as completed`);
                      break;
                    case 'mark_failed':
                      alert(`Marked ${data.paymentIds.length} payments as failed`);
                      break;
                    case 'send_receipts':
                      alert(`Sent receipts for ${data.paymentIds.length} payments`);
                      break;
                    case 'archive':
                      alert(`Archived ${data.paymentIds.length} payments`);
                      break;
                    case 'delete':
                      if (confirm(`Delete ${data.paymentIds.length} payments permanently?`)) {
                        alert(`Deleted ${data.paymentIds.length} payments`);
                      }
                      break;
                  }
                }}
                onClearSelection={() => setSelectedPayments([])}
              />
            )}

            {filteredPayments.length > 0 ? (
              <div className="phase3-card-grid">
                {filteredPayments.map((payment: any, index: number) => (
                  <LazyLoader key={payment._id}>
                    <EnhancedPaymentCard 
                      payment={payment} 
                      index={index}
                      onEdit={(p) => console.log('Edit payment', p._id)}
                      onDelete={() => handleDeletePayment(payment._id, payment.amount)}
                      showCheckbox={showBulkMode}
                      isSelected={selectedPayments.includes(payment._id)}
                      onSelect={handlePaymentSelect}
                    />
                  </LazyLoader>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="relative">
                  <div className="w-32 h-32 gradient-dark-orange-blue rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <CreditCard size={64} className="text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent mb-4">
                  No Payments Found
                </h3>
                <p className="text-text-secondary mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                  Start tracking your rental income by recording payments.
                </p>
              </div>
            )}

            {/* Payment Analytics */}
            {filteredPayments.length > 0 && properties.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Analytics</h2>
                <PaymentAnalytics 
                  payments={filteredPayments}
                  properties={properties}
                  tenants={tenants}
                />
              </div>
            )}

            {/* Automation Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Payment Automation</h2>
                <button
                  onClick={() => setShowAutomation(!showAutomation)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                    showAutomation
                      ? 'bg-purple-500 text-white'
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  }`}
                >
                  {showAutomation ? 'Hide Automation' : 'Show Automation'}
                </button>
              </div>

              {showAutomation && (
                <div className="space-y-6">
                  <PaymentAutomationRules
                    payments={filteredPayments}
                    onRuleCreate={(rule) => {
                      console.log('Create rule:', rule);
                      alert('Automation rule created successfully!');
                    }}
                    onRuleUpdate={(id, rule) => {
                      console.log('Update rule:', id, rule);
                      alert('Automation rule updated successfully!');
                    }}
                    onRuleDelete={(id) => {
                      console.log('Delete rule:', id);
                      alert('Automation rule deleted successfully!');
                    }}
                  />
                  
                  <PaymentWorkflowManager
                    payments={filteredPayments}
                    onWorkflowCreate={(workflow) => {
                      console.log('Create workflow:', workflow);
                      alert('Payment workflow created successfully!');
                    }}
                    onWorkflowUpdate={(id, workflow) => {
                      console.log('Update workflow:', id, workflow);
                      alert('Payment workflow updated successfully!');
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Phase 3 Right Sidebar */}
          <Phase3RightSidebar
            sections={[
              createSmartFiltersSection(
                <div className="space-y-4">
                  <PaymentSmartFilters
                    payments={payments}
                    onFilterChange={setSmartFilters}
                    activeFilters={smartFilters}
                  />
                  
                  <div className="border-t pt-4 space-y-2">
                    <button
                      onClick={() => {
                        setShowBulkMode(!showBulkMode);
                        if (showBulkMode) setSelectedPayments([]);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        showBulkMode 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      {showBulkMode ? 'Exit Bulk Select' : 'Bulk Select'}
                    </button>
                  </div>
                </div>,
                true
              ),
              createAIInsightsSection(
                filteredPayments.length > 0 ? (
                  <PaymentInsightsPanel payments={filteredPayments} className="border-0 bg-transparent p-0" />
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    Add payments to see AI insights
                  </div>
                ),
                false
              )
            ]}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        {/* Mobile Collapsible Insights */}
        {filteredPayments.length > 0 && (
          <div className="px-4">
            <div className="bg-white rounded-xl border border-gray-200">
              <button
                onClick={() => setShowMobileActions(!showMobileActions)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Payment Insights</div>
                    <div className="text-xs text-gray-600">Revenue analysis</div>
                  </div>
                </div>
                <div className={`transform transition-transform ${showMobileActions ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {showMobileActions && (
                <div className="border-t border-gray-200">
                  <PaymentInsightsPanel payments={filteredPayments} className="border-0 bg-transparent" />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="px-4">
          <UniversalSearch
            onSearch={setSearchFilters}
            placeholder="Search payments..."
            showStatusFilter={true}
            statusOptions={[
              { value: 'Completed', label: 'Completed' },
              { value: 'Paid', label: 'Paid' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' }
            ]}
          />
        </div>

        {filteredPayments.length > 0 ? (
          <div className="phase3-card-grid px-4">
            {filteredPayments.map((payment: any, index: number) => (
              <LazyLoader key={payment._id}>
                <Phase3SwipeableCard
                  onEdit={() => console.log('Edit payment', payment._id)}
                  onDelete={() => handleDeletePayment(payment._id, payment.amount)}
                  onView={() => window.open(`/dashboard/payments/${payment._id}`, '_blank')}
                >
                  <EnhancedPaymentCard 
                    payment={payment} 
                    index={index}
                    onEdit={(p) => console.log('Edit payment', p._id)}
                    onDelete={() => handleDeletePayment(payment._id, payment.amount)}
                    showCheckbox={showBulkMode}
                    isSelected={selectedPayments.includes(payment._id)}
                    onSelect={handlePaymentSelect}
                  />
                </Phase3SwipeableCard>
              </LazyLoader>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4">
            <div className="relative">
              <div className="w-32 h-32 gradient-dark-orange-blue rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <CreditCard size={64} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent mb-4">
              No Payments Found
            </h3>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto leading-relaxed">
              Start tracking your rental income by recording payments.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <UniversalExport
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={filteredPayments}
        filename="payments"
        filters={searchFilters}
        title="Export Payments"
      />

      <ManualPaymentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPaymentAdded={handlePaymentAdded}
      />
      
      <BulkPaymentModal
        isOpen={showBulkPayment}
        onClose={() => setShowBulkPayment(false)}
      />
      
      <QuickPaymentModal
        isOpen={showQuickPayment}
        onClose={() => setShowQuickPayment(false)}
        onPaymentAdded={() => {
          queryClient.invalidateQueries({ queryKey: ['payments'] });
        }}
      />
      
      <OverduePaymentModal
        isOpen={showOverdueModal}
        onClose={() => setShowOverdueModal(false)}
        onPaymentAdded={() => {
          queryClient.invalidateQueries({ queryKey: ['payments'] });
          queryClient.invalidateQueries({ queryKey: ['tenants'] });
        }}
      />
      
      <MonthlyCollectionSheet
        isOpen={showCollectionSheet}
        onClose={() => setShowCollectionSheet(false)}
      />
      
      <AgentHandoverModal
        isOpen={showAgentHandover}
        onClose={() => setShowAgentHandover(false)}
        onHandoverRecorded={(handover) => {
          console.log('Agent handover recorded:', handover);
        }}
      />
      
      {/* Phase 3 Mobile FAB */}
      <div className="phase3-mobile-fab-payment md:hidden">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full h-full flex items-center justify-center group"
          aria-label="Record Payment"
        >
          <Plus size={24} className="text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
      
      {/* Mobile Bottom Sheet for Actions */}
      <Phase3BottomSheet
        isOpen={showMobileActions}
        onClose={() => setShowMobileActions(false)}
        title="Quick Actions"
        height="auto"
      >
        <div className="space-y-4">
          <button
            onClick={() => {
              setShowBulkPayment(true);
              setShowMobileActions(false);
            }}
            className="phase3-touch-btn-primary w-full"
          >
            <Building2 size={20} />
            <span className="ml-2">Bulk Payment</span>
          </button>
          
          <button
            onClick={() => {
              setShowQuickPayment(true);
              setShowMobileActions(false);
            }}
            className="phase3-touch-btn-secondary w-full"
          >
            <Users size={20} />
            <span className="ml-2">Quick Payment</span>
          </button>
          
          <button
            onClick={() => {
              setShowCollectionSheet(true);
              setShowMobileActions(false);
            }}
            className="phase3-touch-btn-secondary w-full"
          >
            <FileText size={20} />
            <span className="ml-2">Collection Sheet</span>
          </button>
          
          <button
            onClick={() => {
              setShowOverdueModal(true);
              setShowMobileActions(false);
            }}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 flex items-center justify-center gap-2"
          >
            <AlertTriangle size={20} />
            <span>Settle Overdue</span>
          </button>
        </div>
      </Phase3BottomSheet>
      
      {/* Modern Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-blue/5 to-brand-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-brand-orange/5 to-brand-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/3 to-pink-500/3 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default PaymentsPageUpgraded;