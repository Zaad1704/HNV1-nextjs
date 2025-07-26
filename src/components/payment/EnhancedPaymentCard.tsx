import React from 'react';
import Link from 'next/link';
import { DollarSign, Calendar, User, Building2, Download, Printer, Share2 } from 'lucide-react';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';

interface EnhancedPaymentCardProps {
  payment: any;
  currency: string;
  onDownloadReceipt: (paymentId: string) => void;
  onPrintReceipt: (paymentId: string) => void;
  onShare: (payment: any) => void;
}

const EnhancedPaymentCard: React.FC<EnhancedPaymentCardProps> = ({
  payment,
  currency,
  onDownloadReceipt,
  onPrintReceipt,
  onShare
}) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Payment of ${currency}${payment.amount}`,
        text: `Payment of ${currency}${payment.amount} for ${payment.tenantId?.name || 'Unknown Tenant'}`,
        url: window.location.origin + `/dashboard/payments-universal/${payment._id}`
      }).catch(err => console.error('Error sharing', err));
    } else {
      onShare(payment);
    }
  };

  return (
    <div className="border-2 border-white/20 rounded-3xl shadow-2xl overflow-hidden relative hover:border-white/30 transition-all duration-500 hover:scale-105"
         style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(0, 0, 0, 0.3)' }}>
      
      {/* Header with tenant and property images */}
      <div className="relative h-32 flex items-center justify-between p-4 overflow-hidden">
        {/* Tenant Image - Larger */}
        <div className="relative z-10">
          {payment.tenantId?.profileImage ? (
            <img 
              src={payment.tenantId.profileImage} 
              alt={payment.tenantId.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.tenant-fallback');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
          ) : (
            <div className="tenant-fallback w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/70 to-purple-500/70 flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30 shadow-lg">
              {payment.tenantId?.name?.charAt(0) || 'T'}
            </div>
          )}
          
          {/* Tenant name overlay */}
          <Link href={`/dashboard/tenants/${payment.tenantId?._id}`} className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap hover:bg-black/90 transition-colors">
            {payment.tenantId?.name || 'Unknown Tenant'}
          </Link>
        </div>
        
        {/* Property Image - Smaller */}
        <div className="relative z-10">
          {payment.propertyId?.image ? (
            <img 
              src={payment.propertyId.image} 
              alt={payment.propertyId.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/30 shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('.property-fallback');
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
          ) : (
            <div className="property-fallback w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/70 to-indigo-500/70 flex items-center justify-center text-white text-xl font-bold border-2 border-white/30 shadow-lg">
              {payment.propertyId?.name?.charAt(0) || 'P'}
            </div>
          )}
          
          {/* Property name overlay */}
          <Link href={`/dashboard/properties/${payment.propertyId?._id}`} className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap hover:bg-black/90 transition-colors">
            {payment.propertyId?.name || 'Unknown Property'}
          </Link>
        </div>
        
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 z-0"></div>
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2 z-20">
          <UniversalStatusBadge 
            status={payment.status || 'Pending'} 
            variant={payment.status?.toLowerCase() === 'completed' || payment.status?.toLowerCase() === 'paid' ? 'success' : 
                   payment.status?.toLowerCase() === 'pending' ? 'warning' : 'error'}
            size="sm"
          />
        </div>
      </div>
      
      {/* Payment Details */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">{currency}{payment.amount?.toLocaleString()}</h3>
          <p className="text-sm text-white/70">{new Date(payment.paymentDate).toLocaleDateString()}</p>
        </div>
        
        <div className="space-y-3">
          {/* Payment Info */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-blue-300" />
              <span className="text-sm text-white/80">
                {payment.rentMonth ? 
                  new Date(payment.rentMonth + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 
                  'No rent period'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-green-300" />
              <span className="text-sm text-white/80">{payment.paymentMethod || 'Cash'}</span>
            </div>
          </div>
          
          {/* Description */}
          {payment.description && (
            <p className="text-sm text-white/70 line-clamp-1">{payment.description}</p>
          )}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="border-t border-white/10 p-4 flex justify-between">
        <Link 
          to={`/dashboard/payments-universal/${payment._id}`}
          className="bg-gradient-to-r from-blue-500/70 to-purple-500/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:from-blue-500/90 hover:to-purple-500/90 transition-colors"
        >
          View Details
        </Link>
        
        <div className="flex gap-2">
          <button
            onClick={() => onDownloadReceipt(payment._id)}
            className="bg-green-500/70 hover:bg-green-500/90 text-white p-1.5 rounded-lg transition-colors"
            title="Download Receipt"
          >
            <Download size={16} />
          </button>
          
          <button
            onClick={() => onPrintReceipt(payment._id)}
            className="bg-purple-500/70 hover:bg-purple-500/90 text-white p-1.5 rounded-lg transition-colors"
            title="Print Receipt"
          >
            <Printer size={16} />
          </button>
          
          <button
            onClick={handleShare}
            className="bg-pink-500/70 hover:bg-pink-500/90 text-white p-1.5 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPaymentCard;