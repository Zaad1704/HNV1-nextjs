import React, { useState } from 'react';
import { DollarSign, Printer, Mail, Share2, Edit, Trash2, Eye } from 'lucide-react';

interface PaymentDetailsActionWheelProps {
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPrintReceipt?: () => void;
  onSendReceipt?: () => void;
  onShare?: () => void;
}

const PaymentDetailsActionWheel: React.FC<PaymentDetailsActionWheelProps> = ({
  onViewDetails,
  onEdit,
  onDelete,
  onPrintReceipt,
  onSendReceipt,
  onShare
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500/80 to-purple-500/80 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/30"
        aria-label="Payment Actions"
      >
        <DollarSign size={18} className="text-white" />
      </button>

      {/* Radial Menu */}
      {isOpen && (
        <div className="absolute z-50">
          {/* View Details */}
          {onViewDetails && (
            <button
              onClick={() => {
                onViewDetails();
                setIsOpen(false);
              }}
              className="absolute -top-14 left-0 w-9 h-9 rounded-full bg-blue-500/80 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/30"
              aria-label="View Details"
            >
              <Eye size={14} className="text-white" />
            </button>
          )}

          {/* Edit */}
          {onEdit && (
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="absolute -top-10 -left-10 w-9 h-9 rounded-full bg-green-500/80 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/30"
              aria-label="Edit Payment"
            >
              <Edit size={14} className="text-white" />
            </button>
          )}

          {/* Print Receipt */}
          {onPrintReceipt && (
            <button
              onClick={() => {
                onPrintReceipt();
                setIsOpen(false);
              }}
              className="absolute -left-14 top-0 w-9 h-9 rounded-full bg-purple-500/80 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/30"
              aria-label="Print Receipt"
            >
              <Printer size={14} className="text-white" />
            </button>
          )}

          {/* Send Receipt */}
          {onSendReceipt && (
            <button
              onClick={() => {
                onSendReceipt();
                setIsOpen(false);
              }}
              className="absolute -top-10 -right-10 w-9 h-9 rounded-full bg-orange-500/80 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/30"
              aria-label="Send Receipt"
            >
              <Mail size={14} className="text-white" />
            </button>
          )}

          {/* Share */}
          {onShare && (
            <button
              onClick={() => {
                onShare();
                setIsOpen(false);
              }}
              className="absolute -top-14 right-0 w-9 h-9 rounded-full bg-indigo-500/80 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/30"
              aria-label="Share Payment"
            >
              <Share2 size={14} className="text-white" />
            </button>
          )}

          {/* Delete */}
          {onDelete && (
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="absolute -bottom-14 left-0 w-9 h-9 rounded-full bg-red-500/80 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/30"
              aria-label="Delete Payment"
            >
              <Trash2 size={14} className="text-white" />
            </button>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default PaymentDetailsActionWheel;