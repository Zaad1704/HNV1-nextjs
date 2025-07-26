import React from 'react';
import Link from 'next/link';
import { DollarSign, Calendar, User, Building2, CreditCard, Check, AlertTriangle, Clock, CheckCircle, Eye, Edit, Trash2, Share2, Printer, Mail } from 'lucide-react';
import ShareButton from '@/components/common/ShareButton';
import { useCurrency } from '@/contexts/CurrencyContext';
import PaymentDetailsActionWheel from './PaymentDetailsActionWheel';

interface FixedGlassyPaymentCardProps {
  payment: any;
  index: number;
  onEdit?: (payment: any) => void;
  onDelete?: (paymentId: string) => void;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: (paymentId: string, selected: boolean) => void;
}

const FixedGlassyPaymentCard: React.FC<FixedGlassyPaymentCardProps> = ({
  payment,
  index,
  onEdit,
  onDelete,
  showCheckbox = false,
  isSelected = false,
  onSelect
}) => {
  const { currency } = useCurrency();

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return { icon: CheckCircle, color: 'green' };
      case 'pending':
        return { icon: Clock, color: 'yellow' };
      case 'failed':
        return { icon: AlertTriangle, color: 'red' };
      default:
        return { icon: Clock, color: 'gray' };
    }
  };

  const statusInfo = getStatusIcon(payment.status);
  const StatusIcon = statusInfo.icon;

  const getPaymentAge = () => {
    const paymentDate = new Date(payment.paymentDate || payment.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - paymentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

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
              onSelect?.(payment._id, !isSelected);
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
      
      {/* Payment Header Image */}
      <div className="h-48 relative overflow-hidden rounded-3xl mb-4" style={{backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(0, 0, 0, 0.2)'}}>
        {/* Payment Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 flex items-center justify-center border-2 border-white/20">
            <DollarSign size={48} className="text-white" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'}} />
          </div>
        </div>
        
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
            statusInfo.color === 'green' ? 'bg-green-500/30 text-green-100' :
            statusInfo.color === 'yellow' ? 'bg-yellow-500/30 text-yellow-100' :
            statusInfo.color === 'red' ? 'bg-red-500/30 text-red-100' :
            'bg-gray-500/30 text-gray-100'
          }`}>
            <StatusIcon size={10} />
            {payment.status || 'Pending'}
          </span>
          {payment.originalAmount && payment.originalAmount !== payment.amount && (
            <span className="bg-blue-500/30 text-white px-2 py-1 rounded-full text-xs font-medium">
              Original: {currency}{payment.originalAmount}
            </span>
          )}
        </div>
        
        {/* Payment Amount */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black/20 backdrop-blur-sm rounded-full p-2">
            <div className="flex items-center justify-between text-white text-xs mb-1">
              <span>Amount</span>
              <span>{getPaymentAge()}</span>
            </div>
            <div className="text-2xl font-bold text-white text-center" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
              {currency}{payment.amount?.toLocaleString() || '0'}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="space-y-4 p-6">
        {/* Tenant and Property Info */}
        <div className="flex items-center gap-4 p-3 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)'}}>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-blue-500/50 rounded-full flex items-center justify-center text-white font-bold text-lg border border-white/20">
              {payment.tenantId?.name?.charAt(0) || 'T'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white truncate">{payment.tenantId?.name || 'Unknown Tenant'}</div>
              <div className="text-sm text-blue-200 truncate">{payment.tenantId?.email || 'No email'}</div>
            </div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-indigo-500/50 rounded-full flex items-center justify-center text-white font-bold text-lg border border-white/20">
              {payment.propertyId?.name?.charAt(0) || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white truncate">{payment.propertyId?.name || 'Unknown Property'}</div>
              <div className="text-sm text-indigo-200 truncate">
                {payment.tenantId?.unit ? `Unit: ${payment.tenantId.unit}` : 'No unit info'}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Payment Metrics */}
        <div className="rounded-2xl p-4 space-y-3 border border-white/40" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.15), rgba(66,165,245,0.15), rgba(102,187,106,0.1))', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)'}}>
          {/* Payment Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-green-300" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))', strokeWidth: 2.5}} />
              <span className="text-sm text-white font-semibold" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>Payment Date</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-green-300 text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'No date'}
              </span>
            </div>
          </div>
          
          {/* Payment Method */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-blue-300" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))', strokeWidth: 2.5}} />
              <span className="text-sm text-white font-semibold" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.8)'}}>Method</span>
            </div>
            <span className="font-semibold text-white text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
              {payment.paymentMethod || 'Not specified'}
            </span>
          </div>
          
          {/* Rent Period */}
          {payment.rentMonth && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-purple-400" />
                <span className="text-sm text-white/80">Rent Period</span>
              </div>
              <span className="font-semibold text-white">
                {new Date(payment.rentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          )}
          
          {/* Reference Number */}
          {payment.referenceNumber && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-orange-400" />
                <span className="text-sm text-white/80">Reference</span>
              </div>
              <span className="font-semibold text-white">
                {payment.referenceNumber}
              </span>
            </div>
          )}
          
          {/* Last Updated */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70">Last updated</span>
            <span className="text-white/70">
              {getPaymentAge()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to={`/dashboard/payments/${payment._id}`}
            className="w-full bg-gradient-to-r from-orange-500 to-blue-500 text-white py-3 px-4 rounded-2xl text-sm font-semibold transition-all hover:shadow-xl text-center block group-hover:scale-105 transform flex items-center justify-center gap-2"
          >
            <Eye size={16} />
            View Details
          </Link>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                onEdit?.(payment);
              }}
              className="bg-gradient-to-r from-orange-400 to-orange-500 text-white py-2 px-3 rounded-xl text-xs font-medium hover:shadow-md transition-all flex items-center justify-center gap-1"
            >
              <Edit size={12} />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                window.open(`/dashboard/payments/${payment._id}/receipt`, '_blank');
              }}
              className="bg-gradient-to-r from-blue-400 to-blue-500 text-white py-2 px-3 rounded-xl text-xs font-medium hover:shadow-md transition-all flex items-center justify-center gap-1"
            >
              <Printer size={12} />
              Receipt
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                if (confirm(`Delete payment of ${currency}${payment.amount}? This action cannot be undone.`)) {
                  onDelete?.(payment._id);
                }
              }}
              className="bg-gradient-to-r from-red-400 to-red-500 text-white py-2 px-3 rounded-xl text-xs font-medium hover:shadow-md transition-all flex items-center justify-center gap-1"
            >
              <Trash2 size={12} />
              Delete
            </button>
            <ShareButton
              data={{
                title: `Payment - ${currency}${payment.amount}`,
                text: `Payment: ${currency}${payment.amount}\nTenant: ${payment.tenantId?.name}\nDate: ${new Date(payment.paymentDate).toLocaleDateString()}`,
                url: `${window.location.origin}/dashboard/payments/${payment._id}`
              }}
              className="bg-gradient-to-r from-green-400 to-green-500 text-white py-2 px-3 rounded-xl text-xs font-medium hover:shadow-md transition-all flex items-center justify-center gap-1"
            >
              <Share2 size={12} />
              Share
            </ShareButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedGlassyPaymentCard;