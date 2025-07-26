import React, { useState } from 'react';
import { Download, Mail, Archive, Trash2, CheckCircle, AlertTriangle, DollarSign, Calendar } from 'lucide-react';

interface EnhancedBulkPaymentActionsProps {
  selectedPayments: string[];
  payments: any[];
  onAction: (action: string, data: any) => Promise<void>;
  onClearSelection: () => void;
}

const EnhancedBulkPaymentActions: React.FC<EnhancedBulkPaymentActionsProps> = ({
  selectedPayments,
  payments,
  onAction,
  onClearSelection
}) => {
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [actionData, setActionData] = useState<any>({});

  const selectedPaymentData = payments.filter(p => selectedPayments.includes(p._id));
  const totalAmount = selectedPaymentData.reduce((sum, p) => sum + (p.amount || 0), 0);

  const bulkActions = [
    {
      key: 'export',
      label: 'Export Selected',
      icon: Download,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Export selected payments to CSV/Excel'
    },
    {
      key: 'mark_completed',
      label: 'Mark as Completed',
      icon: CheckCircle,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Mark all selected payments as completed'
    },
    {
      key: 'mark_failed',
      label: 'Mark as Failed',
      icon: AlertTriangle,
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Mark all selected payments as failed'
    },
    {
      key: 'send_receipts',
      label: 'Send Receipts',
      icon: Mail,
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Send payment receipts to tenants'
    },
    {
      key: 'archive',
      label: 'Archive',
      icon: Archive,
      color: 'bg-gray-500 hover:bg-gray-600',
      description: 'Archive selected payments'
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      color: 'bg-red-600 hover:bg-red-700',
      description: 'Permanently delete selected payments'
    }
  ];

  const handleActionClick = (actionKey: string) => {
    setSelectedAction(actionKey);
    setShowActionModal(true);
  };

  const handleConfirmAction = async () => {
    try {
      await onAction(selectedAction, {
        paymentIds: selectedPayments,
        payments: selectedPaymentData,
        ...actionData
      });
      setShowActionModal(false);
      setActionData({});
      onClearSelection();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const renderActionModal = () => {
    const action = bulkActions.find(a => a.key === selectedAction);
    if (!action) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
              <action.icon size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{action.label}</h3>
              <p className="text-sm text-gray-600">{selectedPayments.length} payments selected</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-4">{action.description}</p>
            
            {selectedAction === 'send_receipts' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Subject</label>
                  <input
                    type="text"
                    value={actionData.subject || 'Payment Receipt'}
                    onChange={(e) => setActionData({ ...actionData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    value={actionData.message || 'Thank you for your payment. Please find your receipt attached.'}
                    onChange={(e) => setActionData({ ...actionData, message: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {(selectedAction === 'mark_completed' || selectedAction === 'mark_failed') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={actionData.notes || ''}
                  onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
                  rows={2}
                  placeholder="Add any notes about this status change..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-3 mt-4">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Selected payments:</span>
                  <span className="font-medium">{selectedPayments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total amount:</span>
                  <span className="font-medium">${totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowActionModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAction}
              className={`flex-1 px-4 py-2 text-white rounded-lg ${action.color}`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (selectedPayments.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20 md:relative md:border md:rounded-xl md:mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{selectedPayments.length} payments selected</div>
              <div className="text-sm text-gray-600">Total: ${totalAmount.toLocaleString()}</div>
            </div>
          </div>
          <button
            onClick={onClearSelection}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Clear
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {bulkActions.map((action) => (
            <button
              key={action.key}
              onClick={() => handleActionClick(action.key)}
              className={`flex items-center gap-2 px-3 py-2 text-white rounded-lg text-sm font-medium transition-colors ${action.color}`}
            >
              <action.icon size={14} />
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {showActionModal && renderActionModal()}
    </>
  );
};

export default EnhancedBulkPaymentActions;