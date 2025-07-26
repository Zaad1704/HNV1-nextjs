'use client';
import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import LazyLoader from '@/components/common/LazyLoader';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import Phase3MobileHeader from '@/components/mobile/Phase3MobileHeader';
import Phase3TabFilters, { getPropertyFilterTabs } from '@/components/mobile/Phase3TabFilters';
import Phase3BottomSheet from '@/components/mobile/Phase3BottomSheet';
import Phase3RightSidebar, { createAIInsightsSection } from '@/components/mobile/Phase3RightSidebar';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import { useBackgroundRefresh } from '@/hooks/useBackgroundRefresh';
import { Building2, Plus, DollarSign, Sparkles, Calendar, Download } from 'lucide-react';
import AddPropertyModal from '@/components/common/AddPropertyModal';
import EditPropertyModal from '@/components/common/EditPropertyModal';
import BulkPaymentModal from '@/components/common/BulkPaymentModal';
import UniversalExport from '@/components/common/UniversalExport';
import UniversalHeader from '@/components/common/UniversalHeader';
import BulkLeaseActions from '@/components/property/BulkLeaseActions';
import EnhancedAddPropertyButton from '@/components/property/EnhancedAddPropertyButton';
import SmartCollapsibleSearch from '@/components/property/SmartCollapsibleSearch';
import GesturePropertyCard from '@/components/property/GesturePropertyCard';
import FloatingActionMenu from '@/components/property/FloatingActionMenu';
import RealTimeActivityFeed from '@/components/property/RealTimeActivityFeed';
import GlassyRadialActionWheel from '@/components/property/GlassyRadialActionWheel';
import GlassySmartSuggestionsPanel from '@/components/property/GlassySmartSuggestionsPanel';
import FixedGlassyAIInsightsWidget from '@/components/property/FixedGlassyAIInsightsWidget';
import FixedGlassyPropertyCard from '@/components/property/FixedGlassyPropertyCard';
import { useCrossData } from '@/hooks/useCrossData';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';

const fetchProperties = async () => {
  try {
    const { data } = await apiClient.get('/properties');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    return [];
  }
};

const PropertiesPage = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { stats } = useCrossData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [showBulkMode, setShowBulkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [showBulkPayment, setShowBulkPayment] = useState(false);
  const [showUniversalExport, setShowUniversalExport] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showVacant, setShowVacant] = useState(false);
  const [showBulkLeaseActions, setShowBulkLeaseActions] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
    retry: 0,
    refetchOnWindowFocus: false,
  });
  
  const { data: allTenants = [] } = useQuery({
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

  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    
    return properties.filter((property: any) => {
      if (!property) return false;
      
      const isArchived = property.status === 'Archived';
      if (showArchived && !isArchived) return false;
      if (!showArchived && isArchived) return false;
      
      if (showVacant) {
        const propertyTenants = allTenants.filter((t: any) => t.propertyId === property._id && t.status === 'Active');
        const isVacant = propertyTenants.length === 0 || propertyTenants.length < (property.numberOfUnits || 1);
        if (!isVacant) return false;
      }
      
      const matchesSearch = !searchQuery || 
        (property.name && property.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (property.address?.formattedAddress && property.address.formattedAddress.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = !filters.status || property.status === filters.status;
      const matchesUnits = !filters.units || 
        (filters.units === 'single' && property.numberOfUnits === 1) ||
        (filters.units === 'multiple' && property.numberOfUnits > 1);
      
      return matchesSearch && matchesStatus && matchesUnits;
    });
  }, [properties, searchQuery, filters, showArchived, showVacant, allTenants]);

  const handlePropertyAdded = (newProperty: any) => {
    queryClient.setQueryData(['properties'], (old: any) => [...(old || []), newProperty]);
  };

  const handlePropertyUpdated = (updatedProperty: any) => {
    queryClient.setQueryData(['properties'], (old: any) => 
      (old || []).map((p: any) => p._id === updatedProperty._id ? updatedProperty : p)
    );
  };

  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setShowEditModal(true);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      removeOptimistic(propertyId);
      try {
        await apiClient.delete(`/properties/${propertyId}`);
        alert('Property deleted successfully!');
      } catch (error: any) {
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        alert(`Error: ${error.response?.data?.message || 'Failed to delete property'}`);
      }
    }
  };

  const handleArchiveProperty = async (propertyId: string) => {
    const property = properties.find(p => p._id === propertyId);
    if (!property) return;
    
    const isArchiving = property.status !== 'Archived';
    try {
      await apiClient.put(`/properties/${propertyId}`, {
        status: isArchiving ? 'Archived' : 'Active'
      });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      alert(`Property ${isArchiving ? 'archived' : 'restored'} successfully!`);
    } catch (error) {
      alert('Failed to update property status');
    }
  };

  const handlePropertySelect = (propertyId: string, selected: boolean) => {
    if (selected) {
      setSelectedProperties(prev => [...prev, propertyId]);
    } else {
      setSelectedProperties(prev => prev.filter(id => id !== propertyId));
    }
  };

  const { addOptimistic, updateOptimistic, removeOptimistic } = useOptimisticUpdate(['properties'], properties);
  useBackgroundRefresh([['properties']], 60000);

  if (isLoading) {
    return <SkeletonLoader type="card" count={6} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center backdrop-blur-md bg-black/20 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-red-600/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Unable to Load Properties</h2>
          <p className="text-gray-300 mb-4">We're having trouble connecting to our servers.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600/80 hover:bg-blue-500/80 text-white rounded-xl font-semibold transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative space-y-8 p-6">
        {/* Real-time Activity Feed */}
        <RealTimeActivityFeed properties={properties} tenants={allTenants} />

        {/* Smart Suggestions Panel */}
        <GlassySmartSuggestionsPanel properties={properties} tenants={allTenants} />

        {/* Desktop Header */}
        <div className="hidden md:block">
          <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-2xl shadow-2xl p-6">
            <UniversalHeader
              title={t('dashboard.properties')}
              subtitle={`${t('property.manage_portfolio')} (${filteredProperties.length} properties)`}
              icon={Building2}
              stats={[
                { label: 'Total', value: stats?.totalProperties || 0, color: 'blue' },
                { label: 'Active', value: properties.filter(p => p.status !== 'Archived').length, color: 'green' },
                { label: 'Occupancy', value: `${stats?.occupancyRate || 0}%`, color: 'purple' },
                { label: 'Archived', value: properties.filter(p => p.status === 'Archived').length, color: 'yellow' }
              ]}
              actions={
                <div className="flex items-center gap-4">
                  <GlassyRadialActionWheel
                    onBulkPayment={() => setShowBulkPayment(true)}
                    onBulkLeaseActions={() => setShowBulkLeaseActions(true)}
                    onExport={() => setShowUniversalExport(true)}
                  />
                  <EnhancedAddPropertyButton
                    onClick={() => setShowAddModal(true)}
                  />
                </div>
              }
            />
          </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <Phase3MobileHeader
            title="Properties"
            count={filteredProperties.length}
            stats={[
              { label: 'Active', value: properties.filter(p => p.status !== 'Archived').length, color: 'green' },
              { label: 'Occupied', value: `${stats?.occupancyRate || 0}%`, color: 'purple' }
            ]}
            onExport={() => setShowUniversalExport(true)}
            onQuickAction={() => setShowBulkPayment(true)}
            onFilter={() => setShowMobileFilters(!showMobileFilters)}
            showFilters={showMobileFilters}
            activeFiltersCount={[showVacant, showArchived, showBulkMode].filter(Boolean).length}
          />
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="phase3-desktop-layout">
            <div className="phase3-main-content space-y-6">
              {/* Smart Search */}
              <div className="flex justify-start">
                <SmartCollapsibleSearch
                  onSearch={setSearchQuery}
                  onFilterChange={setFilters}
                  showVacant={showVacant}
                  showArchived={showArchived}
                  onToggleVacant={() => setShowVacant(!showVacant)}
                  onToggleArchived={() => setShowArchived(!showArchived)}
                />
              </div>

              {/* Properties Grid */}
              {filteredProperties && filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties.map((property: any, index: number) => (
                    <LazyLoader key={property._id}>
                      <GesturePropertyCard
                        property={property}
                        onEdit={() => handleEditProperty(property)}
                        onDelete={() => handleDeleteProperty(property._id)}
                        onView={() => window.open(`/dashboard/properties/${property._id}`, '_blank')}
                        onArchive={() => handleArchiveProperty(property._id)}
                        onPayment={() => setShowBulkPayment(true)}
                      >
                        <FixedGlassyPropertyCard 
                          property={property} 
                          index={index}
                          onEdit={handleEditProperty}
                          onDelete={handleDeleteProperty}
                          showCheckbox={showBulkMode}
                          isSelected={selectedProperties.includes(property._id)}
                          onSelect={handlePropertySelect}
                        />
                      </GesturePropertyCard>
                    </LazyLoader>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-2xl p-12 shadow-2xl max-w-lg mx-auto">
                    <div className="relative mb-8">
                      <div className="w-32 h-32 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto shadow-2xl border border-white/10">
                        <Building2 size={64} className="text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                        <Sparkles size={16} className="text-white" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">
                      {showArchived ? 'No Archived Properties' : 'No Properties Yet'}
                    </h3>
                    <p className="text-gray-300 mb-10 text-lg leading-relaxed">
                      {showArchived 
                        ? 'No properties have been archived yet.'
                        : 'Start building your property portfolio by adding your first property.'
                      }
                    </p>
                    {!showArchived && (
                      <EnhancedAddPropertyButton
                        onClick={() => setShowAddModal(true)}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Sidebar with Fixed AI Insights */}
            <Phase3RightSidebar
              sections={[
                createAIInsightsSection(
                  <FixedGlassyAIInsightsWidget 
                    properties={properties}
                    tenants={allTenants}
                  />,
                  true
                )
              ]}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          <div className="px-4">
            <SmartCollapsibleSearch
              onSearch={setSearchQuery}
              onFilterChange={setFilters}
              showVacant={showVacant}
              showArchived={showArchived}
              onToggleVacant={() => setShowVacant(!showVacant)}
              onToggleArchived={() => setShowArchived(!showArchived)}
            />
          </div>

          {filteredProperties && filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 px-4">
              {filteredProperties.map((property: any, index: number) => (
                <LazyLoader key={property._id}>
                  <GesturePropertyCard
                    property={property}
                    onEdit={() => handleEditProperty(property)}
                    onDelete={() => handleDeleteProperty(property._id)}
                    onView={() => window.open(`/dashboard/properties/${property._id}`, '_blank')}
                    onArchive={() => handleArchiveProperty(property._id)}
                    onPayment={() => setShowBulkPayment(true)}
                  >
                    <FixedGlassyPropertyCard 
                      property={property} 
                      index={index}
                      onEdit={handleEditProperty}
                      onDelete={handleDeleteProperty}
                      showCheckbox={showBulkMode}
                      isSelected={selectedProperties.includes(property._id)}
                      onSelect={handlePropertySelect}
                    />
                  </GesturePropertyCard>
                </LazyLoader>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-4">
              <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto shadow-2xl border border-white/10">
                    <Building2 size={48} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles size={12} className="text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {showArchived ? 'No Archived Properties' : 'No Properties Yet'}
                </h3>
                <p className="text-gray-300 mb-8 leading-relaxed">
                  {showArchived 
                    ? 'No properties have been archived yet.'
                    : 'Start building your property portfolio.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Menu */}
        <FloatingActionMenu
          onAddProperty={() => setShowAddModal(true)}
          onBulkPayment={() => setShowBulkPayment(true)}
          onBulkLeaseActions={() => setShowBulkLeaseActions(true)}
          onExport={() => setShowUniversalExport(true)}
          onSearch={() => {}}
          onAnalytics={() => {}}
        />

        {/* Modals */}
        <AddPropertyModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onPropertyAdded={handlePropertyAdded}
        />

        <EditPropertyModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProperty(null);
          }}
          onPropertyUpdated={handlePropertyUpdated}
          property={editingProperty}
        />

        <BulkPaymentModal
          isOpen={showBulkPayment}
          onClose={() => setShowBulkPayment(false)}
        />
        
        <UniversalExport
          isOpen={showUniversalExport}
          onClose={() => setShowUniversalExport(false)}
          data={filteredProperties}
          filename="properties"
          title="Properties Report"
          organizationName={user?.organization?.name || "Your Organization"}
        />
        
        <BulkLeaseActions
          isOpen={showBulkLeaseActions}
          onClose={() => setShowBulkLeaseActions(false)}
          selectedProperties={filteredProperties.filter(p => selectedProperties.includes(p._id))}
          onAction={async (action, data) => {
            try {
              queryClient.invalidateQueries({ queryKey: ['properties'] });
              queryClient.invalidateQueries({ queryKey: ['tenants'] });
              setShowBulkLeaseActions(false);
            } catch (error) {
              alert('Failed to complete bulk lease action');
            }
          }}
        />
      </div>
    </div>
  );
};

export default PropertiesPage;