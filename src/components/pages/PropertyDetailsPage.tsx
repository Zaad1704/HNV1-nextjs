'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Home, 
  Users, 
  DollarSign, 
  Calendar,
  FileText,
  TrendingUp,
  Plus
} from 'lucide-react';
import apiClient from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EditPropertyModal from '@/components/common/EditPropertyModal';
import UnitsSection from '@/components/property/UnitsSection';
import PropertyStatsSection from '@/components/property/PropertyStatsSection';
import DataPreviewSections from '@/components/property/DataPreviewSections';
import PropertyQuickActions from '@/components/property/PropertyQuickActions';
import MonthlyCollectionSheet from '@/components/common/MonthlyCollectionSheet';
import PropertyAnalyticsDashboard from '@/components/property/PropertyAnalyticsDashboard';
import EnhancedUnitsGrid from '@/components/property/EnhancedUnitsGrid';
import EnhancedPropertyQuickActions from '@/components/property/EnhancedPropertyQuickActions';
import RelatedDataSections from '@/components/property/RelatedDataSections';
import RentIncreaseModal from '@/components/property/RentIncreaseModal';
import PropertyStyleCard from '@/components/common/PropertyStyleCard';
import PropertyStyleBackground from '@/components/common/PropertyStyleBackground';

const PropertyDetailsPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [showRentIncrease, setShowRentIncrease] = useState(false);

  // Fetch property details
  const { data: property, isLoading: propertyLoading, error: propertyError } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      if (!propertyId || typeof propertyId !== 'string') {
        throw new Error('Invalid property ID');
      }
      const { data } = await apiClient.get(`/properties/${propertyId}`);
      return data.data;
    },
    enabled: !!propertyId && typeof propertyId === 'string'
  });

  // Fetch tenants for this property
  const { data: tenants = [], isLoading: tenantsLoading } = useQuery({
    queryKey: ['propertyTenants', propertyId],
    queryFn: async () => {
      if (!propertyId || typeof propertyId !== 'string') return [];
      const { data } = await apiClient.get(`/tenants?propertyId=${propertyId}`);
      return data.data || [];
    },
    enabled: !!propertyId && typeof propertyId === 'string'
  });

  // Fetch payments for this property
  const { data: payments = [] } = useQuery({
    queryKey: ['propertyPayments', propertyId],
    queryFn: async () => {
      if (!propertyId || typeof propertyId !== 'string') return [];
      const { data } = await apiClient.get(`/payments?propertyId=${propertyId}`);
      return data.data || [];
    },
    enabled: !!propertyId && typeof propertyId === 'string'
  });

  // Fetch expenses for this property
  const { data: expenses = [] } = useQuery({
    queryKey: ['propertyExpenses', propertyId],
    queryFn: async () => {
      if (!propertyId || typeof propertyId !== 'string') return [];
      const { data } = await apiClient.get(`/expenses?propertyId=${propertyId}`);
      return data.data || [];
    },
    enabled: !!propertyId && typeof propertyId === 'string'
  });

  // Fetch maintenance requests for this property
  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['propertyMaintenance', propertyId],
    queryFn: async () => {
      if (!propertyId || typeof propertyId !== 'string') return [];
      const { data } = await apiClient.get(`/maintenance?propertyId=${propertyId}`);
      return data.data || [];
    },
    enabled: !!propertyId && typeof propertyId === 'string'
  });

  // Fetch units for this property
  const { data: units = [] } = useQuery({
    queryKey: ['propertyUnits', propertyId],
    queryFn: async () => {
      try {
        if (!propertyId || typeof propertyId !== 'string') return [];
        const { data } = await apiClient.get(`/units/property/${propertyId}`);
        return data.data || [];
      } catch (error) {
        return [];
      }
    },
    enabled: !!propertyId && typeof propertyId === 'string'
  });

  const handleDataUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
    queryClient.invalidateQueries({ queryKey: ['propertyTenants', propertyId] });
    queryClient.invalidateQueries({ queryKey: ['propertyPayments', propertyId] });
    queryClient.invalidateQueries({ queryKey: ['propertyExpenses', propertyId] });
    queryClient.invalidateQueries({ queryKey: ['propertyMaintenance', propertyId] });
  };

  const handleAddTenant = (unitNumber?: string) => {
    const url = unitNumber 
      ? `/dashboard/tenants/add?propertyId=${propertyId}&unit=${unitNumber}`
      : `/dashboard/tenants/add?propertyId=${propertyId}`;
    router.push(url);
  };

  if (propertyLoading || tenantsLoading) {
    return (
      <PropertyStyleBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full animate-spin">
                <div className="w-full h-full rounded-full border-4 border-transparent border-t-white border-r-white/50"></div>
              </div>
              <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-blue-400 to-orange-400 rounded-full animate-ping opacity-20"></div>
            </div>
            <div className="text-center">
              <p className="text-white font-medium text-lg mb-2">Loading property details...</p>
              <p className="text-white/70 text-sm">Please wait while we fetch the latest information</p>
            </div>
          </div>
        </div>
      </PropertyStyleBackground>
    );
  }

  if (propertyError || !property) {
    const errorMessage = propertyError?.message || 'Property not found';
    const isNetworkError = errorMessage.includes('Network') || errorMessage.includes('fetch');
    
    return (
      <PropertyStyleBackground>
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center p-8 rounded-3xl border border-white/20 max-w-md" style={{background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(15px)'}}>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {isNetworkError ? 'Connection Error' : 'Property Not Found'}
            </h2>
            <p className="text-white/80 mb-6">
              {isNetworkError 
                ? 'Unable to connect to the server. Please check your internet connection and try again.'
                : 'The property you\'re looking for doesn\'t exist or you don\'t have access to it.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {isNetworkError && (
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all"
                >
                  Try Again
                </button>
              )}
              <Link 
                to="/dashboard/properties" 
                className="bg-gradient-to-r from-orange-400 to-blue-400 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all"
              >
                ← Back to Properties
              </Link>
            </div>
          </div>
        </div>
      </PropertyStyleBackground>
    );
  }

  const activeTenants = tenants.filter((t: any) => t.status === 'Active');
  const totalRent = activeTenants.reduce((sum: number, tenant: any) => sum + (tenant.rentAmount || 0), 0);
  const occupancyRate = property.numberOfUnits > 0 ? (activeTenants.length / property.numberOfUnits) * 100 : 0;

  return (
    <PropertyStyleBackground>
      <div className="space-y-8 p-6">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 border-b border-white/30 lg:hidden" style={{backdropFilter: 'blur(20px) saturate(180%)', background: 'linear-gradient(135deg, rgba(255,138,101,0.3), rgba(66,165,245,0.3))', borderColor: 'rgba(255, 255, 255, 0.3)'}}>
        <div className="flex items-center justify-between p-4">
          <Link 
            to="/dashboard/properties"
            className="p-2 rounded-xl transition-colors" style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
          >
            <ArrowLeft size={20} className="text-white" />
          </Link>
          <div className="flex-1 mx-4">
            <h1 className="text-lg font-bold text-white truncate" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{property?.name || 'Property'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-2 text-white rounded-xl transition-colors" style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
            >
              <Edit size={16} />
            </button>
            <button
              className="p-2 text-white rounded-xl transition-colors" style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="5" r="2" fill="currentColor"/>
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
                <circle cx="12" cy="19" r="2" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}></div>
            <div className="relative rounded-3xl p-6 border-2 border-white/40 mb-8" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(25px) saturate(200%)'}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link 
                    to="/dashboard/properties"
                    className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
                  >
                    <ArrowLeft size={20} className="text-white" />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">{property?.name || 'Property'}</h1>
                    <div className="flex items-center gap-2 text-white/90 mt-1">
                      <MapPin size={16} />
                      <span>{property.address?.street || property.address?.formattedAddress || 'No address'}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-blue-400 text-white rounded-xl hover:scale-105 transition-all duration-300 border border-white/40"
                  style={{backdropFilter: 'blur(20px)'}}
                >
                  <Edit size={16} />
                  Edit Property
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Address */}
        <div className="lg:hidden mb-4 mx-4 p-3 rounded-xl border border-white/30" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.3), rgba(66,165,245,0.3))', backdropFilter: 'blur(20px)'}}>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin size={14} />
            <span className="text-sm">{property.address?.street || property.address?.formattedAddress || 'No address'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 lg:space-y-8 order-2 lg:order-1">
            {/* Property Analytics Dashboard */}
            {propertyId && (
              <PropertyAnalyticsDashboard
                propertyId={propertyId}
                property={property}
                tenants={tenants}
                payments={payments}
                expenses={expenses}
                maintenanceRequests={maintenanceRequests}
              />
            )}

            {/* Related Data Sections with Unit-Centric Filtering */}
            {propertyId && (
              <RelatedDataSections
                propertyId={propertyId}
                property={property}
                tenants={tenants}
                payments={payments}
                expenses={expenses}
                maintenanceRequests={maintenanceRequests}
              />
            )}

            {/* Enhanced Units Grid */}
            <div data-section="units">
            {propertyId && (
              <EnhancedUnitsGrid
                propertyId={propertyId}
                property={property}
                tenants={tenants}
                units={units}
                onAddTenant={handleAddTenant}
                onEditNicknames={() => {
                  // Open the enhanced unit nickname modal
                  const unitsGrid = document.querySelector('[data-units-grid]');
                  if (unitsGrid) {
                    // Trigger the manage units modal from the units grid
                    const manageButton = unitsGrid.querySelector('[data-manage-units-btn]') as HTMLButtonElement;
                    if (manageButton) {
                      manageButton.click();
                    }
                  }
                }}
              />
            )}
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="order-1 lg:order-2">
            {propertyId && (
              <EnhancedPropertyQuickActions
                propertyId={propertyId}
                property={property}
                tenants={tenants}
                onRentIncrease={() => setShowRentIncrease(true)}
                onCollectionSheet={() => setShowCollectionSheet(true)}
                onArchive={() => {
                  if (confirm(`Archive ${property?.name || 'this property'}? This will hide it from active listings.`)) {
                    alert('Archive functionality coming soon');
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditPropertyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        property={property}
        onPropertyUpdated={handleDataUpdate}
      />

      {propertyId && (
        <MonthlyCollectionSheet
          isOpen={showCollectionSheet}
          onClose={() => setShowCollectionSheet(false)}
          propertyId={propertyId}
          propertyName={property?.name || ''}
          tenants={activeTenants}
        />
      )}

      <RentIncreaseModal
        isOpen={showRentIncrease}
        onClose={() => setShowRentIncrease(false)}
        property={property}
        tenants={activeTenants}
        onSuccess={handleDataUpdate}
      />
      </div>
    </PropertyStyleBackground>
  );
};

export default PropertyDetailsPage;