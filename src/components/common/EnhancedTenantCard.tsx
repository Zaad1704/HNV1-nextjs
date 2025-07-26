import React from 'react';
import Link from 'next/link';
import { User, Edit, Trash2, DollarSign, Calendar, MapPin, Phone, Mail, Building2, AlertTriangle, CheckCircle, Clock, TrendingUp, Archive, Share2, Eye, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import UniversalCard from './UniversalCard';
import UniversalStatusBadge from './UniversalStatusBadge';
import ShareButton from './ShareButton';

interface EnhancedTenantCardProps {
  tenant: any;
  property?: any;
  index: number;
  onEdit?: (tenant: any) => void;
  onDelete?: (tenantId: string) => void;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: (tenantId: string, selected: boolean) => void;
}

const EnhancedTenantCard: React.FC<EnhancedTenantCardProps> = ({
  tenant,
  property,
  index,
  onEdit,
  onDelete,
  showCheckbox = false,
  isSelected = false,
  onSelect
}) => {
  // Fetch payment data for this tenant
  const { data: payments = [] } = useQuery({
    queryKey: ['tenantPayments', tenant._id],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/payments?tenantId=${tenant._id}`);
        return data.data || [];
      } catch (error) {
        return [];
      }
    },
    staleTime: 300000
  });

  // Fetch property data if not provided
  const { data: tenantProperty } = useQuery({
    queryKey: ['tenantProperty', tenant.propertyId],
    queryFn: async () => {
      if (!tenant.propertyId || property) return null;
      try {
        const { data } = await apiClient.get(`/properties/${tenant.propertyId}`);
        return data.data;
      } catch (error) {
        return null;
      }
    },
    enabled: !property && !!tenant.propertyId,
    staleTime: 600000
  });

  const currentProperty = property || tenantProperty;
  const getUnitDisplay = () => {
    if (tenant.unitNickname) {
      return `${tenant.unit} (${tenant.unitNickname})`;
    }
    return tenant.unit || 'N/A';
  };

  const getDaysUntilRent = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const diffTime = nextMonth.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPaymentStatus = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthPayments = payments.filter((p: any) => {
      const paymentDate = new Date(p.paymentDate);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });
    const currentMonthPaid = currentMonthPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const rentAmount = tenant.rentAmount || 0;
    
    if (tenant.status === 'Late') return { color: 'red', text: 'Late Payment', icon: AlertTriangle, amount: rentAmount - currentMonthPaid };
    if (currentMonthPaid < rentAmount) return { color: 'orange', text: 'Partial Payment', icon: Clock, amount: rentAmount - currentMonthPaid };
    if (currentMonthPaid >= rentAmount) return { color: 'green', text: 'Paid', icon: CheckCircle, amount: 0 };
    return { color: 'yellow', text: 'Payment Due', icon: Clock, amount: rentAmount };
  };

  const getLeaseStatus = () => {
    if (!tenant.leaseEndDate) return null;
    const endDate = new Date(tenant.leaseEndDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { color: 'red', text: 'Expired', urgent: true };
    if (daysUntilExpiry <= 30) return { color: 'orange', text: 'Expiring Soon', urgent: true };
    if (daysUntilExpiry <= 90) return { color: 'yellow', text: 'Renewal Due', urgent: false };
    return null;
  };

  const paymentStatus = getPaymentStatus();
  const leaseStatus = getLeaseStatus();
  const totalPaid = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const paymentHistory = payments.slice(0, 6).reverse();
  const lastPayment = payments[0];
  const daysSinceLastPayment = lastPayment ? Math.floor((Date.now() - new Date(lastPayment.paymentDate).getTime()) / (1000 * 60 * 60 * 24)) : null;
  
  // Calculate tenant score
  const calculateTenantScore = () => {
    if (payments.length === 0) return 85; // Default score for new tenants
    
    const recentPayments = payments.slice(0, 6); // Last 6 payments
    const onTimePayments = recentPayments.filter((p: any) => {
      const paymentDate = new Date(p.paymentDate);
      const expectedDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 5);
      return paymentDate <= expectedDate;
    }).length;
    
    const punctualityScore = recentPayments.length > 0 ? (onTimePayments / recentPayments.length) * 100 : 100;
    const statusBonus = tenant.status === 'Active' ? 10 : tenant.status === 'Late' ? -20 : 0;
    
    return Math.min(100, Math.max(0, Math.round(punctualityScore + statusBonus)));
  };
  
  const tenantScore = calculateTenantScore();
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 80) return 'blue';
    if (score >= 70) return 'yellow';
    return 'red';
  };
  const scoreColor = getScoreColor(tenantScore);

  return (
    <UniversalCard delay={index * 0.1} gradient="green" className={`relative group hover:scale-105 transition-all duration-300 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Selection Checkbox */}
      {showCheckbox && (
        <div className="absolute top-3 left-3 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect?.(tenant._id, !isSelected);
            }}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
              isSelected 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'bg-white/90 border-gray-300 hover:border-blue-400'
            }`}
          >
            {isSelected && <CheckCircle size={14} />}
          </button>
        </div>
      )}

      {/* Enhanced Status Indicators */}
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <UniversalStatusBadge 
          status={tenant.status} 
          variant={tenant.status === 'Active' ? 'success' : 'warning'}
        />
        <span className={`bg-${paymentStatus.color}-100 text-${paymentStatus.color}-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
          <paymentStatus.icon size={10} />
          {paymentStatus.text}
        </span>
        {leaseStatus?.urgent && (
          <span className={`bg-${leaseStatus.color}-100 text-${leaseStatus.color}-800 px-2 py-1 rounded-full text-xs font-medium`}>
            {leaseStatus.text}
          </span>
        )}
        {paymentStatus.amount > 0 && (
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            ${paymentStatus.amount}
          </span>
        )}
      </div>

      {/* Enhanced Property Thumbnail with Tenant Photo */}
      <div className="h-32 bg-gradient-to-br from-green-500 via-blue-600 to-purple-600 relative overflow-hidden rounded-2xl mb-4">
        {currentProperty?.imageUrl ? (
          <img
            src={currentProperty.imageUrl.startsWith('/') ? `${window.location.origin}${currentProperty.imageUrl}` : currentProperty.imageUrl}
            alt={currentProperty.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 size={32} className="text-white" />
          </div>
        )}
        
        {/* Tenant Photo Overlay */}
        <div className="absolute top-3 left-3">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden">
            {tenant.imageUrl || tenant.tenantImage ? (
              <img
                src={tenant.imageUrl || tenant.tenantImage}
                alt={tenant.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.tenant-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`tenant-fallback w-full h-full flex items-center justify-center text-white font-bold text-sm ${tenant.imageUrl || tenant.tenantImage ? 'hidden' : ''}`}>
              {tenant.name?.charAt(0).toUpperCase() || 'T'}
            </div>
          </div>
        </div>
        
        {/* Property Info Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3">
            <div className="text-white font-medium text-sm">{currentProperty?.name || 'Property'}</div>
            <div className="text-white/80 text-xs">Unit {getUnitDisplay()}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-white/70 text-xs">Monthly Rent</span>
              <span className="text-white font-bold text-sm">${tenant.rentAmount?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Payment History Mini Chart */}
        {paymentHistory.length > 0 && (
          <div className="absolute bottom-3 right-3">
            <div className="flex items-end gap-1 h-8">
              {paymentHistory.map((payment: any, idx: number) => {
                const height = Math.max(4, (payment.amount / (tenant.rentAmount || 1000)) * 32);
                return (
                  <div
                    key={idx}
                    className={`w-1 bg-white/60 rounded-full transition-all duration-300 hover:bg-white`}
                    style={{ height: `${Math.min(height, 32)}px` }}
                    title={`$${payment.amount} - ${new Date(payment.paymentDate).toLocaleDateString()}`}
                  ></div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Tenant Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-text-primary group-hover:text-green-600 transition-colors">{tenant.name}</h3>
            <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
              <Mail size={12} />
              <span className="truncate">{tenant.email}</span>
            </div>
          </div>
          <div className="text-right">
            {lastPayment && (
              <div className="text-xs text-text-muted">
                Last payment: {daysSinceLastPayment === 0 ? 'Today' : `${daysSinceLastPayment}d ago`}
              </div>
            )}
            <div className="text-xs text-text-secondary">
              Total paid: ${totalPaid.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tenant Info */}
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 space-y-3 border border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 bg-${paymentStatus.color}-500 rounded-lg flex items-center justify-center`}>
                <DollarSign size={16} className="text-white" />
              </div>
              <div>
                <span className="text-sm font-medium text-text-primary">Monthly Rent</span>
                <div className="text-xs text-text-muted">Due monthly</div>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-2xl text-green-600">${tenant.rentAmount?.toLocaleString() || 0}</span>
              {paymentStatus.amount > 0 && (
                <div className="text-xs text-red-600 font-medium">Outstanding: ${paymentStatus.amount}</div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 bg-${paymentStatus.color}-500 rounded-lg flex items-center justify-center`}>
                <paymentStatus.icon size={16} className="text-white" />
              </div>
              <div>
                <span className="text-sm font-medium text-text-primary">Payment Status</span>
                <div className="text-xs text-text-muted">Current month</div>
              </div>
            </div>
            <span className={`font-bold text-${paymentStatus.color}-600 px-3 py-1 bg-${paymentStatus.color}-100 rounded-full text-sm`}>
              {paymentStatus.text}
            </span>
          </div>
          
          {tenant.leaseEndDate && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Calendar size={16} className="text-white" />
                </div>
                <div>
                  <span className="text-sm font-medium text-text-primary">Lease Expires</span>
                  <div className="text-xs text-text-muted">
                    {Math.ceil((new Date(tenant.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              </div>
              <span className="font-semibold text-text-primary text-sm">
                {new Date(tenant.leaseEndDate).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {/* Payment History Progress */}
          {payments.length > 0 && (
            <div className="pt-2 border-t border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-secondary">Payment History</span>
                <span className="text-xs text-text-muted">{payments.length} payments</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((payments.length / 12) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Contact & Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Phone size={14} className="text-blue-600" />
              <span className="text-xs text-blue-800 font-medium">Contact</span>
            </div>
            <div className="text-sm font-semibold text-blue-900">{tenant.phone || 'No phone'}</div>
            {tenant.whatsappNumber && (
              <div className="text-xs text-blue-700">WhatsApp: {tenant.whatsappNumber}</div>
            )}
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-purple-600" />
              <span className="text-xs text-purple-800 font-medium">Tenant Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-lg font-bold text-purple-900">{tenantScore}</div>
              <div className="flex-1">
                <div className="w-full bg-purple-200 rounded-full h-1.5">
                  <div 
                    className={`bg-${scoreColor}-500 h-1.5 rounded-full transition-all duration-500`}
                    style={{ width: `${tenantScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-xs text-purple-700">
              {tenantScore >= 90 ? 'Excellent' : tenantScore >= 80 ? 'Good' : tenantScore >= 70 ? 'Fair' : 'Poor'} tenant
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="space-y-3">
          <Link
            to={`/dashboard/tenants/${tenant._id}`}
            className="w-full gradient-dark-green-blue text-white py-3 px-4 rounded-2xl text-sm font-semibold transition-all hover:shadow-xl text-center block group-hover:scale-105 transform flex items-center justify-center gap-2"
          >
            <Eye size={16} />
            View Details
          </Link>
          
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-green-100 text-green-800 py-2 px-3 rounded-xl text-xs font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-1">
              <DollarSign size={12} />
              Payment
            </button>
            <button className="bg-blue-100 text-blue-800 py-2 px-3 rounded-xl text-xs font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-1">
              <MessageCircle size={12} />
              Message
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit?.(tenant);
              }}
              className="bg-purple-100 text-purple-800 py-2 px-3 rounded-xl text-xs font-medium hover:bg-purple-200 transition-colors flex items-center justify-center gap-1"
            >
              <Edit size={12} />
              Edit
            </button>
            <ShareButton
              data={{
                title: tenant.name,
                text: `Tenant: ${tenant.name}\nUnit: ${getUnitDisplay()}\nRent: $${tenant.rentAmount}`,
                url: `${window.location.origin}/dashboard/tenants/${tenant._id}`
              }}
              className="bg-orange-100 text-orange-800 py-2 px-3 rounded-xl text-xs font-medium hover:bg-orange-200 transition-colors flex items-center justify-center gap-1"
            >
              <Share2 size={12} />
              Share
            </ShareButton>
          </div>
          
          {tenant.status !== 'Archived' && (
            <button
              onClick={(e) => {
                e.preventDefault();
                if (confirm(`Archive ${tenant.name}? This will hide them from active listings but preserve all data.`)) {
                  onDelete?.(tenant._id);
                }
              }}
              className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
            >
              <Archive size={12} />
              Archive Tenant
            </button>
          )}
        </div>
      </div>
    </UniversalCard>
  );
};

export default EnhancedTenantCard;