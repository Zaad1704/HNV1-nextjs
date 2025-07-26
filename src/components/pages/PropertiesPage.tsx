'use client';
import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import LazyLoader from '@/components/common/LazyLoader';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';
import { useBackgroundRefresh } from '@/hooks/useBackgroundRefresh';
import { Building2, Plus, DollarSign, Sparkles, Calendar, Download, Users, Search, TrendingUp } from 'lucide-react';
import AddPropertyModal from '@/components/common/AddPropertyModal';
import EditPropertyModal from '@/components/common/EditPropertyModal';
import BulkPaymentModal from '@/components/common/BulkPaymentModal';
import UniversalExport from '@/components/common/UniversalExport';
import BulkLeaseActions from '@/components/property/BulkLeaseActions';
import EnhancedAddPropertyButton from '@/components/property/EnhancedAddPropertyButton';
import CollapsibleSmartSearch from '@/components/property/CollapsibleSmartSearch';
import GesturePropertyCard from '@/components/property/GesturePropertyCard';
import RealTimeActivityFeed from '@/components/property/RealTimeActivityFeed';
import HeaderActionBar from '@/components/property/HeaderActionBar';
import GlassySmartSuggestionsPanel from '@/components/property/GlassySmartSuggestionsPanel';
import FixedGlassyPropertyCard from '@/components/property/FixedGlassyPropertyCard';
import BlendedAIInsightsWidget from '@/components/property/BlendedAIInsightsWidget';
import UniversalFloatingActionMenu from '@/components/common/UniversalFloatingActionMenu';
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
  const [showSmartSearch, setShowSmartSearch] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 300000, // 5 minutes
  });
  
  const { data: allTenants = [] } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/tenants?includeInactive=false');
        return data.data || [];
      } catch (error) {
        console.error('Failed to fetch tenants:', error);
        return [];
      }
    },
    staleTime: 300000, // 5 minutes
    retry: 1
  });
  
  // Enhanced properties with cached tenant data
  const enhancedProperties = React.useMemo(() => {
    return properties.map((property: any) => {
      const propertyTenants = allTenants.filter((t: any) => t.propertyId === property._id);
      const activeTenants = propertyTenants.filter((t: any) => t.status === 'Active');
      const occupancyRate = property.numberOfUnits > 0 
        ? Math.round((activeTenants.length / property.numberOfUnits) * 100)
        : 0;
      
      return {
        ...property,
        cachedTenants: propertyTenants,
        activeTenants: activeTenants.length,
        occupancyRate,
        vacantUnits: property.numberOfUnits - activeTenants.length,
        monthlyRevenue: activeTenants.reduce((sum: number, t: any) => sum + (t.rentAmount || 0), 0)
      };
    });
  }, [properties, allTenants]);

  const filteredProperties = useMemo(() => {
    if (!enhancedProperties) return [];
    
    return enhancedProperties.filter((property: any) => {
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
  }, [enhancedProperties, searchQuery, filters, showArchived, showVacant]);

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
          <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-2">Unable to Load Properties</h2>
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
    <div className="min-h-screen relative" style={{background: 'linear-gradient(135deg, #FF8A65, #42A5F5, #66BB6A)'}}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{backgroundColor: '#FF6B35', opacity: 0.4}}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{backgroundColor: '#1E88E5', opacity: 0.4}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-2000" style={{backgroundColor: '#43A047', opacity: 0.3}}></div>
      </div>

      <div className="relative space-y-8 p-6">
        <RealTimeActivityFeed properties={properties} tenants={allTenants} />

        <div className="hidden md:block">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}></div>
            <div className="relative rounded-3xl p-6 border-2 border-white/40 mb-8" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(25px) saturate(200%)'}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.6), rgba(66,165,245,0.6))'}}>
                    <Building2 size={24} className="text-white" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'}} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                      Properties
                      <Sparkles size={24} className="text-yellow-400 animate-pulse" />
                    </h1>
                    <p className="text-white/90" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>Manage your property portfolio ({filteredProperties.length} properties)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center px-3 py-2 rounded-xl" style={{background: 'rgba(0,0,0,0.2)'}}>
                    <div className="text-lg font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{stats?.totalProperties || 0}</div>
                    <div className="text-xs text-white/80">Total</div>
                  </div>
                  <div className="text-center px-3 py-2 rounded-xl" style={{background: 'rgba(0,0,0,0.2)'}}>
                    <div className="text-lg font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{properties.filter(p => p.status !== 'Archived').length}</div>
                    <div className="text-xs text-white/80">Active</div>
                  </div>
                  <div className="text-center px-3 py-2 rounded-xl" style={{background: 'rgba(0,0,0,0.2)'}}>
                    <div className="text-lg font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{stats?.occupancyRate || 0}%</div>
                    <div className="text-xs text-white/80">Occupancy</div>
                  </div>
                  <EnhancedAddPropertyButton onClick={() => setShowAddModal(true)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <div className="rounded-2xl p-4 border border-white/30 mb-4" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.3), rgba(66,165,245,0.3))', backdropFilter: 'blur(20px)'}}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.6), rgba(66,165,245,0.6))'}}>
                  <Building2 size={20} className="text-white" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))'}} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>Properties</h1>
                  <p className="text-sm text-white/90">{filteredProperties.length} properties</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="text-center px-2 py-1 rounded-lg flex-1" style={{background: 'rgba(0,0,0,0.2)'}}>
                <div className="text-sm font-bold text-white">{properties.filter(p => p.status !== 'Archived').length}</div>
                <div className="text-xs text-white/80">Active</div>
              </div>
              <div className="text-center px-2 py-1 rounded-lg flex-1" style={{background: 'rgba(0,0,0,0.2)'}}>
                <div className="text-sm font-bold text-white">{stats?.occupancyRate || 0}%</div>
                <div className="text-xs text-white/80">Occupied</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="phase3-desktop-layout">
            <div className="phase3-main-content space-y-6">
              {/* Universal Floating Action Menu */}
              <div className="flex justify-start mb-4">
                <UniversalFloatingActionMenu
                  sectionName="Property"
                  onAddItem={() => setShowAddModal(true)}
                  onBulkAction={() => setShowBulkPayment(true)}
                  onExport={() => setShowUniversalExport(true)}
                  onSearch={() => setShowSmartSearch(true)}
                  onAnalytics={() => window.open('/dashboard/analytics', '_blank')}
                  onBulkPayment={() => setShowBulkPayment(true)}
                  onBulkLeaseActions={() => setShowBulkLeaseActions(true)}
                />
              </div>
              


              {filteredProperties && filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredProperties.map((property: any, index: number) => (
                    <LazyLoader key={property._id}>
                      <FixedGlassyPropertyCard 
                        property={property} 
                        index={index}
                        onEdit={handleEditProperty}
                        onDelete={handleDeleteProperty}
                        showCheckbox={showBulkMode}
                        isSelected={selectedProperties.includes(property._id)}
                        onSelect={handlePropertySelect}
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
                        <Building2 size={64} className="text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                        <Sparkles size={16} className="text-white" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-4">
                      {showArchived ? 'No Archived Properties' : 'No Properties Yet'}
                    </h3>
                    <p className="text-gray-300 mb-10 text-lg leading-relaxed">
                      {showArchived 
                        ? 'No properties have been archived yet.'
                        : 'Start building your property portfolio by adding your first property.'
                      }
                    </p>
                    {!showArchived && (
                      <EnhancedAddPropertyButton onClick={() => setShowAddModal(true)} />
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="phase3-sidebar space-y-6">
              <BlendedAIInsightsWidget 
                properties={properties}
                tenants={allTenants}
              />
              <GlassySmartSuggestionsPanel 
                properties={properties} 
                tenants={allTenants} 
              />
            </div>
          </div>
        </div>

        <div className="md:hidden space-y-4">
          {/* Mobile Universal Floating Action Menu */}
          <div className="px-4 flex justify-start mb-4">
            <UniversalFloatingActionMenu
              sectionName="Property"
              onAddItem={() => setShowAddModal(true)}
              onBulkAction={() => setShowBulkPayment(true)}
              onExport={() => setShowUniversalExport(true)}
              onSearch={() => setShowSmartSearch(true)}
              onAnalytics={() => window.open('/dashboard/analytics', '_blank')}
              onBulkPayment={() => setShowBulkPayment(true)}
              onBulkLeaseActions={() => setShowBulkLeaseActions(true)}
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
                    <Building2 size={48} className="text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles size={12} className="text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-4">
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
        
        <CollapsibleSmartSearch
          isOpen={showSmartSearch}
          onClose={() => setShowSmartSearch(false)}
          onSearch={setSearchQuery}
          onFilterChange={setFilters}
          showVacant={showVacant}
          showArchived={showArchived}
          onToggleVacant={() => setShowVacant(!showVacant)}
          onToggleArchived={() => setShowArchived(!showArchived)}
        />
      </div>
    </div>
  );
};

export default PropertiesPage;