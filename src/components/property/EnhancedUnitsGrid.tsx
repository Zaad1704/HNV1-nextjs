import React, { useState } from 'react';
import { Home, User, DollarSign, Plus, Edit3, Grid3X3, List, Wrench, Calendar, Eye, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import UnitDataModal from './UnitDataModal';
import EnhancedUnitNicknameModal from './EnhancedUnitNicknameModal';
import UnitQuickActions from './UnitQuickActions';
import TenantAvatar from '@/components/common/TenantAvatar';

interface EnhancedUnitsGridProps {
  propertyId: string;
  property: any;
  tenants: any[];
  units: any[];
  onAddTenant: (unitNumber: string) => void;
  onEditNicknames: () => void;
}

const EnhancedUnitsGrid: React.FC<EnhancedUnitsGridProps> = ({
  propertyId,
  property,
  tenants,
  units,
  onAddTenant,
  onEditNicknames
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showEnhancedNicknameModal, setShowEnhancedNicknameModal] = useState(false);
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'vacant' | 'occupied'>('all');

  // Combine units data with tenant information
  const allUnitsData = React.useMemo(() => {
    if (units.length > 0) {
      return units.map((unit: any) => {
        const tenant = tenants.find(t => t.unit === unit.unitNumber && t.status === 'Active');
        return {
          ...unit,
          isOccupied: !!tenant,
          tenant: tenant || null,
          tenantName: tenant?.name || null,
          tenantId: tenant?._id || null,
          rentAmount: tenant?.rentAmount || unit.rentAmount || 0,
          displayName: unit.nickname ? `${unit.unitNumber} (${unit.nickname})` : unit.unitNumber,
          leaseEndDate: tenant?.leaseEndDate,
          paymentStatus: tenant?.paymentStatus || 'current',
          maintenanceIssues: 0 // TODO: Get from maintenance data
        };
      });
    }
    
    // Fallback to property numberOfUnits
    if (!property?.numberOfUnits) return [];
    
    return Array.from({ length: property.numberOfUnits }, (_, i) => {
      const unitNumber = (i + 1).toString();
      const tenant = tenants.find(t => t.unit === unitNumber && t.status === 'Active');
      
      return {
        unitNumber,
        isOccupied: !!tenant,
        tenant: tenant || null,
        tenantName: tenant?.name || null,
        tenantId: tenant?._id || null,
        rentAmount: tenant?.rentAmount || 0,
        displayName: unitNumber,
        leaseEndDate: tenant?.leaseEndDate,
        paymentStatus: tenant?.paymentStatus || 'current',
        maintenanceIssues: 0
      };
    });
  }, [units, tenants, property?.numberOfUnits]);

  // Filter units based on search and status filters
  const unitsData = React.useMemo(() => {
    let filtered = allUnitsData;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(unit => 
        unit.unitNumber.toLowerCase().includes(query) ||
        (unit.nickname && unit.nickname.toLowerCase().includes(query)) ||
        (unit.tenantName && unit.tenantName.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    if (statusFilter === 'vacant') {
      filtered = filtered.filter(unit => !unit.isOccupied);
    } else if (statusFilter === 'occupied') {
      filtered = filtered.filter(unit => unit.isOccupied);
    }

    return filtered;
  }, [allUnitsData, searchQuery, statusFilter]);

  const handleUnitClick = (unit: any) => {
    setSelectedUnit(unit.unitNumber);
    setShowUnitModal(true);
  };

  const getStatusColor = (unit: any) => {
    if (!unit.isOccupied) return 'border-green-300/50 text-white';
    if (unit.paymentStatus === 'late') return 'border-red-300/50 text-white';
    if (unit.maintenanceIssues > 0) return 'border-orange-300/50 text-white';
    return 'border-blue-300/50 text-white';
  };

  const getStatusStyle = (unit: any) => {
    if (!unit.isOccupied) return {background: 'rgba(34, 197, 94, 0.3)', backdropFilter: 'blur(10px)'};
    if (unit.paymentStatus === 'late') return {background: 'rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)'};
    if (unit.maintenanceIssues > 0) return {background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'};
    return {background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'};
  };

  const getStatusText = (unit: any) => {
    if (!unit.isOccupied) return 'Vacant';
    if (unit.paymentStatus === 'late') return 'Late Payment';
    if (unit.maintenanceIssues > 0) return 'Maintenance';
    return 'Occupied';
  };

  if (viewMode === 'list') {
    return (
      <div className="rounded-3xl p-8 border border-white/20 relative overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Unit-Wise Breakdown ({unitsData.length})</h2>
            <div className="flex items-center gap-4 text-sm text-white/80 mt-1">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {allUnitsData.filter(u => !u.isOccupied).length} Available
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {allUnitsData.filter(u => u.isOccupied).length} Occupied
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearchFilters(!showSearchFilters)}
              className="px-3 py-2 text-white rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm border border-white/20"
              style={{background: showSearchFilters ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}
            >
              <Search size={14} />
              Search & Filter
              {showSearchFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              onClick={() => setShowEnhancedNicknameModal(true)}
              className="px-3 py-2 text-white rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm border border-white/20"
              style={{background: 'rgba(168, 85, 247, 0.3)', backdropFilter: 'blur(10px)'}}
            >
              <Edit3 size={14} />
              Manage Units
            </button>
            <button
              onClick={onEditNicknames}
              className="px-3 py-2 text-white rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm border border-white/20"
              style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}
            >
              <Edit3 size={14} />
              Edit Nicknames
            </button>
            <div className="flex rounded-lg p-1 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.2)'}}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded text-white transition-all duration-300 ${viewMode === 'grid' ? 'shadow-sm scale-105' : 'hover:scale-105'}`}
                style={viewMode === 'grid' ? {background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'} : {}}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded text-white transition-all duration-300 ${viewMode === 'list' ? 'shadow-sm scale-105' : 'hover:scale-105'}`}
                style={viewMode === 'list' ? {background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'} : {}}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        {showSearchFilters && (
          <div className="mb-6 p-4 rounded-xl border border-white/20" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={16} />
                  <input
                    type="text"
                    placeholder="Search units by number, nickname, or tenant name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-blue-400 transition-colors"
                    style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-white/20 ${
                    statusFilter === 'all' ? 'text-white scale-105' : 'text-white/70 hover:text-white hover:scale-105'
                  }`}
                  style={statusFilter === 'all' ? {background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'} : {background: 'rgba(0, 0, 0, 0.2)'}}
                >
                  All Units
                </button>
                <button
                  onClick={() => setStatusFilter('vacant')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-white/20 ${
                    statusFilter === 'vacant' ? 'text-white scale-105' : 'text-white/70 hover:text-white hover:scale-105'
                  }`}
                  style={statusFilter === 'vacant' ? {background: 'rgba(34, 197, 94, 0.3)', backdropFilter: 'blur(10px)'} : {background: 'rgba(0, 0, 0, 0.2)'}}
                >
                  Vacant Only
                </button>
                <button
                  onClick={() => setStatusFilter('occupied')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-white/20 ${
                    statusFilter === 'occupied' ? 'text-white scale-105' : 'text-white/70 hover:text-white hover:scale-105'
                  }`}
                  style={statusFilter === 'occupied' ? {background: 'rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)'} : {background: 'rgba(0, 0, 0, 0.2)'}}
                >
                  Occupied Only
                </button>
              </div>
            </div>
            
            {/* Results Summary */}
            {(searchQuery.trim() || statusFilter !== 'all') && (
              <div className="mt-3 text-sm text-white/80">
                Showing {unitsData.length} of {allUnitsData.length} units
                {searchQuery.trim() && ` matching "${searchQuery}"`}
                {statusFilter !== 'all' && ` (${statusFilter} only)`}
              </div>
            )}
          </div>
        )}

        {/* List View */}
        <div className="space-y-3">
          {unitsData.map((unit: any) => (
            <div
              key={unit.unitNumber}
              className="flex items-center justify-between p-4 border border-white/20 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              style={{background: 'rgba(255, 255, 255, 0.05)'}}
              onClick={() => handleUnitClick(unit)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                  {unit.unitNumber}
                </div>
                <div>
                  <div className="font-medium text-white">Unit {unit.displayName}</div>
                  {unit.isOccupied && unit.tenantName && (
                    <div className="text-sm text-white/80">{unit.tenantName}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold text-white">
                    {unit.rentAmount > 0 ? `$${unit.rentAmount}/month` : 'No rent set'}
                  </div>
                  {unit.leaseEndDate && (
                    <div className="text-xs text-white/70">
                      Lease ends: {new Date(unit.leaseEndDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <span className="px-3 py-1 rounded-full text-xs font-medium border border-white/20 text-white" style={getStatusStyle(unit)}>
                  {getStatusText(unit)}
                </span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (unit.isOccupied && unit.tenantId) {
                      window.location.href = `/dashboard/tenants/${unit.tenantId}`;
                    } else {
                      onAddTenant(unit.unitNumber);
                    }
                  }}
                  className="p-2 text-white rounded-lg hover:scale-105 transition-all duration-300 border border-white/20"
                  style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}
                >
                  {unit.isOccupied ? <Eye size={16} /> : <Plus size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <UnitDataModal
          isOpen={showUnitModal}
          onClose={() => setShowUnitModal(false)}
          propertyId={propertyId}
          unitNumber={selectedUnit || ''}
          unitName={unitsData.find(u => u.unitNumber === selectedUnit)?.displayName}
        />
        
        <EnhancedUnitNicknameModal
          isOpen={showEnhancedNicknameModal}
          onClose={() => setShowEnhancedNicknameModal(false)}
          propertyId={propertyId}
          propertyName={property?.name || 'Property'}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-white/20 relative overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 gap-3 lg:gap-0">
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-white">Unit-Wise Breakdown ({unitsData.length})</h2>
          <div className="flex items-center gap-3 lg:gap-4 text-xs lg:text-sm text-white/80 mt-1">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {allUnitsData.filter(u => !u.isOccupied).length} Available
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              {allUnitsData.filter(u => u.isOccupied).length} Occupied
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowSearchFilters(!showSearchFilters)}
            className="px-3 py-2 text-white rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm border border-white/20"
            style={{background: showSearchFilters ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}
          >
            <Search size={14} />
            <span className="hidden sm:inline">Search & Filter</span>
            {showSearchFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={() => setShowEnhancedNicknameModal(true)}
            className="px-3 py-2 text-white rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm border border-white/20"
            style={{background: 'rgba(168, 85, 247, 0.3)', backdropFilter: 'blur(10px)'}}
            data-manage-units-btn
          >
            <Edit3 size={14} />
            <span className="hidden sm:inline">Manage Units</span>
          </button>
          <button
            onClick={onEditNicknames}
            className="px-3 py-2 text-white rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm border border-white/20"
            style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}
          >
            <Edit3 size={14} />
            <span className="hidden sm:inline">Edit Nicknames</span>
          </button>
          <div className="flex rounded-lg p-1 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.2)'}}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded text-white transition-all duration-300 ${viewMode === 'grid' ? 'shadow-sm scale-105' : 'hover:scale-105'}`}
              style={viewMode === 'grid' ? {background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'} : {}}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded text-white transition-all duration-300 ${viewMode === 'list' ? 'shadow-sm scale-105' : 'hover:scale-105'}`}
              style={viewMode === 'list' ? {background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'} : {}}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Search and Filter Section */}
      {showSearchFilters && (
        <div className="mb-6 p-4 rounded-xl border border-white/20" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={16} />
                <input
                  type="text"
                  placeholder="Search units by number, nickname, or tenant name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-blue-400 transition-colors"
                  style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-white/20 ${
                  statusFilter === 'all' ? 'text-white scale-105' : 'text-white/70 hover:text-white hover:scale-105'
                }`}
                style={statusFilter === 'all' ? {background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'} : {background: 'rgba(0, 0, 0, 0.2)'}}
              >
                All Units
              </button>
              <button
                onClick={() => setStatusFilter('vacant')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-white/20 ${
                  statusFilter === 'vacant' ? 'text-white scale-105' : 'text-white/70 hover:text-white hover:scale-105'
                }`}
                style={statusFilter === 'vacant' ? {background: 'rgba(34, 197, 94, 0.3)', backdropFilter: 'blur(10px)'} : {background: 'rgba(0, 0, 0, 0.2)'}}
              >
                Vacant Only
              </button>
              <button
                onClick={() => setStatusFilter('occupied')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-white/20 ${
                  statusFilter === 'occupied' ? 'text-white scale-105' : 'text-white/70 hover:text-white hover:scale-105'
                }`}
                style={statusFilter === 'occupied' ? {background: 'rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)'} : {background: 'rgba(0, 0, 0, 0.2)'}}
              >
                Occupied Only
              </button>
            </div>
          </div>
          
          {/* Results Summary */}
          {(searchQuery.trim() || statusFilter !== 'all') && (
            <div className="mt-3 text-sm text-white/80">
              Showing {unitsData.length} of {allUnitsData.length} units
              {searchQuery.trim() && ` matching "${searchQuery}"`}
              {statusFilter !== 'all' && ` (${statusFilter} only)`}
            </div>
          )}
        </div>
      )}
      
      {/* Grid View - 4 units per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {unitsData.map((unit: any) => (
          <div
            key={unit.unitNumber}
            className={`relative p-4 lg:p-6 border-2 rounded-xl lg:rounded-2xl hover:shadow-lg transition-all cursor-pointer touch-manipulation ${getStatusColor(unit)}`}
            style={getStatusStyle(unit)}
            onClick={() => handleUnitClick(unit)}
          >
            {/* Unit Number */}
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold mx-auto mb-3">
                {unit.unitNumber}
              </div>
              <div className="font-medium text-sm">
                {unit.nickname ? (
                  <div>
                    <div className="font-bold text-white">{unit.unitNumber}</div>
                    <div className="text-xs text-white/70">({unit.nickname})</div>
                  </div>
                ) : (
                  <div className="font-bold text-white">Unit {unit.unitNumber}</div>
                )}
              </div>
            </div>

            {/* Tenant Info */}
            {unit.isOccupied && unit.tenantName ? (
              <div className="text-center mb-4">
                <TenantAvatar 
                  tenant={unit.tenant} 
                  size="md" 
                  className="mx-auto mb-2" 
                />
                <div className="text-sm font-medium truncate text-white mb-1">{unit.tenantName}</div>
                <div className="text-xs text-green-300 font-semibold">${unit.rentAmount}/mo</div>
                {unit.leaseEndDate && (
                  <div className="text-xs text-white/60 mt-1">
                    Lease: {new Date(unit.leaseEndDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center mb-4">
                <TenantAvatar 
                  tenant={undefined} 
                  size="md" 
                  className="mx-auto mb-2" 
                />
                <div className="text-sm text-green-300 font-semibold">Available</div>
                <div className="text-xs text-white/60">Ready for tenant</div>
              </div>
            )}

            {/* Status Indicators */}
            <div className="flex justify-center gap-1 mb-2">
              {unit.paymentStatus === 'late' && (
                <div className="w-2 h-2 bg-red-500 rounded-full" title="Late Payment"></div>
              )}
              {unit.maintenanceIssues > 0 && (
                <div className="w-2 h-2 bg-orange-500 rounded-full" title="Maintenance Issues"></div>
              )}
              {unit.leaseEndDate && new Date(unit.leaseEndDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Lease Expiring Soon"></div>
              )}
            </div>

            {/* Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (unit.isOccupied && unit.tenantId) {
                  window.location.href = `/dashboard/tenants/${unit.tenantId}`;
                } else {
                  onAddTenant(unit.unitNumber);
                }
              }}
              className="w-full py-2 px-3 rounded-lg text-sm font-medium hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 border border-white/20 text-white"
              style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}
            >
              {unit.isOccupied ? (
                <>
                  <Eye size={14} />
                  View Details
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Add Tenant
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <UnitDataModal
        isOpen={showUnitModal}
        onClose={() => setShowUnitModal(false)}
        propertyId={propertyId}
        unitNumber={selectedUnit || ''}
        unitName={unitsData.find(u => u.unitNumber === selectedUnit)?.displayName}
      />
      
      <EnhancedUnitNicknameModal
        isOpen={showEnhancedNicknameModal}
        onClose={() => setShowEnhancedNicknameModal(false)}
        propertyId={propertyId}
        propertyName={property?.name || 'Property'}
      />
    </div>
  );
};

export default EnhancedUnitsGrid;