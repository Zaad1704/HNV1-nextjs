import React from 'react';
import Link from 'next/link';
import { DollarSign, Calendar, User, Building2, CreditCard, Check, AlertTriangle, Clock, CheckCircle, Eye, Edit, Trash2, Share2 } from 'lucide-react';
import UniversalCard from './UniversalCard';
import UniversalStatusBadge from './UniversalStatusBadge';
import ShareButton from './ShareButton';
import MessageButtons from './MessageButtons';
import { useCurrency } from '@/contexts/CurrencyContext';

interface EnhancedPaymentCardProps {
  payment: any;
  index: number;
  onEdit?: (payment: any) => void;
  onDelete?: (paymentId: string) => void;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: (paymentId: string, selected: boolean) => void;
}

const EnhancedPaymentCard: React.FC<EnhancedPaymentCardProps> = ({
  payment,
  index,
  onEdit,
  onDelete,
  showCheckbox = false,
  isSelected = false,
  onSelect
}) => {
  const { currency } = useCurrency();
  
  console.log('Payment object:', payment);

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
    <UniversalCard delay={index * 0.1} gradient="green" className={`relative group hover:scale-105 transition-all duration-300 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
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

      {/* Payment Header with Status */}
      <div className="relative z-10 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-16 h-16 gradient-dark-orange-blue rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <DollarSign size={28} className="text-white" />
          </div>
          <div className="text-right flex-1 ml-4">
            <div className="flex items-center justify-end gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                statusInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                <StatusIcon size={10} />
                {payment.status || 'Pending'}
              </span>
            </div>
            <div className="text-2xl font-bold text-text-primary group-hover:text-brand-blue transition-colors duration-300">
              {currency}{payment.amount?.toLocaleString() || '0'}
            </div>
            {payment.originalAmount && payment.originalAmount !== payment.amount && (
              <div className="text-sm text-green-600 font-medium mt-1">
                Original: {currency}{payment.originalAmount}
              </div>
            )}
            <div className="text-xs text-text-muted mt-1">{getPaymentAge()}</div>
          </div>
        </div>
        
        {/* Tenant and Property Images */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {payment.tenantId?.name?.charAt(0) || 'T'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{payment.tenantId?.name || 'Unknown Tenant'}</div>
              <div className="text-sm text-blue-600 truncate">{payment.tenantId?.email || 'No email'}</div>
            </div>
          </div>
          <div className="w-px h-8 bg-gray-300"></div>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {payment.propertyId?.name?.charAt(0) || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{payment.propertyId?.name || 'Unknown Property'}</div>
              <div className="text-sm text-indigo-600 truncate">
                {payment.tenantId?.unit ? `Unit: ${payment.tenantId.unit}` : 'No unit info'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="relative z-10 space-y-4 mb-6">

        {/* Payment Info Grid */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-green-600" />
                <span className="text-sm font-semibold text-green-800">Payment Details</span>
              </div>
              <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {getPaymentAge()}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-green-600 mb-1">Date</div>
                <div className="font-semibold text-gray-900">
                  {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'No date'}
                </div>
              </div>
              <div>
                <div className="text-xs text-green-600 mb-1">Method</div>
                <div className="font-semibold text-gray-900">
                  {payment.paymentMethod || 'Not specified'}
                </div>
              </div>
            </div>
            {payment.rentMonth && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="text-xs text-green-600 mb-1">Rent Period</div>
                <div className="font-semibold text-gray-900">
                  {new Date(payment.rentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Details */}
        {(payment.description || payment.notes || payment.referenceNumber) && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs font-medium text-gray-600 mb-2">Additional Details</div>
            {payment.description && (
              <div className="text-sm text-gray-800 mb-1">
                <span className="font-medium">Description:</span> {payment.description}
              </div>
            )}
            {payment.notes && (
              <div className="text-sm text-gray-800 mb-1">
                <span className="font-medium">Notes:</span> {payment.notes}
              </div>
            )}
            {payment.referenceNumber && (
              <div className="text-sm text-gray-800">
                <span className="font-medium">Reference:</span> {payment.referenceNumber}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 space-y-3">
        <div className="flex gap-2">
          <Link
            to={`/dashboard/payments/${payment._id}`}
            className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
          >
            <Eye size={14} />
            View Details
          </Link>
          <button
            onClick={() => onEdit?.(payment)}
            className="flex-1 bg-green-500 text-white py-2 px-3 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
          >
            <Edit size={14} />
            Edit
          </button>
        </div>

        <div className="flex gap-2">
          <ShareButton
            data={{
              title: `Payment - ${currency}${payment.amount}`,
              text: `Payment: ${currency}${payment.amount}\nTenant: ${payment.tenantId?.name}\nDate: ${new Date(payment.paymentDate).toLocaleDateString()}`,
              url: `${window.location.origin}/dashboard/payments/${payment._id}`
            }}
            className="flex-1 bg-purple-100 text-purple-800 py-2 px-3 rounded-xl text-sm font-medium hover:bg-purple-200 transition-colors flex items-center justify-center gap-1"
          >
            <Share2 size={14} />
            Share
          </ShareButton>
          <button
            onClick={() => onDelete?.(payment._id)}
            className="flex-1 bg-red-100 text-red-800 py-2 px-3 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>

        {payment.tenantId?.phone && (
          <MessageButtons
            phone={payment.tenantId.phone}
            email={payment.tenantId.email}
            name={payment.tenantId.name}
            messageType="paymentConfirmation"
            additionalData={{
              amount: payment.amount,
              date: payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'Today'
            }}
          />
        )}
      </div>
    </UniversalCard>
  );
};

export default EnhancedPaymentCard;