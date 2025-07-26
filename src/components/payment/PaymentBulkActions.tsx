import React from 'react';
import { Download, Mail, Printer, Archive, CheckCircle, X } from 'lucide-react';

interface PaymentBulkActionsProps {
  selectedPayments: string[];
  payments: any[];
  onAction: (action: string, data: any) => void;
  onClearSelection: () => void;
}

const PaymentBulkActions: React.FC<PaymentBulkActionsProps> = ({
  selectedPayments,
  payments,
  onAction,
  onClearSelection
}) => {
  if (selectedPayments.length === 0) return null;
  
  const selectedPaymentObjects = payments.filter(p => selectedPayments.includes(p._id));
  const totalAmount = selectedPaymentObjects.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  return (
    <div 
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-3xl"
      style={{ maxWidth: 'calc(100% - 3rem)' }}
    >
      <div 
        className="rounded-2xl p-4 border-2 border-white/20 shadow-2xl"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(20px) saturate(180%)'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/50 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-white" />
            </div>
            <div>
              <div className="text-white font-medium">{selectedPayments.length} payments selected</div>
              <div className="text-sm text-white/70">Total: ${totalAmount.toLocaleString()}</div>
            </div>
          </div>
          
          <button
            onClick={onClearSelection}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onAction('export', { paymentIds: selectedPayments })}
            className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-blue-500/30 hover:bg-blue-500/50 transition-colors"
          >
            <Download size={18} className="text-white" />
            <span className="text-xs text-white">Export</span>
          </button>
          
          <button
            onClick={() => onAction('receipt', { paymentIds: selectedPayments })}
            className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-green-500/30 hover:bg-green-500/50 transition-colors"
          >
            <Printer size={18} className="text-white" />
            <span className="text-xs text-white">Receipts</span>
          </button>
          
          <button
            onClick={() => onAction('notify', { paymentIds: selectedPayments })}
            className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-purple-500/30 hover:bg-purple-500/50 transition-colors"
          >
            <Mail size={18} className="text-white" />
            <span className="text-xs text-white">Notify</span>
          </button>
          
          <button
            onClick={() => onAction('archive', { paymentIds: selectedPayments })}
            className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-gray-500/30 hover:bg-gray-500/50 transition-colors"
          >
            <Archive size={18} className="text-white" />
            <span className="text-xs text-white">Archive</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentBulkActions;