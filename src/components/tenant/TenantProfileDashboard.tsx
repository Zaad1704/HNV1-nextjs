import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Phone, Mail, MapPin, Calendar, DollarSign, FileText, MessageCircle, Star, AlertTriangle } from 'lucide-react';
import apiClient from '@/lib/api';
import TenantAnalyticsDashboard from './TenantAnalyticsDashboard';
import TenantPaymentTimeline from './TenantPaymentTimeline';
import TenantScoreCard from './TenantScoreCard';

interface TenantProfileDashboardProps {
  tenantId: string;
  className?: string;
}

const TenantProfileDashboard: React.FC<TenantProfileDashboardProps> = ({ tenantId, className = '' }) => {
  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tenants/${tenantId}`);
      return data.data;
    }
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['tenantPayments', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/payments?tenantId=${tenantId}`);
      return data.data || [];
    }
  });

  const { data: maintenance = [] } = useQuery({
    queryKey: ['tenantMaintenance', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/maintenance?tenantId=${tenantId}`);
      return data.data || [];
    }
  });

  if (isLoading) {
    return (
      <div className={`animate-pulse space-y-6 ${className}`}>
        <div className="h-64 rounded-2xl" style={{background: 'rgba(255, 255, 255, 0.1)'}}></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)'}}></div>
          <div className="h-48 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)'}}></div>
          <div className="h-48 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)'}}></div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12 rounded-2xl" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
        <User size={48} className="text-white/50 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Tenant Not Found</h3>
        <p className="text-white/70">The requested tenant profile could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className={`mobile-space-y ${className}`}>
      {/* Mobile-Optimized Tenant Header */}
      <div className="rounded-xl md:rounded-2xl p-6 md:p-8 text-white border-2 border-white/40" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.3), rgba(66,165,245,0.3))', backdropFilter: 'blur(15px)'}}>
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {tenant.imageUrl || tenant.tenantImage ? (
              <img
                src={tenant.imageUrl || tenant.tenantImage}
                alt={tenant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={32} className="text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{tenant.name}</h1>
            <div className="flex items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Unit {tenant.unit} • {tenant.propertyId?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Since {new Date(tenant.leaseStartDate || tenant.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                tenant.status === 'Active' ? 'bg-green-500/20 text-green-100' :
                tenant.status === 'Late' ? 'bg-red-500/20 text-red-100' :
                'bg-yellow-500/20 text-yellow-100'
              }`}>
                {tenant.status}
              </div>
              <div className="text-2xl font-bold">${tenant.rentAmount?.toLocaleString() || 0}/month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Quick Stats */}
      <div className="mobile-grid-4">
        <div className="rounded-xl p-6 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-green-300" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                ${payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-white/70">Total Paid</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-blue-300" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{payments.length}</div>
              <div className="text-sm text-white/70">Payments Made</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-400/20 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-orange-300" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{maintenance.length}</div>
              <div className="text-sm text-white/70">Maintenance Requests</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-400/20 rounded-lg flex items-center justify-center">
              <Star size={20} className="text-purple-300" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {tenant.status === 'Active' ? '85' : tenant.status === 'Late' ? '60' : '75'}
              </div>
              <div className="text-sm text-white/70">Tenant Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Main Content */}
      <div className="mobile-grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Left Column - Contact & Details */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="rounded-2xl p-6 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
            <h3 className="font-bold text-lg text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-blue-300" />
                <div>
                  <div className="font-medium text-white">{tenant.email}</div>
                  <div className="text-sm text-white/70">Primary Email</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-green-300" />
                <div>
                  <div className="font-medium text-white">{tenant.phone || 'Not provided'}</div>
                  <div className="text-sm text-white/70">Phone Number</div>
                </div>
              </div>
              {tenant.whatsappNumber && (
                <div className="flex items-center gap-3">
                  <MessageCircle size={16} className="text-purple-300" />
                  <div>
                    <div className="font-medium text-white">{tenant.whatsappNumber}</div>
                    <div className="text-sm text-white/70">WhatsApp</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personal Details */}
          <div className="rounded-2xl p-6 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
            <h3 className="font-bold text-lg text-white mb-4">Personal Details</h3>
            <div className="space-y-3">
              {tenant.fatherName && (
                <div>
                  <div className="text-sm text-white/70">Father's Name</div>
                  <div className="font-medium text-white">{tenant.fatherName}</div>
                </div>
              )}
              {tenant.motherName && (
                <div>
                  <div className="text-sm text-white/70">Mother's Name</div>
                  <div className="font-medium text-white">{tenant.motherName}</div>
                </div>
              )}
              {tenant.occupation && (
                <div>
                  <div className="text-sm text-white/70">Occupation</div>
                  <div className="font-medium text-white">{tenant.occupation}</div>
                </div>
              )}
              {tenant.monthlyIncome && (
                <div>
                  <div className="text-sm text-white/70">Monthly Income</div>
                  <div className="font-medium text-green-300">${tenant.monthlyIncome.toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          {tenant.emergencyContact?.name && (
            <div className="rounded-2xl p-6 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
              <h3 className="font-bold text-lg text-white mb-4">Emergency Contact</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-white/70">Name</div>
                  <div className="font-medium text-white">{tenant.emergencyContact.name}</div>
                </div>
                {tenant.emergencyContact.phone && (
                  <div>
                    <div className="text-sm text-white/70">Phone</div>
                    <div className="font-medium text-white">{tenant.emergencyContact.phone}</div>
                  </div>
                )}
                {tenant.emergencyContact.relation && (
                  <div>
                    <div className="text-sm text-white/70">Relationship</div>
                    <div className="font-medium text-white">{tenant.emergencyContact.relation}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Analytics & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tenant Score Card */}
          <TenantScoreCard tenant={tenant} payments={payments} />

          {/* Analytics Dashboard */}
          <TenantAnalyticsDashboard tenantId={tenantId} />

          {/* Payment Timeline */}
          <TenantPaymentTimeline tenantId={tenantId} />
        </div>
      </div>

      {/* Additional Information */}
      {(tenant.presentAddress || tenant.permanentAddress || tenant.vehicleDetails || tenant.petDetails) && (
        <div className="rounded-2xl p-6 border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
          <h3 className="font-bold text-lg text-white mb-4">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tenant.presentAddress && (
              <div>
                <div className="text-sm text-white/70 mb-1">Present Address</div>
                <div className="font-medium text-white">{tenant.presentAddress}</div>
              </div>
            )}
            {tenant.permanentAddress && (
              <div>
                <div className="text-sm text-white/70 mb-1">Permanent Address</div>
                <div className="font-medium text-white">{tenant.permanentAddress}</div>
              </div>
            )}
            {tenant.vehicleDetails && (
              <div>
                <div className="text-sm text-white/70 mb-1">Vehicle Details</div>
                <div className="font-medium text-white">{tenant.vehicleDetails}</div>
              </div>
            )}
            {tenant.petDetails && (
              <div>
                <div className="text-sm text-white/70 mb-1">Pet Details</div>
                <div className="font-medium text-white">{tenant.petDetails}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantProfileDashboard;