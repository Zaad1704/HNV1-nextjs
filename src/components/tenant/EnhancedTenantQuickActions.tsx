import React from 'react';
import Link from 'next/link';
import { 
  DollarSign, Wrench, Calendar, Archive, Edit, Download, 
  AlertTriangle, Trash2, FileText, Mail, User
} from 'lucide-react';
import apiClient from '@/lib/api';

interface EnhancedTenantQuickActionsProps {
  tenant: any;
  tenantId: string;
  payments: any[];
  maintenanceRequests: any[];
  onShowQuickPayment: (type: 'normal' | 'overdue') => void;
  onShowEditModal: () => void;
}

const EnhancedTenantQuickActions: React.FC<EnhancedTenantQuickActionsProps> = ({
  tenant,
  tenantId,
  payments,
  maintenanceRequests,
  onShowQuickPayment,
  onShowEditModal
}) => {
  // Calculate overdue payments
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthPayment = payments.find((p: any) => {
    const paymentDate = new Date(p.paymentDate);
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
  });
  const outstandingAmount = currentMonthPayment ? 0 : (tenant.rentAmount || 0);
  const monthsPaid = payments.length;
  const leaseStartDate = tenant.createdAt ? new Date(tenant.createdAt) : null;
  const monthsSinceStart = leaseStartDate ? 
    (currentYear - leaseStartDate.getFullYear()) * 12 + (currentMonth - leaseStartDate.getMonth()) + 1 : 0;
  
  // Calculate overdue payments
  const monthsOverdue = Math.max(0, monthsSinceStart - monthsPaid);
  const overdueAmount = monthsOverdue * (tenant.rentAmount || 0);
  const hasOverdue = monthsOverdue > 0;

  return (
    <div className="space-y-6">
      {/* Tenant Overview Card */}
      <div className="rounded-3xl p-6 border-2 border-white/20 relative overflow-hidden" 
        style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
        <h3 className="text-lg font-bold text-white mb-4">Tenant Overview</h3>
        
        {/* Tenant Image */}
        <div className="text-center mb-6">
          <div className="w-28 h-28 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white/30 shadow-xl" 
            style={{background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8))'}}>
            {(tenant.tenantImage || tenant.imageUrl) ? (
              <img 
                src={tenant.tenantImage || tenant.imageUrl}
                alt={tenant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-white font-bold text-3xl flex items-center justify-center h-full">
                {tenant.name?.charAt(0).toUpperCase() || 'T'}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/70">Status</span>
            <span className={`px-3 py-1 rounded-full text-sm ${tenant.status === 'Active' ? 'bg-green-500/30 text-green-200' : 'bg-yellow-500/30 text-yellow-200'}`}>
              {tenant.status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Monthly Rent</span>
            <span className="text-green-400 font-medium">${tenant.rentAmount || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Payments Made</span>
            <span className="text-white">{monthsPaid}</span>
          </div>
          {hasOverdue && (
            <div className="flex justify-between items-center">
              <span className="text-white/70">Overdue</span>
              <span className="text-red-400 font-medium">${overdueAmount} ({monthsOverdue} months)</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Actions */}
      <div className="rounded-3xl p-6 border-2 border-white/20 relative overflow-hidden" 
        style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
        <h3 className="text-lg font-bold text-white mb-4">Payment Actions</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onShowQuickPayment('normal')}
            className="quick-action-button scrim-button rounded-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/30 flex items-center justify-center mb-2">
              <DollarSign size={24} className="text-green-200" />
            </div>
            <span className="text-sm font-medium">Quick Payment</span>
          </button>
          
          {hasOverdue ? (
            <button
              onClick={() => onShowQuickPayment('overdue')}
              className="quick-action-button scrim-button rounded-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/30 flex items-center justify-center mb-2">
                <AlertTriangle size={24} className="text-red-200" />
              </div>
              <span className="text-sm font-medium">Overdue Payment</span>
              <div className="text-xs mt-1 text-red-200">
                ${overdueAmount} ({monthsOverdue} months)
              </div>
            </button>
          ) : (
            <div className="quick-action-button rounded-2xl bg-gray-500/20 text-white/70 border border-white/10">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                <AlertTriangle size={24} className="text-white/50" />
              </div>
              <span className="text-sm font-medium">No Overdue</span>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <Link 
            to={`/dashboard/payments?tenantId=${tenant._id}`}
            className="w-full action-button scrim-button rounded-xl py-3 flex items-center justify-center gap-2"
          >
            <FileText size={18} />
            <span>View Payment History</span>
            <span className="ml-1 bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full text-xs">
              {payments.length}
            </span>
          </Link>
        </div>
      </div>

      {/* Maintenance Actions */}
      <div className="rounded-3xl p-6 border-2 border-white/20 relative overflow-hidden" 
        style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
        <h3 className="text-lg font-bold text-white mb-4">Maintenance</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={async () => {
              const description = prompt('Describe the maintenance issue:');
              if (description) {
                const priority = prompt('Priority (Low/Medium/High):', 'Medium');
                try {
                  await apiClient.post('/maintenance', {
                    tenantId: tenant._id,
                    propertyId: tenant.propertyId?._id || tenant.propertyId,
                    description,
                    priority: priority || 'Medium'
                  });
                  alert('Maintenance request submitted successfully!');
                  window.location.reload();
                } catch (error: any) {
                  alert(`Failed to submit maintenance request: ${error.response?.data?.message || 'Unknown error'}`);
                }
              }
            }}
            className="quick-action-button scrim-button rounded-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-orange-500/30 flex items-center justify-center mb-2">
              <Wrench size={24} className="text-orange-200" />
            </div>
            <span className="text-sm font-medium">Report Issue</span>
          </button>
          
          <Link 
            to={`/dashboard/maintenance?tenantId=${tenant._id}`}
            className="quick-action-button scrim-button rounded-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center mb-2">
              <Wrench size={24} className="text-purple-200" />
            </div>
            <span className="text-sm font-medium">View Issues</span>
            <span className="text-xs text-purple-200">({maintenanceRequests?.length || 0})</span>
          </Link>
        </div>
      </div>

      {/* Lease Management */}
      <div className="rounded-3xl p-6 border-2 border-white/20 relative overflow-hidden" 
        style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
        <h3 className="text-lg font-bold text-white mb-4">Lease Management</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={async () => {
              const months = prompt('Enter additional months to extend lease:', '12');
              if (months && !isNaN(Number(months))) {
                try {
                  const currentEndDate = tenant.leaseEndDate ? new Date(tenant.leaseEndDate) : new Date();
                  const newEndDate = new Date(currentEndDate);
                  newEndDate.setMonth(newEndDate.getMonth() + parseInt(months));
                  
                  await apiClient.put(`/tenants/${tenant._id}`, {
                    leaseEndDate: newEndDate.toISOString().split('T')[0],
                    leaseDuration: (tenant.leaseDuration || 12) + parseInt(months)
                  });
                  alert(`Lease extended by ${months} months successfully!`);
                  window.location.reload();
                } catch (error: any) {
                  alert(`Failed to renew lease: ${error.response?.data?.message || 'Unknown error'}`);
                }
              }
            }}
            className="quick-action-button scrim-button rounded-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-500/30 flex items-center justify-center mb-2">
              <Calendar size={24} className="text-indigo-200" />
            </div>
            <span className="text-sm font-medium">Renew Lease</span>
          </button>
          
          <button
            onClick={async () => {
              const response = await apiClient.post(`/tenants/${tenantId}/download-pdf`, {}, { responseType: 'blob' });
              const blob = new Blob([response.data], { type: 'application/pdf' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${tenant.name}-details.pdf`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="quick-action-button scrim-button rounded-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center mb-2">
              <Download size={24} className="text-blue-200" />
            </div>
            <span className="text-sm font-medium">Download Details</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-3xl p-6 border-2 border-red-400/60 relative overflow-hidden" 
        style={{background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(15px)', boxShadow: '0 0 30px rgba(220, 38, 38, 0.2)'}}>
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10"></div>
        <div className="relative">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-center gap-2">
            <AlertTriangle size={20} className="animate-bounce text-red-300" />
            <span className="bg-gradient-to-r from-red-300 to-orange-300 bg-clip-text text-transparent">Danger Zone</span>
          </h3>
          
          <div className="space-y-8">
            {/* Archive Section */}
            <div className="p-4 rounded-2xl border border-yellow-400/30" style={{background: 'rgba(234, 179, 8, 0.1)'}}>
              <div className="text-center mb-4">
                <h4 className="text-sm font-bold text-yellow-300 mb-2">SAFE ACTION</h4>
                <p className="text-xs text-yellow-200">Hide tenant but keep all data</p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={async () => {
                    const isCurrentlyArchived = tenant.status === 'Archived';
                    const action = isCurrentlyArchived ? 'restore' : 'archive';
                    const confirmMessage = isCurrentlyArchived 
                      ? `Restore ${tenant.name}? This will make them active again.`
                      : `Archive ${tenant.name}? This will hide them from active listings.`;
                    
                    if (confirm(confirmMessage)) {
                      try {
                        await apiClient.put(`/tenants/${tenantId}`, {
                          status: isCurrentlyArchived ? 'Active' : 'Archived'
                        });
                        alert(`Tenant ${action}d successfully!`);
                        window.location.reload();
                      } catch (error: any) {
                        alert(`Failed to ${action} tenant: ${error.response?.data?.message || 'Unknown error'}`);
                      }
                    }
                  }}
                  className="w-28 h-28 rounded-full border-2 border-yellow-400/60 hover:scale-105 transition-all duration-500 flex flex-col items-center justify-center text-white group scrim-button"
                >
                  <Archive size={20} className="mb-2 group-hover:animate-bounce" />
                  <span className="text-sm font-bold">
                    {tenant.status === 'Archived' ? 'Restore' : 'Archive'}
                  </span>
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
            
            {/* Delete Section */}
            <div className="p-6 rounded-2xl border-2 border-red-500/50" style={{background: 'rgba(220, 38, 38, 0.2)', boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)'}}>
              <div className="text-center mb-6">
                <h4 className="text-lg font-bold text-red-300 mb-2 animate-pulse">⚠️ PERMANENT DELETION ⚠️</h4>
                <p className="text-sm text-red-200 mb-2">This will DESTROY all tenant data forever!</p>
                <p className="text-xs text-red-300">• All payments • All records • All documents</p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={async () => {
                    if (confirm(`Delete ${tenant.name}? This action cannot be undone and will remove all associated data.`)) {
                      try {
                        await apiClient.delete(`/tenants/${tenantId}`);
                        alert('Tenant deleted successfully!');
                        window.location.href = '/dashboard/tenants';
                      } catch (error: any) {
                        alert(`Failed to delete tenant: ${error.response?.data?.message || 'Unknown error'}`);
                      }
                    }
                  }}
                  className="w-32 h-32 rounded-full border-3 border-red-500/80 hover:scale-105 transition-all duration-500 flex flex-col items-center justify-center text-white group scrim-button"
                  style={{boxShadow: '0 0 15px rgba(220, 38, 38, 0.5)'}}
                >
                  <Trash2 size={24} className="mb-2 group-hover:animate-pulse" />
                  <span className="text-sm font-bold">DELETE</span>
                  <span className="text-xs text-red-200">PERMANENT</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTenantQuickActions;