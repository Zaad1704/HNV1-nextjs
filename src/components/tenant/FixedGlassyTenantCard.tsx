import React, { useState } from 'react';
import Link from 'next/link';
import { User, Edit, Trash2, Share2, Eye, Users, DollarSign, AlertTriangle, Wrench, Check, Edit3, Archive, Mail, Phone, Calendar, CheckCircle, Clock, TrendingUp, MessageCircle, Home } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';
import ShareButton from '@/components/common/ShareButton';
import TenantAvatar from '@/components/common/TenantAvatar';
import EnhancedActionDropdown from '@/components/common/EnhancedActionDropdown';
import { getTenantActions } from '@/utils/actionConfigs';

interface FixedGlassyTenantCardProps {
  tenant: any;
  index: number;
  onEdit: (tenant: any) => void;
  onDelete: (tenantId: string) => void;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: (tenantId: string, selected: boolean) => void;
}

const FixedGlassyTenantCard: React.FC<FixedGlassyTenantCardProps> = ({
  tenant,
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
    queryKey: ['tenantProperty', tenant.propertyId?._id || tenant.propertyId],
    queryFn: async () => {
      const propertyId = tenant.propertyId?._id || tenant.propertyId;
      if (!propertyId) return null;
      try {
        const { data } = await apiClient.get(`/properties/${propertyId}`);
        return data.data;
      } catch (error) {
        return null;
      }
    },
    enabled: !!(tenant.propertyId?._id || tenant.propertyId),
    staleTime: 600000
  });

  const getUnitDisplay = () => {
    if (tenant.unitNickname) {
      return `${tenant.unit} (${tenant.unitNickname})`;
    }
    return tenant.unit || 'N/A';
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
    
    if (tenant.status === 'Late') return { color: 'red', text: 'Late Payment', icon: AlertTriangle, amount: rentAmount };
    if (currentMonthPaid > 0 && currentMonthPaid < rentAmount) return { color: 'orange', text: 'Partial Payment', icon: Clock, amount: rentAmount - currentMonthPaid };
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
              onSelect?.(tenant._id, !isSelected);
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
      
      {/* Tenant Image */}
      <div className="h-48 relative overflow-hidden rounded-3xl mb-4" style={{backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(0, 0, 0, 0.2)'}}>
        {/* Main Tenant Image */}
        {tenant.imageUrl || tenant.tenantImage ? (
          <img
            src={tenant.imageUrl || tenant.tenantImage}
            alt={tenant.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-all duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-icon');
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`fallback-icon w-full h-full flex items-center justify-center ${tenant.imageUrl || tenant.tenantImage ? 'hidden' : ''}`}>
          <User size={32} className="text-white" />
        </div>
        
        {/* Property Photo Overlay */}
        <div className="absolute top-4 left-4">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden">
            {tenantProperty?.imageUrl && tenantProperty.imageUrl.trim() !== '' ? (
              <img
                src={tenantProperty.imageUrl.startsWith('/') ? `${window.location.origin}${tenantProperty.imageUrl}` : tenantProperty.imageUrl}
                alt={tenantProperty.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.property-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`property-fallback w-full h-full flex items-center justify-center text-white font-bold text-lg ${tenantProperty?.imageUrl && tenantProperty.imageUrl.trim() !== '' ? 'hidden' : ''}`}>
              <Home size={16} className="text-white" />
            </div>
          </div>
        </div>
        
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {/* Water Drop Animation */}
          <div className="absolute -inset-8 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-orange-300 rounded-full animate-bounce opacity-60"
                style={{
                  left: `${15 + i * 10}%`,
                  top: `${8 + i * 4}%`,
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: '2.5s',
                  animationIterationCount: 'infinite'
                }}
              />
            ))}
          </div>
          <UniversalStatusBadge 
            status={tenant.status} 
            variant={tenant.status === 'Active' ? 'success' : 'warning'}
          />
          {paymentStatus.amount > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              ${paymentStatus.amount} due
            </span>
          )}
          {leaseStatus?.urgent && (
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {leaseStatus.text}
            </span>
          )}
        </div>
        
        {/* Payment Progress Bar */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/20 backdrop-blur-sm rounded-full p-2">
            <div className="flex items-center justify-between text-white text-xs mb-1">
              <span>Payment Status</span>
              <span>{paymentStatus.text}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  paymentStatus.color === 'green' ? 'bg-green-400' :
                  paymentStatus.color === 'yellow' ? 'bg-yellow-400' : 
                  paymentStatus.color === 'orange' ? 'bg-orange-400' : 'bg-red-400'
                }`}
                style={{ width: `${tenant.rentAmount ? Math.max(0, Math.min(100, ((tenant.rentAmount - paymentStatus.amount) / tenant.rentAmount) * 100)) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant Info */}
      <div className="space-y-4 p-6">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
            {tenant.name}
          </h3>
          <p className="text-sm text-white/80">{tenant.email}</p>
          <p className="text-xs text-white/70 mt-1">
            {tenantProperty?.name ? `${tenantProperty.name} - Unit ${tenant.unit || 'N/A'}` : `Unit ${tenant.unit || 'N/A'}`}
          </p>
        </div>

        {/* Enhanced Tenant Metrics */}
        <div className="rounded-2xl p-4 space-y-3 border border-white/40" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.15), rgba(66,165,245,0.15), rgba(102,187,106,0.1))', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)'}}>
          {/* Rent Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-green-300" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))', strokeWidth: 2.5}} />
              <span className="text-sm text-white font-semibold" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>Monthly Rent</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-green-300 text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>${tenant.rentAmount?.toLocaleString() || 0}</span>
              <div className="text-xs text-white font-medium" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                {paymentStatus.text}
              </div>
            </div>
          </div>
          
          {/* Payment Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <paymentStatus.icon size={18} className="text-blue-300" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))', strokeWidth: 2.5}} />
                <span className="text-sm text-white font-semibold" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>Payment Status</span>
              </div>
              <span className="font-semibold text-white text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                {paymentStatus.amount > 0 ? `$${paymentStatus.amount} due` : 'Paid'}
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  paymentStatus.color === 'green' ? 'bg-green-500' :
                  paymentStatus.color === 'yellow' ? 'bg-yellow-500' : 
                  paymentStatus.color === 'orange' ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${tenant.rentAmount ? Math.max(0, Math.min(100, ((tenant.rentAmount - paymentStatus.amount) / tenant.rentAmount) * 100)) : 0}%` }}
              ></div>
            </div>
          </div>
          
          {/* Tenant Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-400" />
              <span className="text-sm text-white/80">Tenant Score</span>
            </div>
            <span className="font-semibold text-white">
              {tenantScore}/100
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                scoreColor === 'green' ? 'bg-green-500' :
                scoreColor === 'blue' ? 'bg-blue-500' :
                scoreColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                {tenantScore >= 90 ? 'Excellent' : tenantScore >= 80 ? 'Good' : tenantScore >= 70 ? 'Fair' : 'Poor'}
              </span>
            </span>
          </div>
          
          {/* Lease Status */}
          {tenant.leaseEndDate && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-orange-400" />
                <span className="text-sm text-white/80">Lease Expires</span>
              </div>
              <span className="font-semibold text-white">
                {new Date(tenant.leaseEndDate).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {/* Last Activity */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70">Last payment</span>
            <span className="text-white/70">
              {lastPayment ? (daysSinceLastPayment === 0 ? 'Today' : daysSinceLastPayment === 1 ? '1 day ago' : `${daysSinceLastPayment} days ago`) : 'No payments'}
            </span>
          </div>
        </div>
        
        {/* Payment History Mini Chart */}
        {paymentHistory.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">Payment History:</span>
              <span className="text-xs text-white/70">{payments.length} payments</span>
            </div>
            <div className="flex items-end gap-1 h-8 justify-center">
              {paymentHistory.map((payment: any, idx: number) => {
                const height = Math.max(4, (payment.amount / (tenant.rentAmount || 1000)) * 32);
                return (
                  <div
                    key={idx}
                    className={`w-2 bg-white/60 rounded-full transition-all duration-300 hover:bg-white`}
                    style={{ height: `${Math.min(height, 32)}px` }}
                    title={`$${payment.amount} - ${new Date(payment.paymentDate).toLocaleDateString()}`}
                  ></div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to={`/dashboard/tenants/${tenant._id}`}
            className="w-full bg-gradient-to-r from-orange-500 to-blue-500 text-white py-3 px-4 rounded-2xl text-sm font-semibold transition-all hover:shadow-xl text-center block group-hover:scale-105 transform flex items-center justify-center gap-2 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-blue-400/20 animate-pulse"></div>
            {/* Payment Emitting Animation */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-40"
                  style={{
                    left: `${20 + i * 20}%`,
                    top: `${30 + i * 10}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </div>
            <Eye size={16} className="relative z-10" />
            <span className="relative z-10">View Details</span>
          </Link>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit?.(tenant);
              }}
              className="bg-gradient-to-r from-orange-400 to-orange-500 text-white py-2 px-3 rounded-xl text-xs font-medium hover:shadow-md transition-all flex items-center justify-center gap-1 hover:scale-105 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-300/20 to-orange-600/20 animate-pulse"></div>
              <Edit size={12} className="relative z-10" />
              <span className="relative z-10">Edit</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/dashboard/tenants/${tenant._id}#payment`;
              }}
              className="bg-gradient-to-r from-blue-400 to-blue-500 text-white py-2 px-3 rounded-xl text-xs font-medium hover:shadow-md transition-all flex items-center justify-center gap-1 hover:scale-105 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-300/20 to-blue-600/20 animate-pulse"></div>
              <DollarSign size={12} className="relative z-10" />
              <span className="relative z-10">Payment</span>
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                if (confirm(`Archive ${tenant.name}? This will hide them from active listings but preserve all data.`)) {
                  onDelete?.(tenant._id);
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
                title: tenant.name,
                text: `Tenant: ${tenant.name}\nUnit: ${getUnitDisplay()}\nRent: $${tenant.rentAmount}`,
                url: `${window.location.origin}/dashboard/tenants/${tenant._id}`
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

export default FixedGlassyTenantCard;