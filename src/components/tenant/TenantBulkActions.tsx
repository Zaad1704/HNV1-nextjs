'use client';
import React from 'react';
import { DollarSign, Mail, Calendar, FileText, Archive, Users, Send, AlertTriangle, CheckCircle } from 'lucide-react';

interface BulkAction {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  requiresConfirmation: boolean;
}

interface TenantBulkActionsProps {
  selectedTenants: string[];
  tenants: any[];
  onAction: (action: string, data: any) => Promise<void>;
  onClearSelection: () => void;
  className?: string;
}

const TenantBulkActions: React.FC<TenantBulkActionsProps> = ({
  selectedTenants,
  tenants,
  onAction,
  onClearSelection,
  className = ''
}) => {
  const [showModal, setShowModal] = React.useState(false);
  const [currentAction, setCurrentAction] = React.useState<string>('');
  const [actionData, setActionData] = React.useState<any>({});
  const [isProcessing, setIsProcessing] = React.useState(false);

  const selectedTenantData = tenants.filter(t => selectedTenants.includes(t._id));

  const bulkActions: BulkAction[] = [
    {
      key: 'rent_increase',
      label: 'Rent Increase',
      icon: DollarSign,
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Apply rent increase to selected tenants',
      requiresConfirmation: true
    },
    {
      key: 'lease_renewal',
      label: 'Lease Renewal',
      icon: Calendar,
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Send lease renewal notices',
      requiresConfirmation: true
    },
    {
      key: 'payment_reminder',
      label: 'Payment Reminder',
      icon: Mail,
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Send payment reminders',
      requiresConfirmation: false
    },
    {
      key: 'late_notice',
      label: 'Late Notice',
      icon: AlertTriangle,
      color: 'bg-red-500 hover:bg-red-600',
      description: 'Send late payment notices',
      requiresConfirmation: true
    },
    {
      key: 'lease_termination',
      label: 'Lease Termination',
      icon: FileText,
      color: 'bg-red-600 hover:bg-red-700',
      description: 'Initiate lease termination process',
      requiresConfirmation: true
    },
    {
      key: 'archive_tenants',
      label: 'Archive Tenants',
      icon: Archive,
      color: 'bg-gray-500 hover:bg-gray-600',
      description: 'Archive selected tenants',
      requiresConfirmation: true
    }
  ];

  const handleActionClick = (action: BulkAction) => {
    setCurrentAction(action.key);
    setActionData({});
    setShowModal(true);
  };

  const executeAction = async () => {
    setIsProcessing(true);
    try {
      await onAction(currentAction, {
        tenantIds: selectedTenants,
        tenants: selectedTenantData,
        ...actionData
      });
      setShowModal(false);
      onClearSelection();
    } catch (error) {
      console.error('Bulk action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderActionForm = () => {
    switch (currentAction) {
      case 'rent_increase':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Increase Type</label>
              <select
                value={actionData.type || 'percentage'}
                onChange={(e) => setActionData({...actionData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {actionData.type === 'fixed' ? 'Amount ($)' : 'Percentage (%)'}
              </label>
              <input
                type="number"
                value={actionData.value || ''}
                onChange={(e) => setActionData({...actionData, value: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder={actionData.type === 'fixed' ? '100' : '5'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Effective Date</label>
              <input
                type="date"
                value={actionData.effectiveDate || ''}
                onChange={(e) => setActionData({...actionData, effectiveDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <textarea
                value={actionData.reason || ''}
                onChange={(e) => setActionData({...actionData, reason: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Market adjustment, property improvements, etc."
              />
            </div>
          </div>
        );

      case 'lease_renewal':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Renewal Duration (months)</label>
              <input
                type="number"
                value={actionData.duration || '12'}
                onChange={(e) => setActionData({...actionData, duration: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Rent Amount</label>
              <select
                value={actionData.rentChange || 'same'}
                onChange={(e) => setActionData({...actionData, rentChange: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="same">Keep Current Rent</option>
                <option value="increase">Increase Rent</option>
                <option value="custom">Custom Amount</option>
              </select>
            </div>
            {actionData.rentChange === 'increase' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Increase (%)</label>
                <input
                  type="number"
                  value={actionData.increasePercent || ''}
                  onChange={(e) => setActionData({...actionData, increasePercent: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Response Deadline</label>
              <input
                type="date"
                value={actionData.deadline || ''}
                onChange={(e) => setActionData({...actionData, deadline: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'payment_reminder':
      case 'late_notice':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Template</label>
              <select
                value={actionData.template || 'default'}
                onChange={(e) => setActionData({...actionData, template: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Default Template</option>
                <option value="friendly">Friendly Reminder</option>
                <option value="formal">Formal Notice</option>
                <option value="urgent">Urgent Notice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Message</label>
              <textarea
                value={actionData.message || ''}
                onChange={(e) => setActionData({...actionData, message: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Add custom message (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Send Via</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={actionData.sendEmail !== false}
                    onChange={(e) => setActionData({...actionData, sendEmail: e.target.checked})}
                    className="mr-2"
                  />
                  Email
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={actionData.sendSMS || false}
                    onChange={(e) => setActionData({...actionData, sendSMS: e.target.checked})}
                    className="mr-2"
                  />
                  SMS
                </label>
              </div>
            </div>
          </div>
        );

      case 'lease_termination':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Termination Date</label>
              <input
                type="date"
                value={actionData.terminationDate || ''}
                onChange={(e) => setActionData({...actionData, terminationDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Termination</label>
              <select
                value={actionData.reason || ''}
                onChange={(e) => setActionData({...actionData, reason: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select reason</option>
                <option value="non_payment">Non-payment of rent</option>
                <option value="lease_violation">Lease violation</option>
                <option value="property_sale">Property sale</option>
                <option value="renovation">Major renovation</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notice Period (days)</label>
              <input
                type="number"
                value={actionData.noticePeriod || '30'}
                onChange={(e) => setActionData({...actionData, noticePeriod: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-4">
            <p className="text-gray-600">Configure action settings</p>
          </div>
        );
    }
  };

  if (selectedTenants.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-blue-600" />
            <div>
              <h3 className="font-bold text-lg text-gray-900">Bulk Actions</h3>
              <p className="text-sm text-gray-600">{selectedTenants.length} tenants selected</p>
            </div>
          </div>
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-100"
          >
            Clear Selection
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {bulkActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.key}
                onClick={() => handleActionClick(action)}
                className={`${action.color} text-white p-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon size={20} />
                  <span className="font-semibold">{action.label}</span>
                </div>
                <p className="text-xs opacity-90 text-left">{action.description}</p>
              </button>
            );
          })}
        </div>

        {/* Selected Tenants Preview */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-medium text-gray-900 mb-3">Selected Tenants:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTenantData.slice(0, 10).map((tenant) => (
              <span
                key={tenant._id}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {tenant.name} - Unit {tenant.unit}
              </span>
            ))}
            {selectedTenants.length > 10 && (
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                +{selectedTenants.length - 10} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {bulkActions.find(a => a.key === currentAction)?.label}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  This action will affect {selectedTenants.length} selected tenants.
                </p>
                {renderActionForm()}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Execute Action
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TenantBulkActions;