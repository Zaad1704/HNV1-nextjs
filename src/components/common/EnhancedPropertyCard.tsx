import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Edit, Trash2, Share2, Eye, Users, DollarSign, AlertTriangle, Wrench, Check, Edit3, Archive } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import UniversalCard from './UniversalCard';
import UniversalStatusBadge from './UniversalStatusBadge';
import ShareButton from './ShareButton';
import TenantAvatar from './TenantAvatar';
// import UnitNicknameModal from '@/components/property/UnitNicknameModal';

interface EnhancedPropertyCardProps {
  property: any;
  index: number;
  onEdit?: (property: any) => void;
  onDelete?: (propertyId: string) => void;
  onShare?: (property: any) => void;
  isSelected?: boolean;
  onSelect?: (propertyId: string, selected: boolean) => void;
  showCheckbox?: boolean;
}

const EnhancedPropertyCard: React.FC<EnhancedPropertyCardProps> = ({ 
  property, 
  index, 
  onEdit, 
  onDelete, 
  onShare,
  isSelected = false,
  onSelect,
  showCheckbox = false
}) => {
  // const [showUnitModal, setShowUnitModal] = useState(false);
  // Fetch tenants for this property to calculate occupancy
  const { data: tenants = [] } = useQuery({
    queryKey: ['propertyTenants', property._id],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/tenants?propertyId=${property._id}`);
        return data.data || [];
      } catch (error) {
        return [];
      }
    },
    staleTime: 300000 // 5 minutes
  });

  // Calculate enhanced metrics
  const totalUnits = property.numberOfUnits || 1;
  const activeTenants = tenants.filter((t: any) => t.status === 'Active');
  const occupiedUnits = activeTenants.length;
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);
  const vacantUnits = totalUnits - occupiedUnits;
  const monthlyRevenue = activeTenants.reduce((sum: number, t: any) => sum + (t.rentAmount || 0), 0);
  const maintenanceIssues = 0; // TODO: Fetch from maintenance API
  const hasIssues = maintenanceIssues > 0;
  const lastActivity = property.updatedAt || property.createdAt;
  const daysAgo = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <UniversalCard delay={index * 0.1} gradient="blue" className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
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
      <div className="h-48 bg-gradient-to-br from-brand-blue via-purple-600 to-brand-orange relative overflow-hidden rounded-2xl mb-4">
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
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && property.imageUrl && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs p-1 rounded">
            {property.imageUrl}
          </div>
        )}
      </div>

      {/* Property Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold text-text-primary group-hover:text-brand-blue transition-colors">
            {property.name}
          </h3>
          <p className="text-sm text-text-secondary">{property.address?.formattedAddress}</p>
          <p className="text-xs text-text-muted mt-1">
            Last updated: {new Date(property.updatedAt || property.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Enhanced Property Metrics */}
        <div className="bg-app-bg/50 rounded-xl p-4 space-y-3">
          {/* Revenue Display with Growth Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-green-600" />
              <span className="text-sm text-text-secondary">Monthly Revenue</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-green-600">${monthlyRevenue.toLocaleString()}</span>
              <div className="text-xs text-gray-500">{occupiedUnits} paying tenants</div>
            </div>
          </div>
          
          {/* Enhanced Occupancy with Visual Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                <span className="text-sm text-text-secondary">Occupancy</span>
              </div>
              <span className="font-semibold text-text-primary">{occupiedUnits}/{totalUnits} units</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
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
              <Building2 size={16} className="text-purple-600" />
              <span className="text-sm text-text-secondary">Type</span>
            </div>
            <span className="font-semibold text-text-primary">{property.propertyType || 'Apartment'}</span>
          </div>
          
          {/* Last Activity */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Last updated</span>
            <span className="text-text-muted">
              {daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`}
            </span>
          </div>
        </div>
        
        {/* Enhanced Tenant Avatars with Unit Info */}
        {activeTenants.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Active Tenants:</span>
              <span className="text-xs text-text-muted">{activeTenants.length} of {totalUnits}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {activeTenants.slice(0, 4).map((tenant: any, idx: number) => (
                <div
                  key={tenant._id}
                  className="flex items-center gap-1 bg-blue-50 rounded-lg px-2 py-1 text-xs"
                  title={`${tenant.name} - Unit ${tenant.unit}`}
                >
                  <TenantAvatar 
                    tenant={tenant} 
                    size="sm" 
                  />
                  <span className="text-blue-700 font-medium">{tenant.unit}</span>
                </div>
              ))}
              {activeTenants.length > 4 && (
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 text-xs">
                  <span className="text-gray-600">+{activeTenants.length - 4} more</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to={`/dashboard/properties/${property._id}`}
            className="w-full gradient-dark-orange-blue text-white py-3 px-4 rounded-2xl text-sm font-semibold transition-all hover:shadow-xl text-center block group-hover:scale-105 transform flex items-center justify-center gap-2"
          >
            <Eye size={16} />
            View Details
          </Link>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit?.(property);
              }}
              className="bg-blue-100 text-blue-800 py-2 px-3 rounded-xl text-xs font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
            >
              <Edit size={12} />
              Edit
            </button>
            <Link
              to={`/dashboard/properties/${property._id}/units`}
              onClick={(e) => {
                e.preventDefault();
                // Navigate to units management
                window.location.href = `/dashboard/properties/${property._id}#units`;
              }}
              className="bg-purple-100 text-purple-800 py-2 px-3 rounded-xl text-xs font-medium hover:bg-purple-200 transition-colors flex items-center justify-center gap-1"
            >
              <Edit3 size={12} />
              Units
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                if (confirm(`Archive ${property.name}? This will hide it from active listings but preserve all data.`)) {
                  onDelete?.(property._id);
                }
              }}
              className="bg-red-100 text-red-800 py-2 px-3 rounded-xl text-xs font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
            >
              <Archive size={12} />
              Archive
            </button>
            <ShareButton
              data={{
                title: property.name,
                text: `Property: ${property.name}\nAddress: ${property.address?.formattedAddress || 'N/A'}\nUnits: ${property.numberOfUnits || 1}`,
                url: `${window.location.origin}/dashboard/properties/${property._id}`
              }}
              className="bg-green-100 text-green-800 py-2 px-3 rounded-xl text-xs font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
            >
              <Share2 size={12} />
              Share
            </ShareButton>
          </div>
        </div>
      </div>
      
      {/* <UnitNicknameModal
        isOpen={showUnitModal}
        onClose={() => setShowUnitModal(false)}
        propertyId={property._id}
        propertyName={property.name}
      /> */}
    </UniversalCard>
  );
};

export default EnhancedPropertyCard;