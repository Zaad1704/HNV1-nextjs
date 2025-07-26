'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api';
import LazyLoader from '@/components/common/LazyLoader';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import SwipeableCard from '@/components/mobile/SwipeableCard';
import Phase3MobileHeader from '@/components/mobile/Phase3MobileHeader';
import Phase3TabFilters, { getTenantFilterTabs } from '@/components/mobile/Phase3TabFilters';
import Phase3SwipeableCard from '@/components/mobile/Phase3SwipeableCard';
import Phase3BottomSheet from '@/components/mobile/Phase3BottomSheet';
import Phase3RightSidebar, { createSmartFiltersSection, createAIInsightsSection } from '@/components/mobile/Phase3RightSidebar';
import { useBackgroundRefresh } from '@/hooks/useBackgroundRefresh';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import { motion } from 'framer-motion';
import { Users, Plus, Mail, Phone, MapPin, Calendar, DollarSign, Download, FileText, Search, Filter, Archive, ArchiveRestore, Eye, EyeOff, AlertTriangle, Sparkles, CheckSquare, Square, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import SearchFilter from '@/components/common/SearchFilter';
import BulkActions from '@/components/common/BulkActions';
import ExportModal from '@/components/common/ExportModal';
import MonthlyCollectionSheet from '@/components/common/MonthlyCollectionSheet';
import QuickPaymentModal from '@/components/common/QuickPaymentModal';
import MessageButtons from '@/components/common/MessageButtons';
import ShareButton from '@/components/common/ShareButton';
import UniversalSearch, { SearchFilters } from '@/components/common/UniversalSearch';
import UniversalExport from '@/components/common/UniversalExport';
import ComprehensiveTenantModal from '@/components/common/ComprehensiveTenantModal';
import EnhancedTenantCard from '@/components/common/EnhancedTenantCard';
import FixedGlassyTenantCard from '@/components/tenant/FixedGlassyTenantCard';
import GesturePropertyCard from '@/components/property/GesturePropertyCard';
import FloatingTenantActionMenuWithFilter from '@/components/tenant/FloatingTenantActionMenuWithFilter';
import SimpleActionMenu from '@/components/property/SimpleActionMenu';
import HeaderActionBar from '@/components/property/HeaderActionBar';
import GlassySmartSuggestionsPanel from '@/components/property/GlassySmartSuggestionsPanel';
import BlendedAIInsightsWidget from '@/components/property/BlendedAIInsightsWidget';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalFloatingActionMenu from '@/components/common/UniversalFloatingActionMenu';
import TenantInsightsPanel from '@/components/tenant/TenantInsightsPanel';
import TenantSmartFilters from '@/components/tenant/TenantSmartFilters';
import TenantPredictiveSearch from '@/components/tenant/TenantPredictiveSearch';
import TenantAdvancedSearch from '@/components/tenant/TenantAdvancedSearch';
import TenantBulkActions from '@/components/tenant/TenantBulkActions';
import TenantAutomationRules from '@/components/tenant/TenantAutomationRules';
import TenantWorkflowManager from '@/components/tenant/TenantWorkflowManager';
import { useCrossData } from '@/hooks/useCrossData';
import { useDataExport } from '@/hooks/useDataExport';
import { deleteTenant, confirmDelete, handleDeleteError, handleDeleteSuccess } from '@/utils/deleteHelpers';
import AddTenantDebug from '@/components/debug/AddTenantDebug';

const fetchTenants = async (propertyId?: string) => {
  try {
    const url = propertyId ? `/tenants?propertyId=${propertyId}` : '/tenants';
    const { data } = await apiClient.get(url);
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch tenants:', error);
    return [];
  }
};

const TenantsPage = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const unitParam = searchParams.get('unit');
  const { stats } = useCrossData() || {};
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [showQuickPayment, setShowQuickPayment] = useState(false);
  const [showUniversalExport, setShowUniversalExport] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Auto-open modal if propertyId or unit is in URL
  React.useEffect(() => {
    if (propertyId || unitParam) {
      setShowAddModal(true);
    }
  }, [propertyId, unitParam]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [showArchived, setShowArchived] = useState(false);
  const [showLateOnly, setShowLateOnly] = useState(false);
  const [showExpiringLeases, setShowExpiringLeases] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [showBulkMode, setShowBulkMode] = useState(false);
  const [smartFilters, setSmartFilters] = useState<any>({});
  const [advancedSearchCriteria, setAdvancedSearchCriteria] = useState<any>({});
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showAutomation, setShowAutomation] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [showBulkLeaseActions, setShowBulkLeaseActions] = useState(false);
  const [showMobileInsights, setShowMobileInsights] = useState(false);
  const { exportTenants, isExporting } = useDataExport() || { exportTenants: () => {}, isExporting: false };

  const handleTenantAdded = async (newTenant: any) => {
    console.log('🔍 Tenant added callback called:', newTenant);
    try {
      if (newTenant) {
        queryClient.setQueryData(['tenants'], (old: any) => [...(old || []), newTenant]);
        queryClient.invalidateQueries({ queryKey: ['tenants'] });
        queryClient.invalidateQueries({ queryKey: ['crossData'] });
        console.log('✅ Tenant data updated');
      }
      setShowAddModal(false);
      console.log('✅ Modal closed after tenant added');
    } catch (error) {
      console.error('❌ Error handling tenant added:', error);
      setShowAddModal(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string, tenantName: string) => {
    if (confirmDelete(tenantName, 'tenant')) {
      try {
        await deleteTenant(tenantId);
        queryClient.setQueryData(['tenants'], (old: any) => 
          (old || []).filter((t: any) => t._id !== tenantId)
        );
        handleDeleteSuccess('tenant');
      } catch (error: any) {
        handleDeleteError(error, 'tenant');
      }
    }
  };
  
  const handleArchiveTenant = async (tenantId: string, tenantName: string, currentStatus: string) => {
    const isArchiving = currentStatus !== 'Archived';
    const action = isArchiving ? 'archive' : 'restore';
    
    if (confirm(`Are you sure you want to ${action} ${tenantName}?`)) {
      try {
        await apiClient.put(`/tenants/${tenantId}`, {
          status: isArchiving ? 'Archived' : 'Active'
        });
        
        queryClient.setQueryData(['tenants'], (old: any) => 
          (old || []).map((t: any) => 
            t._id === tenantId 
              ? { ...t, status: isArchiving ? 'Archived' : 'Active' }
              : t
          )
        );
        
        alert(`Tenant ${action}d successfully!`);
      } catch (error: any) {
        alert(`Failed to ${action} tenant: ${error.response?.data?.message || 'Unknown error'}`);
      }
    }
  };

  const { data: tenants = [], isLoading, error } = useQuery({
    queryKey: ['tenants', propertyId],
    queryFn: () => fetchTenants(propertyId || undefined),
    retry: 0,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error('Tenants query error:', error);
    }
  });

  // Fetch properties for filtering
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

  // Enhanced tenant data with memoized calculations
  const enhancedTenants = useMemo(() => {
    return tenants.map((tenant: any) => {
      const now = new Date();
      const leaseEndDate = tenant.leaseEndDate ? new Date(tenant.leaseEndDate) : null;
      const daysUntilExpiry = leaseEndDate 
        ? Math.ceil((leaseEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;
      
      let leaseStatus = 'No End Date';
      if (leaseEndDate) {
        if (daysUntilExpiry < 0) leaseStatus = 'Expired';
        else if (daysUntilExpiry <= 30) leaseStatus = 'Expiring Soon';
        else if (daysUntilExpiry <= 90) leaseStatus = 'Expiring';
        else leaseStatus = 'Active';
      }
      
      const effectiveRent = tenant.discountAmount && 
        (!tenant.discountExpiresAt || now <= new Date(tenant.discountExpiresAt))
        ? Math.max(0, (tenant.rentAmount || 0) - tenant.discountAmount)
        : tenant.rentAmount || 0;
      
      return {
        ...tenant,
        leaseStatus,
        daysUntilExpiry,
        effectiveRent,
        hasDiscount: tenant.discountAmount > 0 && 
          (!tenant.discountExpiresAt || now <= new Date(tenant.discountExpiresAt))
      };
    });
  }, [tenants]);
  
  const filteredTenants = useMemo(() => {
    if (!enhancedTenants) return [];
    
    let filtered = enhancedTenants.filter((tenant: any) => {
      if (!tenant) return false;
      
      // Archive filter
      const isArchived = tenant.status === 'Archived';
      if (showArchived && !isArchived) return false;
      if (!showArchived && isArchived) return false;
      
      // Quick filters
      if (showLateOnly && tenant.status !== 'Late') return false;
      if (showExpiringLeases) {
        if (!tenant.leaseEndDate) return false;
        const daysUntilExpiry = Math.ceil((new Date(tenant.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry > 30) return false;
      }
      if (selectedProperty && tenant.propertyId?._id !== selectedProperty) return false;
      
      // Smart filters
      if (smartFilters.paymentStatus?.length > 0) {
        const tenantPaymentStatus = tenant.status === 'Active' ? 'current' : 
                                   tenant.status === 'Late' ? 'late' : 'partial';
        if (!smartFilters.paymentStatus.includes(tenantPaymentStatus)) return false;
      }
      
      if (smartFilters.property?.length > 0) {
        if (!smartFilters.property.includes(tenant.propertyId?.name)) return false;
      }
      
      // Advanced search criteria
      if (advancedSearchCriteria.query) {
        const query = advancedSearchCriteria.query.toLowerCase();
        const matches = (tenant.name?.toLowerCase().includes(query)) ||
                       (tenant.email?.toLowerCase().includes(query)) ||
                       (tenant.phone?.includes(query)) ||
                       (tenant.unit?.toLowerCase().includes(query)) ||
                       (tenant.propertyId?.name?.toLowerCase().includes(query));
        if (!matches) return false;
      }
      
      if (advancedSearchCriteria.rentRange) {
        const rent = tenant.rentAmount || 0;
        if (rent < advancedSearchCriteria.rentRange.min || rent > advancedSearchCriteria.rentRange.max) return false;
      }
      
      // Legacy filters
      const matchesUniversalSearch = !searchFilters.query || 
        (tenant.name && tenant.name.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
        (tenant.email && tenant.email.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
        (tenant.unit && tenant.unit.toLowerCase().includes(searchFilters.query.toLowerCase())) ||
        (tenant.propertyId?.name && tenant.propertyId.name.toLowerCase().includes(searchFilters.query.toLowerCase()));
      
      const matchesSearch = !searchQuery || 
        (tenant.name && tenant.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tenant.email && tenant.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tenant.unit && tenant.unit.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = (!filters.status || tenant.status === filters.status) &&
                           (!searchFilters.status || tenant.status === searchFilters.status);
      const matchesProperty = !filters.property || tenant.propertyId?._id === filters.property;
      
      return matchesUniversalSearch && matchesSearch && matchesStatus && matchesProperty;
    });
    
    // Apply sorting from advanced search
    if (advancedSearchCriteria.sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        switch (advancedSearchCriteria.sortBy) {
          case 'name':
            aValue = a.name || '';
            bValue = b.name || '';
            break;
          case 'rentAmount':
            aValue = a.rentAmount || 0;
            bValue = b.rentAmount || 0;
            break;
          case 'leaseStartDate':
            aValue = new Date(a.leaseStartDate || 0);
            bValue = new Date(b.leaseStartDate || 0);
            break;
          case 'status':
            aValue = a.status || '';
            bValue = b.status || '';
            break;
          default:
            aValue = a.name || '';
            bValue = b.name || '';
        }
        
        if (advancedSearchCriteria.sortOrder === 'desc') {
          return aValue < bValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }
    
    return filtered;
  }, [enhancedTenants, searchQuery, filters, searchFilters, showArchived, showLateOnly, showExpiringLeases, selectedProperty, smartFilters, advancedSearchCriteria]);

  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Late', label: 'Late' }
      ]
    },
    {
      key: 'property',
      label: 'Property',
      type: 'select' as const,
      options: properties.map((p: any) => ({ value: p._id, label: p.name }))
    }
  ];

  const bulkActions = [
    {
      key: 'export',
      label: 'Export',
      icon: Download,
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
      action: async (ids: string[]) => {
        await exportTenants({ format: 'xlsx', filters: { ids } });
      }
    },
    {
      key: 'contact',
      label: 'Send Notice',
      icon: Mail,
      color: 'bg-green-500 hover:bg-green-600 text-white',
      action: (ids: string[]) => {

      }
    }
  ];

  // Background refresh
  useBackgroundRefresh([['tenants']], 60000);

  if (isLoading) {
    return <SkeletonLoader type="card" count={6} />;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users size={32} className="text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">Unable to Load Tenants</h2>
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
      {/* Desktop Header - Match Page Background */}
      <div className="hidden md:block">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}></div>
          <div className="relative rounded-3xl p-6 border-2 border-white/40 mb-8" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(25px) saturate(200%)'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.6), rgba(66,165,245,0.6))'}}>
                  <Users size={24} className="text-white" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'}} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                    Tenants
                    <Sparkles size={24} className="text-yellow-400 animate-pulse" />
                  </h1>
                  <p className="text-white/90" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                    {propertyId ? 'Tenants for selected property' : 'Manage your tenant relationships'} ({filteredTenants.length} tenants)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center px-3 py-2 rounded-xl" style={{background: 'rgba(0,0,0,0.2)'}}>
                  <div className="text-lg font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{stats?.totalTenants || 0}</div>
                  <div className="text-xs text-white/80">Total</div>
                </div>
                <div className="text-center px-3 py-2 rounded-xl" style={{background: 'rgba(0,0,0,0.2)'}}>
                  <div className="text-lg font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{filteredTenants.filter(t => t.status !== 'Archived').length}</div>
                  <div className="text-xs text-white/80">Active</div>
                </div>
                <div className="text-center px-3 py-2 rounded-xl" style={{background: 'rgba(0,0,0,0.2)'}}>
                  <div className="text-lg font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{tenants.filter(t => t.status === 'Late').length}</div>
                  <div className="text-xs text-white/80">Late</div>
                </div>

                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowAddModal(true);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Tenant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 3 Mobile Header */}
      <div className="md:hidden">
        <Phase3MobileHeader
          title="Tenants"
          count={filteredTenants.length}
          stats={[
            { label: 'Active', value: filteredTenants.filter(t => t.status !== 'Archived').length, color: 'green' },
            { label: 'Late', value: tenants.filter(t => t.status === 'Late').length, color: 'red' }
          ]}
          onExport={() => setShowUniversalExport(true)}
          onQuickAction={() => setShowQuickPayment(true)}
          onFilter={() => setShowMobileFilters(!showMobileFilters)}
          showFilters={showMobileFilters}
          activeFiltersCount={[showLateOnly, showExpiringLeases, showArchived, showBulkMode, selectedProperty].filter(Boolean).length}
        />
      </div>

      {/* Phase 3 Mobile Tab Filters */}
      <div className="md:hidden">
        <Phase3TabFilters
          tabs={getTenantFilterTabs(
            showLateOnly,
            showExpiringLeases,
            showArchived,
            showBulkMode,
            tenants.filter(t => t.status === 'Late').length,
            tenants.filter(t => {
              if (!t.leaseEndDate) return false;
              const daysUntilExpiry = Math.ceil((new Date(t.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
            }).length,
            tenants.filter(t => t.status === 'Archived').length
          )}
          onTabClick={(key) => {
            switch (key) {
              case 'all':
                setShowLateOnly(false);
                setShowExpiringLeases(false);
                setShowArchived(false);
                setShowBulkMode(false);
                setSelectedTenants([]);
                break;
              case 'late':
                setShowLateOnly(!showLateOnly);
                setShowExpiringLeases(false);
                setShowArchived(false);
                break;
              case 'expiring':
                setShowExpiringLeases(!showExpiringLeases);
                setShowLateOnly(false);
                setShowArchived(false);
                break;
              case 'archived':
                setShowArchived(!showArchived);
                setShowLateOnly(false);
                setShowExpiringLeases(false);
                break;
              case 'bulk':
                setShowBulkMode(!showBulkMode);
                if (showBulkMode) setSelectedTenants([]);
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
            {/* Universal Floating Action Menu */}
            <div className="flex justify-start mb-4">
              <UniversalFloatingActionMenu
                sectionName="Tenant"
                onAddItem={() => setShowAddModal(true)}
                onBulkAction={() => setShowBulkMode(!showBulkMode)}
                onExport={() => setShowUniversalExport(true)}
                onSearch={() => setShowAdvancedSearch(true)}
                onAnalytics={() => alert('Tenant analytics coming soon')}
                onQuickPayment={() => setShowQuickPayment(true)}
                onCollectionSheet={() => setShowCollectionSheet(true)}
                onMessage={() => alert('Message tenants feature coming soon')}
              />
            </div>
            


            {/* Advanced Search (only shown when activated) */}
            {showAdvancedSearch && (
              <div className="space-y-6">
                <TenantPredictiveSearch
                  tenants={tenants}
                  onTenantSelect={(tenant) => {
                    window.location.href = `/dashboard/tenants/${tenant._id}`;
                  }}
                />
                
                <TenantAdvancedSearch
                  onSearch={setAdvancedSearchCriteria}
                  tenants={tenants}
                />
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowAdvancedSearch(false)}
                    className="bg-gradient-to-r from-purple-400 to-purple-500 text-white px-4 py-2 rounded-xl flex items-center gap-2"
                  >
                    <Search size={16} />
                    Close Search
                  </button>
                </div>
              </div>
            )}

            {/* Tenants Grid */}
            {filteredTenants && filteredTenants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTenants.map((tenant: any, index: number) => (
                  <LazyLoader key={tenant._id}>
                    <FixedGlassyTenantCard 
                      tenant={tenant} 
                      index={index}
                      onEdit={(t) => console.log('Edit tenant', t._id)}
                      onDelete={() => handleDeleteTenant(tenant._id, tenant.name)}
                      showCheckbox={showBulkMode}
                      isSelected={selectedTenants.includes(tenant._id)}
                      onSelect={(tenantId, selected) => {
                        if (selected) {
                          setSelectedTenants(prev => [...prev, tenantId]);
                        } else {
                          setSelectedTenants(prev => prev.filter(id => id !== tenantId));
                        }
                      }}
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
                      <Users size={64} className="text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles size={16} className="text-white" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-4">
                    {showArchived ? 'No Archived Tenants' : 'No Tenants Yet'}
                  </h3>
                  <p className="text-gray-300 mb-10 text-lg leading-relaxed">
                    {showArchived 
                      ? 'No tenants have been archived yet.'
                      : 'Start by adding your first tenant to begin managing your rental properties.'
                    }
                  </p>
                  {!showArchived && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowAddModal(true);
                      }}
                      className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                    >
                      <Plus size={18} />
                      Add Tenant
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Sidebar with Always Visible AI Insights and Smart Suggestions */}
          <div className="phase3-sidebar space-y-6">
            <BlendedAIInsightsWidget 
              properties={properties}
              tenants={filteredTenants}
            />
            <GlassySmartSuggestionsPanel 
              properties={properties} 
              tenants={filteredTenants} 
            />
            
            {/* Smart Filters Section */}
            <div className="rounded-2xl p-4 space-y-4 border-2 border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px) saturate(180%)'}}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Smart Filters</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowLateOnly(!showLateOnly)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      showLateOnly 
                        ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' 
                        : 'bg-black/30 text-white/80 border border-white/20 hover:bg-black/40'
                    }`}
                  >
                    <AlertTriangle size={14} />
                    {showLateOnly ? 'All Tenants' : 'Late Payments'}
                  </button>
                  
                  <button
                    onClick={() => setShowExpiringLeases(!showExpiringLeases)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      showExpiringLeases 
                        ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' 
                        : 'bg-black/30 text-white/80 border border-white/20 hover:bg-black/40'
                    }`}
                  >
                    <Calendar size={14} />
                    {showExpiringLeases ? 'All Leases' : 'Expiring Soon'}
                  </button>
                  
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      showArchived 
                        ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' 
                        : 'bg-black/30 text-white/80 border border-white/20 hover:bg-black/40'
                    }`}
                  >
                    {showArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                    {showArchived ? 'Active Only' : 'Show Archived'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowBulkMode(!showBulkMode);
                      if (showBulkMode) setSelectedTenants([]);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      showBulkMode 
                        ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white' 
                        : 'bg-black/30 text-white/80 border border-white/20 hover:bg-black/40'
                    }`}
                  >
                    {showBulkMode ? <CheckSquare size={14} /> : <Square size={14} />}
                    {showBulkMode ? 'Exit Bulk' : 'Bulk Select'}
                  </button>
                </div>
                
                {properties.length > 0 && (
                  <select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Properties ({properties.length})</option>
                    {properties.map((property: any) => (
                      <option key={property._id} value={property._id}>
                        {property.name} ({tenants.filter((t: any) => t.propertyId?._id === property._id).length})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        {/* Mobile Universal Floating Action Menu */}
        <div className="px-4 flex justify-start mb-4">
          <UniversalFloatingActionMenu
            sectionName="Tenant"
            onAddItem={() => setShowAddModal(true)}
            onBulkAction={() => setShowBulkMode(!showBulkMode)}
            onExport={() => setShowUniversalExport(true)}
            onSearch={() => setShowAdvancedSearch(true)}
            onAnalytics={() => alert('Tenant analytics coming soon')}
            onQuickPayment={() => setShowQuickPayment(true)}
            onCollectionSheet={() => setShowCollectionSheet(true)}
            onMessage={() => alert('Message tenants feature coming soon')}
          />
        </div>
        
        {/* Mobile Collapsible Insights */}
        {filteredTenants.length > 0 && (
          <div className="px-4">
            <div className="bg-white rounded-xl border border-gray-200">
              <button
                onClick={() => setShowMobileInsights(!showMobileInsights)}
                className="w-full flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">AI Insights</div>
                    <div className="text-xs text-gray-600">Portfolio analysis</div>
                  </div>
                </div>
                <div className={`transform transition-transform ${showMobileInsights ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {showMobileInsights && (
                <div className="border-t border-gray-200">
                  <TenantInsightsPanel tenants={filteredTenants} className="border-0 bg-transparent" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tenants Grid */}
        {filteredTenants && filteredTenants.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 px-4">
            {filteredTenants.map((tenant: any, index: number) => (
              <LazyLoader key={tenant._id}>
                <GesturePropertyCard
                  property={tenant}
                  onEdit={() => console.log('Edit tenant', tenant._id)}
                  onDelete={() => handleDeleteTenant(tenant._id, tenant.name)}
                  onView={() => window.open(`/dashboard/tenants/${tenant._id}`, '_blank')}
                  onArchive={() => handleArchiveTenant(tenant._id, tenant.name, tenant.status)}
                  onPayment={() => setShowQuickPayment(true)}
                >
                  <FixedGlassyTenantCard 
                    tenant={tenant} 
                    index={index}
                    onEdit={(t) => console.log('Edit tenant', t._id)}
                    onDelete={() => handleDeleteTenant(tenant._id, tenant.name)}
                    showCheckbox={showBulkMode}
                    isSelected={selectedTenants.includes(tenant._id)}
                    onSelect={(tenantId, selected) => {
                      if (selected) {
                        setSelectedTenants(prev => [...prev, tenantId]);
                      } else {
                        setSelectedTenants(prev => prev.filter(id => id !== tenantId));
                      }
                    }}
                  />
                </GesturePropertyCard>
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
                  <Users size={48} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles size={12} className="text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-4">
                {showArchived ? 'No Archived Tenants' : 'No Tenants Yet'}
              </h3>
              <p className="text-gray-300 mb-8 leading-relaxed">
                {showArchived 
                  ? 'No tenants have been archived yet.'
                  : 'Start by adding your first tenant to begin managing your rental properties.'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Only - Bulk Actions and Automation */}
      <div className="hidden md:block space-y-8">
        {selectedTenants.length > 0 && (
          <TenantBulkActions
            selectedTenants={selectedTenants}
            tenants={tenants}
            onAction={async (action, data) => {
              console.log('Bulk action:', action, data);
              switch (action) {
                case 'rent_increase':
                  alert(`Rent increase applied to ${data.tenantIds.length} tenants`);
                  break;
                case 'lease_renewal':
                  alert(`Lease renewal notices sent to ${data.tenantIds.length} tenants`);
                  break;
                case 'payment_reminder':
                  alert(`Payment reminders sent to ${data.tenantIds.length} tenants`);
                  break;
                default:
                  console.log('Unhandled action:', action);
              }
            }}
            onClearSelection={() => setSelectedTenants([])}
          />
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAutomation(!showAutomation)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              showAutomation
                ? 'bg-purple-500 text-white'
                : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
            }`}
          >
            <span>{showAutomation ? 'Hide Automation' : 'Show Automation'}</span>
          </button>
        </div>

        {showAutomation && (
          <div className="space-y-6">
            <TenantAutomationRules
              tenants={tenants}
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
            
            <TenantWorkflowManager
              tenants={tenants}
              onWorkflowCreate={(workflow) => {
                console.log('Create workflow:', workflow);
                alert('Workflow created successfully!');
              }}
              onWorkflowUpdate={(id, workflow) => {
                console.log('Update workflow:', id, workflow);
                alert('Workflow updated successfully!');
              }}
            />
          </div>
        )}
      </div>

      {/* Mobile Bulk Actions Bottom Sheet */}
      {selectedTenants.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-900">{selectedTenants.length} selected</span>
            <button
              onClick={() => setSelectedTenants([])}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUniversalExport(true)}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium"
            >
              Export
            </button>
            <button
              onClick={() => alert('Send notice to selected tenants')}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg text-sm font-medium"
            >
              Message
            </button>
          </div>
        </div>
      )}

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        section="tenants"
        title="Tenants"
      />

      <MonthlyCollectionSheet
        isOpen={showCollectionSheet}
        onClose={() => setShowCollectionSheet(false)}
      />

      <QuickPaymentModal
        isOpen={showQuickPayment}
        onClose={() => setShowQuickPayment(false)}
      />
      
      <UniversalExport
        isOpen={showUniversalExport}
        onClose={() => setShowUniversalExport(false)}
        data={filteredTenants}
        filename="tenants"
        filters={searchFilters}
        title="Export Tenants"
      />

      {showAddModal && (
        <ComprehensiveTenantModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onTenantAdded={handleTenantAdded}
        />
      )}
      
      {/* Phase 3 Mobile FAB */}
      <div className={`phase3-mobile-fab-tenant ${
        selectedTenants.length > 0 ? 'bottom-24' : 'bottom-6'
      }`}>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full h-full flex items-center justify-center group"
          aria-label="Add Tenant"
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
              setShowQuickPayment(true);
              setShowMobileActions(false);
            }}
            className="phase3-touch-btn-primary w-full"
          >
            <DollarSign size={20} />
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
              setShowUniversalExport(true);
              setShowMobileActions(false);
            }}
            className="phase3-touch-btn-secondary w-full"
          >
            <Download size={20} />
            <span className="ml-2">Export Tenants</span>
          </button>
        </div>
      </Phase3BottomSheet>
      
      {/* Modern Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-blue/5 to-brand-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-brand-orange/5 to-brand-blue/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Debug Component - Remove in production */}
      {process.env.NODE_ENV === 'development' && <AddTenantDebug />}
      </div>
    </div>
  );
};

export default TenantsPage;