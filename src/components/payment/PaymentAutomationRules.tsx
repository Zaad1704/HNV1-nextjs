import React, { useState } from 'react';
import { Zap, Plus, Edit, Trash2, Clock, DollarSign, Mail, AlertTriangle } from 'lucide-react';

interface PaymentAutomationRulesProps {
  payments: any[];
  onRuleCreate: (rule: any) => void;
  onRuleUpdate: (id: string, rule: any) => void;
  onRuleDelete: (id: string) => void;
}

const PaymentAutomationRules: React.FC<PaymentAutomationRulesProps> = ({
  payments,
  onRuleCreate,
  onRuleUpdate,
  onRuleDelete
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [newRule, setNewRule] = useState({
    name: '',
    trigger: 'payment_overdue',
    condition: { days: 3 },
    action: 'send_reminder',
    actionData: { message: 'Payment reminder' },
    enabled: true
  });

  // Mock existing rules
  const [rules] = useState([
    {
      id: '1',
      name: 'Late Payment Reminder',
      trigger: 'payment_overdue',
      condition: { days: 3 },
      action: 'send_reminder',
      actionData: { message: 'Your payment is overdue. Please pay immediately.' },
      enabled: true,
      lastTriggered: '2024-01-15'
    },
    {
      id: '2',
      name: 'Auto-mark Failed Payments',
      trigger: 'payment_failed_attempts',
      condition: { attempts: 3 },
      action: 'mark_failed',
      actionData: { reason: 'Multiple failed attempts' },
      enabled: true,
      lastTriggered: '2024-01-10'
    }
  ]);

  const triggerOptions = [
    { value: 'payment_overdue', label: 'Payment Overdue' },
    { value: 'payment_failed_attempts', label: 'Failed Payment Attempts' },
    { value: 'payment_received', label: 'Payment Received' },
    { value: 'monthly_due', label: 'Monthly Due Date' }
  ];

  const actionOptions = [
    { value: 'send_reminder', label: 'Send Reminder Email' },
    { value: 'send_sms', label: 'Send SMS' },
    { value: 'mark_failed', label: 'Mark as Failed' },
    { value: 'create_task', label: 'Create Follow-up Task' },
    { value: 'apply_late_fee', label: 'Apply Late Fee' }
  ];

  const handleCreateRule = () => {
    onRuleCreate(newRule);
    setNewRule({
      name: '',
      trigger: 'payment_overdue',
      condition: { days: 3 },
      action: 'send_reminder',
      actionData: { message: 'Payment reminder' },
      enabled: true
    });
    setShowCreateModal(false);
  };

  const renderRuleModal = () => {
    const rule = editingRule || newRule;
    const isEditing = !!editingRule;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {isEditing ? 'Edit Automation Rule' : 'Create Automation Rule'}
              </h3>
              <p className="text-sm text-gray-600">Automate payment-related actions</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
              <input
                type="text"
                value={rule.name}
                onChange={(e) => isEditing 
                  ? setEditingRule({ ...rule, name: e.target.value })
                  : setNewRule({ ...rule, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Late Payment Reminder"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
              <select
                value={rule.trigger}
                onChange={(e) => isEditing
                  ? setEditingRule({ ...rule, trigger: e.target.value })
                  : setNewRule({ ...rule, trigger: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {triggerOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {(rule.trigger === 'payment_overdue' || rule.trigger === 'monthly_due') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Days</label>
                <input
                  type="number"
                  value={rule.condition.days || 3}
                  onChange={(e) => isEditing
                    ? setEditingRule({ ...rule, condition: { ...rule.condition, days: parseInt(e.target.value) } })
                    : setNewRule({ ...rule, condition: { ...rule.condition, days: parseInt(e.target.value) } })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={rule.action}
                onChange={(e) => isEditing
                  ? setEditingRule({ ...rule, action: e.target.value })
                  : setNewRule({ ...rule, action: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {actionOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {(rule.action === 'send_reminder' || rule.action === 'send_sms') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={rule.actionData.message || ''}
                  onChange={(e) => isEditing
                    ? setEditingRule({ ...rule, actionData: { ...rule.actionData, message: e.target.value } })
                    : setNewRule({ ...rule, actionData: { ...rule.actionData, message: e.target.value } })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter the message to send..."
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setEditingRule(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={isEditing 
                ? () => {
                    onRuleUpdate(editingRule.id, editingRule);
                    setEditingRule(null);
                  }
                : handleCreateRule
              }
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              {isEditing ? 'Update' : 'Create'} Rule
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-purple-600" />
          <h3 className="font-semibold text-gray-900">Payment Automation Rules</h3>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          <Plus size={16} />
          Add Rule
        </button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                <div>
                  <h4 className="font-medium text-gray-900">{rule.name}</h4>
                  <p className="text-sm text-gray-600">
                    When {triggerOptions.find(t => t.value === rule.trigger)?.label.toLowerCase()} → {actionOptions.find(a => a.value === rule.action)?.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingRule(rule)}
                  className="p-2 text-gray-400 hover:text-blue-600"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onRuleDelete(rule.id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Last triggered: {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleDateString() : 'Never'}
            </div>
          </div>
        ))}
      </div>

      {(showCreateModal || editingRule) && renderRuleModal()}
    </div>
  );
};

export default PaymentAutomationRules;