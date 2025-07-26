'use client';
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { CreditCard, Plus, DollarSign, Calendar, User, Download, Building2, Users, FileText, TrendingUp, AlertTriangle, CheckCircle, Clock, Eye, Edit, Trash2, Archive, Share2, Filter, Sparkles, CheckSquare, Square, Wallet, Search, BarChart3 } from 'lucide-react';
import LazyLoader from '@/components/common/LazyLoader';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import Phase3MobileHeader from '@/components/mobile/Phase3MobileHeader';
import Phase3TabFilters from '@/components/mobile/Phase3TabFilters';
import Phase3SwipeableCard from '@/components/mobile/Phase3SwipeableCard';
import Phase3BottomSheet from '@/components/mobile/Phase3BottomSheet';
import Phase3RightSidebar, { createSmartFiltersSection, createAIInsightsSection } from '@/components/mobile/Phase3RightSidebar';
import { useBackgroundRefresh } from '@/hooks/useBackgroundRefresh';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import UniversalSearch, { SearchFilters } from '@/components/common/UniversalSearch';
import UniversalExport from '@/components/common/UniversalExport';
import ManualPaymentModal from '@/components/common/ManualPaymentModal';
import BulkPaymentModal from '@/components/common/BulkPaymentModal';
import QuickPaymentModal from '@/components/common/QuickPaymentModal';
import MonthlyCollectionSheet from '@/components/common/MonthlyCollectionSheet';
import AgentHandoverModal from '@/components/common/AgentHandoverModal';
import PaymentCollectionHandoverModal from '@/components/common/PaymentCollectionHandoverModal';
import { useCrossData } from '@/hooks/useCrossData';
import apiClient from '@/lib/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { deletePayment, confirmDelete, handleDeleteError, handleDeleteSuccess } from '@/utils/deleteHelpers';
import { useWorkflowTriggers } from '@/hooks/useWorkflowTriggers';
import { motion } from 'framer-motion';

// New components for the redesign
import FixedGlassyPaymentCard from '@/components/payment/FixedGlassyPaymentCard';
import FloatingPaymentActionMenu from '@/components/payment/FloatingPaymentActionMenu';
import SimpleActionMenu from '@/components/property/SimpleActionMenu';
import HeaderActionBar from '@/components/property/HeaderActionBar';
import PaymentCollapsibleSmartSearch from '@/components/payment/PaymentCollapsibleSmartSearch';
import PaymentInsightsPanel from '@/components/payment/PaymentInsightsPanel';
import PaymentSmartFilters from '@/components/payment/PaymentSmartFilters';
import PaymentActivityFeed from '@/components/payment/PaymentActivityFeed';
import PaymentBulkActions from '@/components/payment/PaymentBulkActions';
import PaymentAnalyticsDashboard from '@/components/payment/PaymentAnalyticsDashboard';
import BlendedAIInsightsWidget from '@/components/property/BlendedAIInsightsWidget';
import GlassySmartSuggestionsPanel from '@/components/property/GlassySmartSuggestionsPanel';

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

const PaymentsPage = () => {
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
  const [showPaymentHandover, setShowPaymentHandover] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [showBulkMode, setShowBulkMode] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [showSmartSearch, setShowSmartSearch] = useState(false);
  const [showMobileInsights, setShowMobileInsights] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [smartFilters, setSmartFilters] = useState<any>({});
  
  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments', propertyId, tenantId],
    queryFn: () => fetchPayments(propertyId || undefined, tenantId || undefined),
    retry: 1,
    staleTime: 300000, // 5 minutes
    cacheTime: 600000, // 10 minutes
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Payments query error:', error);
    }
  });

  // Enhanced payment data with memoized calculations
  const enhancedPayments = useMemo(() => {
    return payments.map((payment: any) => {
      const paymentDate = new Date(payment.paymentDate);
      const now = new Date();
      const daysSincePayment = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Normalize status for consistency
      const normalizedStatus = payment.status === 'Completed' ? 'Paid' : payment.status;
      
      // Calculate effective amount after fees and discounts
      const totalFees = (payment.fees?.totalFees || 0) + 
                       (payment.fees?.processingFee || 0) + 
                       (payment.fees?.lateFee || 0) + 
                       (payment.fees?.otherFees || 0);
      const discountAmount = payment.discount?.amount || 0;
      const effectiveAmount = payment.amount - totalFees - discountAmount;
      
      return {
        ...payment,
        normalizedStatus,
        daysSincePayment,
        effectiveAmount,
        totalFees,
        discountAmount,
        isRecent: daysSincePayment <= 7,
        isOverdue: normalizedStatus === 'Pending' && daysSincePayment > 30
      };
    });
  }, [payments]);
  
  const filteredPayments = useMemo(() => {
    if (!enhancedPayments) return [];
    
    let filtered = enhancedPayments.filter((payment: any) => {
      if (!payment) return false;
      
      // Status filters with normalized status
      if (showPending && payment.normalizedStatus !== 'Pending') return false;
      if (showFailed && payment.normalizedStatus !== 'Failed') return false;
      if (showArchived && payment.normalizedStatus !== 'Archived') return false;
      if (!showPending && !showFailed && !showArchived && 
          ['Pending', 'Failed', 'Archived'].includes(payment.normalizedStatus)) return false;
      
      // Search filters with better matching
      const matchesSearch = !searchFilters.query || 
        (payment.tenantId?.name && payment.tenantId.name.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
        (payment.propertyId?.name && payment.propertyId.name.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
        (payment.description && payment.description.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
        (payment.receiptNumber && payment.receiptNumber.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
        (payment.referenceNumber && payment.referenceNumber.toLowerCase().includes(searchFilters.query.toLowerCase()));
      
      const matchesStatus = !searchFilters.status || payment.normalizedStatus === searchFilters.status;
      
      // Smart filters
      if (smartFilters.paymentMethod?.length > 0) {
        if (!smartFilters.paymentMethod.includes(payment.paymentMethod)) return false;
      }
      
      if (smartFilters.amountRange) {
        const amount = payment.effectiveAmount || payment.amount;
        if (amount < smartFilters.amountRange.min || amount > smartFilters.amountRange.max) return false;
      }
      
      return matchesSearch && matchesStatus;
    });

    return filtered;
  }, [enhancedPayments, searchFilters, showPending, showFailed, showArchived, smartFilters]);

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

  const { addOptimistic, updateOptimistic, removeOptimistic } = useOptimisticUpdate(['payments'], payments);

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

  // Background refresh
  useBackgroundRefresh([['payments']], 60000);

  if (isLoading) {
    return <SkeletonLoader type="card" count={8} />;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard size={32} className="text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Unable to Load Payments</h2>
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
    <div className="min-h-screen relative" style={{background: 'linear-gradient(135deg, #FF8A65, #42A5F5, #66BB6A)'}}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{backgroundColor: '#FF6B35', opacity: 0.4}}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{backgroundColor: '#1E88E5', opacity: 0.4}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-2000" style={{backgroundColor: '#43A047', opacity: 0.3}}></div>
      </div>

      <div className="relative space-y-8 p-6">
        {/* Real-time Activity Feed */}
        <PaymentActivityFeed payments={payments} />
      {/* Desktop Header - Match Page Background */}
      <div className="hidden md:block">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}></div>
          <div className="relative rounded-3xl p-6 border-2 border-white/40 mb-8" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(25px) saturate(200%)'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.6), rgba(66,165,245,0.6))'}}>
                  <CreditCard size={24} className="text-white" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'}} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                    Payments
                    <Sparkles size={24} className="text-yellow-400 animate-pulse" />
                  </h1>
                  <p className="text-white/90" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                    {propertyId ? `Payments for selected property` :
                    tenantId ? `Payments for selected tenant` :
                    `Track and manage rent payments`} ({filteredPayments.length} payments)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center px-3 py-2 rounded-xl" style={{background: 'rgba(0,0,0,0.2)'}}>
                  <div className="text-lg font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{payments.length}</div>
                  <div className="text-xs text-white/80">Total</div>
                </div>
                <div className="text-center px-3 py-2 rounded-xl" style={{background: 'rgba(0,0,0,0.2)'}}>
                  <div className="text-lg font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                    {payments.filter(p => new Date(p.paymentDate).getMonth() === new Date().getMonth()).length}
                  </div>
                  <div className="text-xs text-white/80">This Month</div>
                </div>
                <div className="text-center px-3 py-2 rounded-xl" style={{background: 'rgba(0,0,0,0.2)'}}>
                  <div className="text-lg font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                    {currency}{stats?.totalIncome?.toLocaleString() || 0}
                  </div>
                  <div className="text-xs text-white/80">Amount</div>
                </div>

                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={18} />
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="rounded-2xl p-4 border border-white/30 mb-4" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.3), rgba(66,165,245,0.3))', backdropFilter: 'blur(20px)'}}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.6), rgba(66,165,245,0.6))'}}>
                <CreditCard size={20} className="text-white" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))'}} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>Payments</h1>
                <p className="text-sm text-white/90">{filteredPayments.length} payments</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="text-center px-2 py-1 rounded-lg flex-1" style={{background: 'rgba(0,0,0,0.2)'}}>
              <div className="text-sm font-bold text-white">{payments.filter(p => p.status === 'Completed' || p.status === 'Paid').length}</div>
              <div className="text-xs text-white/80">Completed</div>
            </div>
            <div className="text-center px-2 py-1 rounded-lg flex-1" style={{background: 'rgba(0,0,0,0.2)'}}>
              <div className="text-sm font-bold text-white">{payments.filter(p => new Date(p.paymentDate).getMonth() === new Date().getMonth()).length}</div>
              <div className="text-xs text-white/80">This Month</div>
            </div>
          </div>
        </div>
        
        <Phase3MobileHeader
          title="Payments"
          count={filteredPayments.length}
          stats={[
            { label: 'Completed', value: payments.filter(p => p.status === 'Completed' || p.status === 'Paid').length, color: 'green' },
            { label: 'This Month', value: payments.filter(p => new Date(p.paymentDate).getMonth() === new Date().getMonth()).length, color: 'blue' }
          ]}
          onExport={() => setShowExport(true)}
          onQuickAction={() => setShowQuickPayment(true)}
          onFilter={() => setShowMobileFilters(!showMobileFilters)}
          showFilters={showMobileFilters}
          activeFiltersCount={[showPending, showFailed, showArchived, showBulkMode].filter(Boolean).length}
        />
      </div>

      {/* Phase 3 Mobile Tab Filters */}
      <div className="md:hidden">
        <Phase3TabFilters
          tabs={[
            {
              key: 'all',
              label: 'All',
              icon: Eye,
              count: payments.length,
              active: !showPending && !showFailed && !showArchived && !showBulkMode
            },
            {
              key: 'pending',
              label: 'Pending',
              icon: Clock,
              count: payments.filter(p => p.status === 'pending').length,
              active: showPending
            },
            {
              key: 'failed',
              label: 'Failed',
              icon: AlertTriangle,
              count: payments.filter(p => p.status === 'failed').length,
              active: showFailed
            },
            {
              key: 'bulk',
              label: 'Select',
              icon: showBulkMode ? CheckSquare : Square,
              count: selectedPayments.length,
              active: showBulkMode
            }
          ]}
          onTabClick={(key) => {
            switch (key) {
              case 'all':
                setShowPending(false);
                setShowFailed(false);
                setShowArchived(false);
                setShowBulkMode(false);
                setSelectedPayments([]);
                break;
              case 'pending':
                setShowPending(!showPending);
                setShowFailed(false);
                setShowArchived(false);
                break;
              case 'failed':
                setShowFailed(!showFailed);
                setShowPending(false);
                setShowArchived(false);
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
            {/* Header Action Bar */}
            <HeaderActionBar
              sectionName="Payment"
              primaryAction={{
                id: 'add-payment',
                icon: Plus,
                label: 'Record Payment',
                onClick: () => setShowAddModal(true),
                color: 'bg-gradient-to-r from-orange-500 to-blue-500'
              }}
              actions={[
                {
                  id: 'bulk-payment',
                  icon: Building2,
                  label: 'Bulk Payment',
                  onClick: () => setShowBulkPayment(true)
                },
                {
                  id: 'quick-payment',
                  icon: Users,
                  label: 'Quick Payment',
                  onClick: () => setShowQuickPayment(true)
                },
                {
                  id: 'collection-sheet',
                  icon: FileText,
                  label: 'Collection Sheet',
                  onClick: () => setShowCollectionSheet(true)
                },
                {
                  id: 'export',
                  icon: Download,
                  label: 'Export Data',
                  onClick: () => setShowExport(true)
                },
                {
                  id: 'search',
                  icon: Search,
                  label: 'Smart Search',
                  onClick: () => setShowSmartSearch(true)
                },
                {
                  id: 'analytics',
                  icon: BarChart3,
                  label: 'Analytics',
                  onClick: () => setShowAnalytics(!showAnalytics)
                },
                {
                  id: 'handover',
                  icon: Wallet,
                  label: 'Payment Handover',
                  onClick: () => setShowPaymentHandover(true)
                }
              ]}
            />

            {/* Universal Search */}
            {showAnalytics ? (
              <PaymentAnalyticsDashboard payments={payments} />
            ) : (
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
            )}
            {filteredPayments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPayments.map((payment: any, index: number) => (
                  <LazyLoader key={payment._id}>
                    <FixedGlassyPaymentCard 
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
                <div 
                  className="rounded-2xl p-12 shadow-lg max-w-lg mx-auto border-2 border-white/20" 
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px) saturate(180%)'
                  }}
                >
                  <div className="relative mb-8">
                    <div 
                      className="w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-white/20"
                      style={{
                        background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(20px) saturate(180%)'
                      }}
                    >
                      <CreditCard size={64} className="text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles size={16} className="text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-4">
                    No Payments Yet
                  </h3>
                  <p className="text-gray-300 mb-10 text-lg leading-relaxed">
                    Start tracking your rental income by recording payments. Use bulk payment for multiple tenants or quick payment for individual transactions.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => setShowBulkPayment(true)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <Building2 size={18} />
                      Bulk Payment
                    </button>
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <DollarSign size={18} />
                      Record Payment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Sidebar with Always Visible AI Insights and Smart Suggestions */}
          <div className="phase3-sidebar space-y-6">
            <BlendedAIInsightsWidget 
              properties={[]}
              tenants={[]}
            />
            <div className="rounded-2xl p-4 space-y-4 border-2 border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px) saturate(180%)'}}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Payment Insights</h3>
              </div>
              <PaymentInsightsPanel payments={payments} className="border-0 bg-transparent" />
            </div>
            
            <div className="rounded-2xl p-4 space-y-4 border-2 border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px) saturate(180%)'}}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Smart Filters</h3>
              </div>
              <PaymentSmartFilters 
                payments={payments} 
                onFilterChange={setSmartFilters} 
                activeFilters={smartFilters} 
              />
            </div>
            
            <div className="rounded-2xl p-4 space-y-4 border-2 border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px) saturate(180%)'}}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Smart Suggestions</h3>
              </div>
              <div className="space-y-3">
                {payments.filter(p => p.status === 'pending').length > 0 && (
                  <div className="p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                    <div className="font-medium text-white mb-1">Pending Payments</div>
                    <div className="text-sm text-white/80">You have {payments.filter(p => p.status === 'pending').length} pending payments that need attention.</div>
                  </div>
                )}
                
                {payments.filter(p => p.status === 'failed').length > 0 && (
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                    <div className="font-medium text-white mb-1">Failed Payments</div>
                    <div className="text-sm text-white/80">Review {payments.filter(p => p.status === 'failed').length} failed payments for retry or resolution.</div>
                  </div>
                )}
                
                {payments.length > 0 && (
                  <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
                    <div className="font-medium text-white mb-1">Payment Analytics</div>
                    <div className="text-sm text-white/80">View detailed payment analytics to optimize your cash flow.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        {/* Bottom Action Bar is now used instead */}
        
        {/* Mobile Collapsible Insights */}
        {filteredPayments.length > 0 && (
          <div className="px-4 space-y-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <button
                onClick={() => setShowMobileInsights(!showMobileInsights)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">Payment Insights</div>
                    <div className="text-xs text-white/60">Payment analysis</div>
                  </div>
                </div>
                <div className={`transform transition-transform ${showMobileInsights ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {showMobileInsights && (
                <div className="border-t border-white/20 p-4">
                  <PaymentInsightsPanel payments={filteredPayments} className="border-0 bg-transparent" />
                </div>
              )}
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                    <TrendingUp size={16} className="text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">Payment Analytics</div>
                    <div className="text-xs text-white/60">Charts and trends</div>
                  </div>
                </div>
                <div className={`transform transition-transform ${showAnalytics ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {showAnalytics && (
                <div className="border-t border-white/20 p-4">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-3 border border-blue-500/30">
                      <div className="text-xs text-blue-300 mb-1">This Month</div>
                      <div className="text-lg font-bold text-white">
                        ${payments.filter(p => new Date(p.paymentDate).getMonth() === new Date().getMonth())
                          .reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-3 border border-green-500/30">
                      <div className="text-xs text-green-300 mb-1">Completed</div>
                      <div className="text-lg font-bold text-white">
                        {payments.filter(p => p.status === 'Completed' || p.status === 'Paid').length}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAnalytics(false)}
                    className="w-full bg-blue-500/50 hover:bg-blue-600/50 text-white py-2 rounded-lg text-sm font-medium"
                  >
                    View Full Analytics
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Universal Search */}
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
          <div className="grid grid-cols-1 gap-4 px-4">
            {filteredPayments.map((payment: any, index: number) => (
              <LazyLoader key={payment._id}>
                <Phase3SwipeableCard
                  onEdit={() => console.log('Edit payment', payment._id)}
                  onDelete={() => handleDeletePayment(payment._id, payment.amount)}
                  onView={() => window.open(`/dashboard/payments/${payment._id}`, '_blank')}
                >
                  <FixedGlassyPaymentCard 
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
            <div 
              className="rounded-2xl p-8 shadow-lg border-2 border-white/20" 
              style={{
                background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px) saturate(180%)'
              }}
            >
              <div className="relative mb-8">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-white/20"
                  style={{
                    background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(20px) saturate(180%)'
                  }}
                >
                  <CreditCard size={48} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles size={12} className="text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-4">
                No Payments Yet
              </h3>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Start tracking your rental income by recording payments.
              </p>
            </div>
          </div>
        )}
      </div>
      {/* Bulk Actions */}
      <PaymentBulkActions
        selectedPayments={selectedPayments}
        payments={payments}
        onAction={(action, data) => {
          console.log('Bulk action:', action, data);
          switch (action) {
            case 'export':
              setShowExport(true);
              break;
            case 'receipt':
              alert(`Generating receipts for ${data.paymentIds.length} payments`);
              break;
            case 'notify':
              alert(`Sending notifications for ${data.paymentIds.length} payments`);
              break;
            case 'archive':
              alert(`Archiving ${data.paymentIds.length} payments`);
              break;
          }
        }}
        onClearSelection={() => setSelectedPayments([])}
      />
      
      {/* Smart Search Modal */}
      <PaymentCollapsibleSmartSearch
        isOpen={showSmartSearch}
        onClose={() => setShowSmartSearch(false)}
        onSearch={(query) => setSearchFilters({...searchFilters, query})}
        onFilterChange={(filters) => setSmartFilters({...smartFilters, ...filters})}
        showPending={showPending}
        showFailed={showFailed}
        showArchived={showArchived}
        onTogglePending={() => setShowPending(!showPending)}
        onToggleFailed={() => setShowFailed(!showFailed)}
        onToggleArchived={() => setShowArchived(!showArchived)}
      />

      {/* Modals */}
      <UniversalExport
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={payments}
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
      />
      
      <MonthlyCollectionSheet
        isOpen={showCollectionSheet}
        onClose={() => setShowCollectionSheet(false)}
      />
      
      <AgentHandoverModal
        isOpen={showAgentHandover}
        onClose={() => setShowAgentHandover(false)}
        onHandoverRecorded={(handover) => {
          // Refresh payments or handle handover record
          console.log('Agent handover recorded:', handover);
        }}
      />
      
      <PaymentCollectionHandoverModal
        isOpen={showPaymentHandover}
        onClose={() => setShowPaymentHandover(false)}
        onHandoverRecorded={(handover) => {
          console.log('Payment collection and handover recorded:', handover);
          queryClient.invalidateQueries(['payments']);
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
            <span className="ml-2">Add Payment</span>
          </button>
          
          <button
            onClick={() => {
              setShowPaymentHandover(true);
              setShowMobileActions(false);
            }}
            className="phase3-touch-btn-secondary w-full"
          >
            <Wallet size={20} />
            <span className="ml-2">Payment Collection and Handover</span>
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
              setShowExport(true);
              setShowMobileActions(false);
            }}
            className="phase3-touch-btn-secondary w-full"
          >
            <Download size={20} />
            <span className="ml-2">Export Payments</span>
          </button>
        </div>
      </Phase3BottomSheet>
      </div>
    </div>
  );
};

export default PaymentsPage;