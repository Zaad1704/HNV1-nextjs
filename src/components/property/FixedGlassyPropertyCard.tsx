import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Edit, Trash2, Share2, Eye, Users, DollarSign, AlertTriangle, Wrench, Check, Edit3, Archive } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';
import ShareButton from '@/components/common/ShareButton';
import TenantAvatar from '@/components/common/TenantAvatar';
import EnhancedActionDropdown from '@/components/common/EnhancedActionDropdown';
import { getPropertyActions } from '@/utils/actionConfigs';

interface FixedGlassyPropertyCardProps {
  property: any;
  index: number;
  onEdit: (property: any) => void;
  onDelete: (propertyId: string) => void;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: (propertyId: string, selected: boolean) => void;
}

const FixedGlassyPropertyCard: React.FC<FixedGlassyPropertyCardProps> = ({
  property,
  index,
  onEdit,
  onDelete,
  showCheckbox = false,
  isSelected = false,
  onSelect
}) => {
  // Use cached tenant data from parent or fetch if not available
  const { data: tenants = [] } = useQuery({
    queryKey: ['propertyTenants', property._id],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/tenants?propertyId=${property._id}&limit=10`);
        return data.data || [];
      } catch (error) {
        console.error('Failed to fetch tenants for property:', error);
        return [];
      }
    },
    staleTime: 600000, // 10 minutes
    cacheTime: 900000, // 15 minutes
    enabled: !property.cachedTenants, // Only fetch if not provided by parent
    retry: 1
  });
  
  // Use cached data if available, otherwise use fetched data
  const actualTenants = property.cachedTenants || tenants;

  // Calculate enhanced metrics with memoization
  const metrics = React.useMemo(() => {
    const totalUnits = property.numberOfUnits || 1;
    const activeTenants = actualTenants.filter((t: any) => t.status === 'Active');
    const occupiedUnits = activeTenants.length;
    const occupancyRate = property.occupancyRate || Math.round((occupiedUnits / totalUnits) * 100);
    const vacantUnits = totalUnits - occupiedUnits;
    const monthlyRevenue = activeTenants.reduce((sum: number, t: any) => sum + (t.rentAmount || 0), 0);
    const maintenanceIssues = property.openMaintenanceRequests || 0;
    const hasIssues = maintenanceIssues > 0;
    const lastActivity = property.updatedAt || property.createdAt;
    const daysAgo = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      totalUnits,
      activeTenants,
      occupiedUnits,
      occupancyRate,
      vacantUnits,
      monthlyRevenue,
      maintenanceIssues,
      hasIssues,
      lastActivity,
      daysAgo
    };
  }, [actualTenants, property]);
  
  const { 
    totalUnits, 
    activeTenants, 
    occupiedUnits, 
    occupancyRate, 
    vacantUnits, 
    monthlyRevenue, 
    maintenanceIssues, 
    hasIssues, 
    daysAgo 
  } = metrics;

  return (
    <div 
      className={`group border-2 border-white/20 rounded-3xl shadow-2xl overflow-hidden relative hover:border-white/30 transition-all duration-500 hover:scale-105 ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
      style={{ animationDelay: `${index * 100}ms`, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(0, 0, 0, 0.3)' }}
    >
      {/* Selection Checkbox */}
      {showCheckbox && (
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect?.(property._id, !isSelected);
            }}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
              isSelected 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'bg-white/90 border-gray-300 hover:border-blue-400'
            }`}
          >
            {isSelected && <Check size={14} />}
          </button>
        </div>
      )}
      
      {/* Property Image */}
      <div className="h-48 relative overflow-hidden rounded-3xl mb-4" style={{backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(0, 0, 0, 0.2)'}}>
        {property.imageUrl && property.imageUrl.trim() !== '' ? (
          <img
            src={property.imageUrl.startsWith('/') ? `${window.location.origin}${property.imageUrl}` : property.imageUrl}
            alt={property.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
            onError={(e) => {
              console.error('Image failed to load:', property.imageUrl);
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`fallback-icon w-full h-full flex items-center justify-center ${property.imageUrl && property.imageUrl.trim() !== '' ? 'hidden' : ''}`}>
          <Building2 size={32} className="text-white" />
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* Water Drop Animation */}
          <div className="absolute -inset-8 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-blue-300 rounded-full animate-bounce opacity-60"
                style={{
                  left: `${10 + i * 8}%`,
                  top: `${5 + i * 3}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '3s',
                  animationIterationCount: 'infinite'
                }}
              />
            ))}
          </div>
          <UniversalStatusBadge 
            status={property.status} 
            variant={property.status === 'Active' ? 'success' : 'warning'}
          />
          {vacantUnits > 0 && (
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {vacantUnits} Vacant
            </span>
          )}
          {hasIssues && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Wrench size={10} />
              Issues
            </span>
          )}
        </div>
        
        {/* Occupancy Progress Bar */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/20 backdrop-blur-sm rounded-full p-2">
            <div className="flex items-center justify-between text-white text-xs mb-1">
              <span>Occupancy</span>
              <span>{occupancyRate}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  occupancyRate >= 80 ? 'bg-green-400' :
                  occupancyRate >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Property Info */}
      <div className="space-y-4 p-6">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
            {property.name}
          </h3>
          <p className="text-sm text-white/80">{property.address?.formattedAddress}</p>
          <p className="text-xs text-white/70 mt-1">
            Last updated: {new Date(property.updatedAt || property.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Enhanced Property Metrics */}
        <div className="rounded-2xl p-4 space-y-3 border border-white/40" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.15), rgba(66,165,245,0.15), rgba(102,187,106,0.1))', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)'}}>
          {/* Revenue Display with Growth Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-green-300" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))', strokeWidth: 2.5}} />
              <span className="text-sm text-white font-semibold" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>Monthly Revenue</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-green-300 text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>${monthlyRevenue.toLocaleString()}</span>
              <div className="text-xs text-white font-medium" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>{occupiedUnits} paying tenants</div>
            </div>
          </div>
          
          {/* Enhanced Occupancy with Visual Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue-300" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))', strokeWidth: 2.5}} />
                <span className="text-sm text-white font-semibold" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>Occupancy</span>
              </div>
              <span className="font-semibold text-white text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>{occupiedUnits}/{totalUnits} units</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  occupancyRate >= 90 ? 'bg-green-500' :
                  occupancyRate >= 70 ? 'bg-blue-500' :
                  occupancyRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
          </div>
          
          {/* Property Type & Last Activity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-purple-400" />
              <span className="text-sm text-white/80">Type</span>
            </div>
            <span className="font-semibold text-white">{property.propertyType || 'Apartment'}</span>
          </div>
          
          {/* Last Activity */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70">Last updated</span>
            <span className="text-white/70">
              {daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`}
            </span>
          </div>
        </div>
        
        {/* Enhanced Tenant Avatars with Unit Info */}
        {activeTenants.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">Active Tenants:</span>
              <span className="text-xs text-white/70">{activeTenants.length} of {totalUnits}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {activeTenants.slice(0, 4).map((tenant: any, idx: number) => (
                <div
                  key={tenant._id}
                  className="flex items-center gap-1 bg-blue-500/20 rounded-lg px-2 py-1 text-xs"
                  title={`${tenant.name} - Unit ${tenant.unit}`}
                >
                  <TenantAvatar 
                    tenant={tenant} 
                    size="sm" 
                  />
                  <span className="text-blue-300 font-medium">{tenant.unit}</span>
                </div>
              ))}
              {activeTenants.length > 4 && (
                <div className="flex items-center gap-1 bg-gray-600/20 rounded-lg px-2 py-1 text-xs">
                  <span className="text-gray-300">+{activeTenants.length - 4} more</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to={`/dashboard/properties/${property._id}`}
            className="w-full bg-gradient-to-r from-orange-500 to-blue-500 text-white py-3 px-4 rounded-2xl text-sm font-semibold transition-all hover:shadow-xl text-center block group-hover:scale-105 transform flex items-center justify-center gap-2 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-blue-400/20 animate-pulse"></div>
            <Eye size={16} className="relative z-10" />
            <span className="relative z-10">View Details</span>
          </Link>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit?.(property);
              }}
              className="bg-gradient-to-r from-orange-400 to-orange-500 text-white py-2 px-3 rounded-xl text-xs font-medium hover:shadow-md transition-all flex items-center justify-center gap-1 hover:scale-105 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-300/20 to-orange-600/20 animate-pulse"></div>
              <Edit size={12} className="relative z-10" />
              <span className="relative z-10">Edit</span>
            </button>
            <Link
              to={`/dashboard/properties/${property._id}/units`}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/dashboard/properties/${property._id}#units`;
              }}
              className="bg-gradient-to-r from-blue-400 to-blue-500 text-white py-2 px-3 rounded-xl text-xs font-medium hover:shadow-md transition-all flex items-center justify-center gap-1 hover:scale-105 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-300/20 to-blue-600/20 animate-pulse"></div>
              <Edit3 size={12} className="relative z-10" />
              <span className="relative z-10">Units</span>
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                if (confirm(`${property.status === 'Archived' ? 'Restore' : 'Archive'} ${property.name}? This will hide it from active listings but preserve all data.`)) {
                  onDelete?.(property._id);
                }
              }}
              className="bg-gradient-to-r from-red-400 to-red-500 text-white py-2 px-3 rounded-xl text-xs font-medium hover:shadow-md transition-all flex items-center justify-center gap-1 hover:scale-105 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-300/20 to-red-600/20 animate-pulse"></div>
              <Archive size={12} className="relative z-10" />
              <span className="relative z-10">Archive</span>
            </button>
            <ShareButton
              data={{
                title: property.name,
                text: `Property: ${property.name}\nAddress: ${property.address?.formattedAddress || 'N/A'}\nUnits: ${property.numberOfUnits || 1}`,
                url: `${window.location.origin}/dashboard/properties/${property._id}`
              }}
              className="bg-gradient-to-r from-green-400 to-green-500 text-white py-2 px-3 rounded-xl text-xs font-medium hover:shadow-md transition-all flex items-center justify-center gap-1 hover:scale-105 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-300/20 to-green-600/20 animate-pulse"></div>
              <Share2 size={12} className="relative z-10" />
              <span className="relative z-10">Share</span>
            </ShareButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedGlassyPropertyCard;