import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, Plus, DollarSign, FileText, TrendingUp, Archive, 
  Calendar, Mail, Download, Settings, Wrench, Bell, AlertTriangle, Trash2 
} from 'lucide-react';
import BulkCommunicationModal from './BulkCommunicationModal';
import PropertyReportModal from './PropertyReportModal';
import ScheduleMaintenanceModal from './ScheduleMaintenanceModal';
import BulkLeaseRenewalModal from './BulkLeaseRenewalModal';

interface EnhancedPropertyQuickActionsProps {
  propertyId: string;
  property: any;
  tenants: any[];
  onRentIncrease: () => void;
  onCollectionSheet: () => void;
  onArchive: () => void;
}

const EnhancedPropertyQuickActions: React.FC<EnhancedPropertyQuickActionsProps> = ({
  propertyId,
  property,
  tenants,
  onRentIncrease,
  onCollectionSheet,
  onArchive
}) => {
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showLeaseRenewalModal, setShowLeaseRenewalModal] = useState(false);
  const activeTenants = tenants.filter(t => t.status === 'Active');
  const expiringLeases = tenants.filter(t => {
    if (!t.leaseEndDate) return false;
    const endDate = new Date(t.leaseEndDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return endDate <= threeMonthsFromNow;
  });

  const hasVacantUnits = activeTenants.length < (property.numberOfUnits || 1);
  const hasExpiringLeases = expiringLeases.length > 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Property Overview Card */}
      <div className="rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-white/20 relative overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
        <h3 className="text-base lg:text-lg font-bold text-white mb-3 lg:mb-4">Property Overview</h3>
        
        {/* Property Image */}
        {property.imageUrl && (
          <div className="mb-3 lg:mb-4">
            <img
              src={property.imageUrl.startsWith('/') ? `${window.location.origin}${property.imageUrl}` : property.imageUrl}
              alt={property.name}
              className="w-full h-32 lg:h-48 object-cover rounded-lg lg:rounded-xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 lg:space-y-3 lg:block">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <span className="text-xs lg:text-sm text-white/80">Type</span>
            <span className="font-medium text-sm lg:text-base text-white">{property.propertyType || 'N/A'}</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <span className="text-xs lg:text-sm text-white/80">Units</span>
            <span className="font-medium text-sm lg:text-base text-white">{property.numberOfUnits}</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <span className="text-xs lg:text-sm text-white/80">Occupancy</span>
            <span className="font-medium text-sm lg:text-base text-white">
              {activeTenants.length}/{property.numberOfUnits} 
              ({Math.round((activeTenants.length / (property.numberOfUnits || 1)) * 100)}%)
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between col-span-2 lg:col-span-1">
            <span className="text-xs lg:text-sm text-white/80">Monthly Revenue</span>
            <span className="font-medium text-sm lg:text-base text-green-300">
              ${activeTenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Contextual Alerts */}
      {(hasVacantUnits || hasExpiringLeases) && (
        <div className="rounded-3xl p-6 border-2 border-orange-400/80 relative overflow-hidden shadow-2xl" style={{background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(20px)', boxShadow: '0 0 40px rgba(255, 165, 0, 0.6)'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10"></div>
          <div className="relative">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center justify-center gap-3" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
              <Bell size={24} className="animate-bounce text-orange-400" />
              <span className="text-white">ATTENTION REQUIRED</span>
              <AlertTriangle size={24} className="animate-pulse text-red-400" />
            </h3>
            <div className="space-y-4">
              {hasVacantUnits && (
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-orange-400/50" style={{background: 'rgba(255, 165, 0, 0.2)', backdropFilter: 'blur(10px)'}}>
                  <div className="w-4 h-4 bg-orange-400 rounded-full animate-pulse flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-white font-bold text-lg" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                      🏠 {(property.numberOfUnits || 1) - activeTenants.length} VACANT UNITS
                    </div>
                    <div className="text-orange-200 text-sm mt-1">Ready for new tenants</div>
                  </div>
                </div>
              )}
              {hasExpiringLeases && (
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-red-400/50" style={{background: 'rgba(220, 38, 38, 0.2)', backdropFilter: 'blur(10px)'}}>
                  <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-white font-bold text-lg" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                      📅 {expiringLeases.length} LEASES EXPIRING
                    </div>
                    <div className="text-red-200 text-sm mt-1">Within 3 months - Action needed</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Primary Actions Wheel */}
      <div className="rounded-3xl p-6 border-2 border-white/30 relative overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(15px)'}}>
        <h3 className="text-lg font-bold text-white mb-6 text-center">Quick Actions</h3>
        <div className="relative flex items-center justify-center">
          {/* Center circle */}
          <div className="absolute w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
            <span className="text-white text-xs font-bold">Actions</span>
          </div>
          
          {/* Action buttons in wheel formation */}
          <div className="relative w-48 h-48">
            <Link 
              to={`/dashboard/tenants?propertyId=${propertyId}`}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-20 h-20 rounded-full border-2 border-blue-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white group"
              style={{background: 'rgba(59, 130, 246, 0.4)', backdropFilter: 'blur(10px)'}}>
              <Users size={20} className="mb-1" />
              <span className="text-xs font-bold">Tenants</span>
              <span className="absolute -top-2 -right-2 bg-blue-400 px-2 py-1 rounded-full text-xs">{activeTenants.length}</span>
            </Link>

            <button 
              onClick={() => window.location.href = `/dashboard/tenants/add?propertyId=${propertyId}`}
              className="absolute top-1/2 right-0 transform translate-x-2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-green-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white"
              style={{background: 'rgba(34, 197, 94, 0.4)', backdropFilter: 'blur(10px)'}}>
              <Plus size={20} className="mb-1" />
              <span className="text-xs font-bold">Add</span>
            </button>

            <Link 
              to={`/dashboard/payments?propertyId=${propertyId}`}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-20 h-20 rounded-full border-2 border-purple-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white"
              style={{background: 'rgba(168, 85, 247, 0.4)', backdropFilter: 'blur(10px)'}}>
              <DollarSign size={20} className="mb-1" />
              <span className="text-xs font-bold">Payments</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Property Management Wheel */}
      <div className="rounded-3xl p-6 border-2 border-white/30 relative overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(15px)'}}>
        <h3 className="text-lg font-bold text-white mb-6 text-center">Management</h3>
        <div className="relative flex items-center justify-center">
          {/* Center circle */}
          <div className="absolute w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
            <span className="text-white text-xs font-bold">Manage</span>
          </div>
          
          {/* Management buttons in wheel formation */}
          <div className="relative w-52 h-52">
            <button
              onClick={onCollectionSheet}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-18 h-18 rounded-full border-2 border-indigo-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white"
              style={{background: 'rgba(99, 102, 241, 0.4)', backdropFilter: 'blur(10px)'}}>
              <FileText size={16} className="mb-1" />
              <span className="text-xs font-bold">Sheet</span>
            </button>

            <button
              onClick={onRentIncrease}
              className="absolute top-1/2 right-0 transform translate-x-2 -translate-y-1/2 w-18 h-18 rounded-full border-2 border-orange-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white"
              style={{background: 'rgba(249, 115, 22, 0.4)', backdropFilter: 'blur(10px)'}}>
              <TrendingUp size={16} className="mb-1" />
              <span className="text-xs font-bold">Rent+</span>
            </button>

            <button
              onClick={() => setShowMaintenanceModal(true)}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 w-18 h-18 rounded-full border-2 border-yellow-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white"
              style={{background: 'rgba(245, 158, 11, 0.4)', backdropFilter: 'blur(10px)'}}>
              <Wrench size={16} className="mb-1" />
              <span className="text-xs font-bold">Repair</span>
            </button>

            {hasExpiringLeases && (
              <button
                onClick={() => setShowLeaseRenewalModal(true)}
                className="absolute top-1/2 left-0 transform -translate-x-2 -translate-y-1/2 w-18 h-18 rounded-full border-2 border-yellow-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white"
                style={{background: 'rgba(234, 179, 8, 0.4)', backdropFilter: 'blur(10px)'}}>
                <Calendar size={16} className="mb-1" />
                <span className="text-xs font-bold">Renew</span>
                <span className="absolute -top-2 -right-2 bg-yellow-400 px-1 py-0.5 rounded-full text-xs text-black">{expiringLeases.length}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Communication & Reports Wheel */}
      <div className="rounded-3xl p-6 border-2 border-white/30 relative overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(15px)'}}>
        <h3 className="text-lg font-bold text-white mb-6 text-center">Communication</h3>
        <div className="relative flex items-center justify-center">
          {/* Center circle */}
          <div className="absolute w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
            <span className="text-white text-xs font-bold">Connect</span>
          </div>
          
          {/* Communication buttons in triangular formation */}
          <div className="relative w-48 h-48">
            <button
              onClick={() => setShowCommunicationModal(true)}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-20 h-20 rounded-full border-2 border-teal-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white"
              style={{background: 'rgba(20, 184, 166, 0.4)', backdropFilter: 'blur(10px)'}}>
              <Mail size={16} className="mb-1" />
              <span className="text-xs font-bold">Notify</span>
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="absolute bottom-4 left-4 w-20 h-20 rounded-full border-2 border-cyan-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white"
              style={{background: 'rgba(6, 182, 212, 0.4)', backdropFilter: 'blur(10px)'}}>
              <Download size={16} className="mb-1" />
              <span className="text-xs font-bold">Export</span>
            </button>

            <Link
              to={`/dashboard/properties/${propertyId}/settings`}
              className="absolute bottom-4 right-4 w-20 h-20 rounded-full border-2 border-gray-400/50 hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center text-white"
              style={{background: 'rgba(107, 114, 128, 0.4)', backdropFilter: 'blur(10px)'}}>
              <Settings size={16} className="mb-1" />
              <span className="text-xs font-bold">Config</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-3xl p-6 border-2 border-red-400/60 relative overflow-hidden" style={{background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(15px)', boxShadow: '0 0 30px rgba(220, 38, 38, 0.2)'}}>
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10"></div>
        <div className="relative">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-center gap-2">
            <AlertTriangle size={20} className="animate-bounce text-red-300" />
            <span className="bg-gradient-to-r from-red-300 to-orange-300 bg-clip-text text-transparent">Danger Zone</span>
          </h3>
          
          <div className="relative flex items-center justify-center">
            {/* Center warning */}
            <div className="absolute w-16 h-16 rounded-full border-2 border-red-400/50 flex items-center justify-center" style={{background: 'rgba(220, 38, 38, 0.3)'}}>
              <AlertTriangle size={20} className="text-red-300" />
            </div>
            
            {/* Danger buttons - Well separated for safety */}
            <div className="space-y-12">
              {/* Archive Section */}
              <div className="p-4 rounded-2xl border border-yellow-400/30" style={{background: 'rgba(234, 179, 8, 0.1)'}}>
                <div className="text-center mb-4">
                  <h4 className="text-sm font-bold text-yellow-300 mb-2">SAFE ACTION</h4>
                  <p className="text-xs text-yellow-200">Hide property but keep all data</p>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={onArchive}
                    className="w-28 h-28 rounded-full border-2 border-yellow-400/60 hover:scale-105 transition-all duration-500 flex flex-col items-center justify-center text-white group"
                    style={{background: 'rgba(234, 179, 8, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Archive size={20} className="mb-2 group-hover:animate-bounce" />
                    <span className="text-sm font-bold">Archive</span>
                    <span className="text-xs text-yellow-200">Reversible</span>
                  </button>
                </div>
              </div>
              
              {/* Visual Separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-red-400/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 py-2 bg-red-500/20 text-red-300 rounded-full border border-red-400/50">
                    ⚠️ EXTREME DANGER BELOW ⚠️
                  </span>
                </div>
              </div>
              
              {/* Delete Section - Extra separated */}
              <div className="p-6 rounded-2xl border-2 border-red-500/50" style={{background: 'rgba(220, 38, 38, 0.2)', boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)'}}>
                <div className="text-center mb-6">
                  <h4 className="text-lg font-bold text-red-300 mb-2 animate-pulse">⚠️ PERMANENT DELETION ⚠️</h4>
                  <p className="text-sm text-red-200 mb-2">This will DESTROY all data forever!</p>
                  <p className="text-xs text-red-300">• {activeTenants.length} tenants • All payments • All records</p>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      const firstConfirm = confirm(`⚠️ CRITICAL WARNING ⚠️\n\nYou are about to PERMANENTLY DELETE:\n"${property.name}"\n\nThis will destroy ALL data including:\n• ${activeTenants.length} tenant records\n• All payment history\n• All maintenance records\n• All documents\n\nTHIS CANNOT BE UNDONE!\n\nAre you absolutely certain?`);
                      if (firstConfirm) {
                        const secondConfirm = confirm(`⚠️ FINAL CONFIRMATION ⚠️\n\nLast chance to cancel!\n\nDeleting "${property.name}" will:\n• Remove ${activeTenants.length} tenants permanently\n• Erase all financial records\n• Delete all property data\n\nThis is IRREVERSIBLE!\n\nClick OK only if you're 100% sure.`);
                        if (secondConfirm) {
                          const typeConfirm = prompt(`Type exactly: DELETE ${property.name?.toUpperCase()}`);
                          if (typeConfirm === `DELETE ${property.name?.toUpperCase()}`) {
                            alert('🚨 Delete functionality requires admin approval - Contact system administrator');
                          } else {
                            alert('❌ Deletion cancelled - Text did not match exactly');
                          }
                        }
                      }
                    }}
                    className="w-32 h-32 rounded-full border-3 border-red-500/80 hover:scale-105 transition-all duration-500 flex flex-col items-center justify-center text-white group"
                    style={{background: 'rgba(220, 38, 38, 0.4)', backdropFilter: 'blur(10px)', boxShadow: '0 0 15px rgba(220, 38, 38, 0.5)'}}>
                    <Trash2 size={24} className="mb-2 group-hover:animate-pulse" />
                    <span className="text-sm font-bold">DELETE</span>
                    <span className="text-xs text-red-200">PERMANENT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2 text-center">
            <p className="text-xs text-yellow-200">
              Archive: Hide from listings but preserve data
            </p>
            <p className="text-xs text-red-200 font-medium">
              ⚠️ Delete: PERMANENT - Cannot be undone!
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BulkCommunicationModal
        isOpen={showCommunicationModal}
        onClose={() => setShowCommunicationModal(false)}
        tenants={tenants.filter(t => t.status === 'Active')}
        propertyName={property.name}
      />

      <PropertyReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        property={property}
        tenants={tenants}
      />

      <ScheduleMaintenanceModal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        property={property}
        onSuccess={() => {
          // Refresh data or show success message
          console.log('Maintenance scheduled successfully');
        }}
      />

      {hasExpiringLeases && (
        <BulkLeaseRenewalModal
          isOpen={showLeaseRenewalModal}
          onClose={() => setShowLeaseRenewalModal(false)}
          expiringLeases={expiringLeases}
          property={property}
          onSuccess={() => {
            // Refresh data
            console.log('Leases renewed successfully');
          }}
        />
      )}
    </div>
  );
};

export default EnhancedPropertyQuickActions;