import React from 'react';
import { Zap, Clock, Mail, DollarSign, Calendar, AlertTriangle, Plus, Edit, Trash2, Play, Pause } from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  trigger: {
    type: 'payment_late' | 'lease_expiring' | 'rent_due' | 'maintenance_request';
    conditions: any;
  };
  actions: {
    type: 'send_email' | 'send_sms' | 'create_reminder' | 'update_status';
    config: any;
  }[];
  isActive: boolean;
  lastRun?: Date;
  runCount: number;
}

interface TenantAutomationRulesProps {
  tenants: any[];
  onRuleCreate: (rule: Omit<AutomationRule, 'id' | 'runCount'>) => void;
  onRuleUpdate: (id: string, rule: Partial<AutomationRule>) => void;
  onRuleDelete: (id: string) => void;
  className?: string;
}

const TenantAutomationRules: React.FC<TenantAutomationRulesProps> = ({
  tenants,
  onRuleCreate,
  onRuleUpdate,
  onRuleDelete,
  className = ''
}) => {
  const [rules, setRules] = React.useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Late Payment Reminder',
      trigger: {
        type: 'payment_late',
        conditions: { daysLate: 3 }
      },
      actions: [
        {
          type: 'send_email',
          config: { template: 'late_payment_reminder' }
        }
      ],
      isActive: true,
      runCount: 15,
      lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Lease Renewal Notice',
      trigger: {
        type: 'lease_expiring',
        conditions: { daysBefore: 60 }
      },
      actions: [
        {
          type: 'send_email',
          config: { template: 'lease_renewal_notice' }
        },
        {
          type: 'create_reminder',
          config: { title: 'Follow up on lease renewal' }
        }
      ],
      isActive: true,
      runCount: 8,
      lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<AutomationRule | null>(null);
  const [newRule, setNewRule] = React.useState({
    name: '',
    trigger: { type: 'payment_late', conditions: {} },
    actions: [],
    isActive: true
  });

  const triggerTypes = [
    { value: 'payment_late', label: 'Payment Late', icon: DollarSign, color: 'red' },
    { value: 'lease_expiring', label: 'Lease Expiring', icon: Calendar, color: 'orange' },
    { value: 'rent_due', label: 'Rent Due', icon: Clock, color: 'blue' },
    { value: 'maintenance_request', label: 'Maintenance Request', icon: AlertTriangle, color: 'yellow' }
  ];

  const actionTypes = [
    { value: 'send_email', label: 'Send Email', icon: Mail },
    { value: 'send_sms', label: 'Send SMS', icon: Mail },
    { value: 'create_reminder', label: 'Create Reminder', icon: Clock },
    { value: 'update_status', label: 'Update Status', icon: Edit }
  ];

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const deleteRule = (id: string) => {
    if (confirm('Are you sure you want to delete this automation rule?')) {
      setRules(prev => prev.filter(rule => rule.id !== id));
      onRuleDelete(id);
    }
  };

  const getTriggerIcon = (type: string) => {
    const triggerType = triggerTypes.find(t => t.value === type);
    if (!triggerType) return Clock;
    return triggerType.icon;
  };

  const getTriggerColor = (type: string) => {
    const triggerType = triggerTypes.find(t => t.value === type);
    return triggerType?.color || 'gray';
  };

  const renderTriggerConditions = (trigger: any) => {
    switch (trigger.type) {
      case 'payment_late':
        return `${trigger.conditions.daysLate || 1} days after due date`;
      case 'lease_expiring':
        return `${trigger.conditions.daysBefore || 30} days before expiry`;
      case 'rent_due':
        return `${trigger.conditions.daysBefore || 3} days before due date`;
      default:
        return 'When triggered';
    }
  };

  const renderRuleForm = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
        <input
          type="text"
          value={newRule.name}
          onChange={(e) => setNewRule({...newRule, name: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Late Payment Reminder"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Trigger</label>
        <select
          value={newRule.trigger.type}
          onChange={(e) => setNewRule({
            ...newRule, 
            trigger: { type: e.target.value as any, conditions: {} }
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {triggerTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Trigger Conditions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Conditions</label>
        {newRule.trigger.type === 'payment_late' && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Days after due date</label>
            <input
              type="number"
              value={newRule.trigger.conditions.daysLate || ''}
              onChange={(e) => setNewRule({
                ...newRule,
                trigger: {
                  ...newRule.trigger,
                  conditions: { daysLate: parseInt(e.target.value) || 1 }
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="3"
            />
          </div>
        )}
        {newRule.trigger.type === 'lease_expiring' && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Days before expiry</label>
            <input
              type="number"
              value={newRule.trigger.conditions.daysBefore || ''}
              onChange={(e) => setNewRule({
                ...newRule,
                trigger: {
                  ...newRule.trigger,
                  conditions: { daysBefore: parseInt(e.target.value) || 30 }
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="60"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Actions</label>
        <div className="space-y-3">
          {newRule.actions.map((action: any, index: number) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <select
                value={action.type}
                onChange={(e) => {
                  const updatedActions = [...newRule.actions];
                  updatedActions[index] = { type: e.target.value, config: {} };
                  setNewRule({...newRule, actions: updatedActions});
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {actionTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const updatedActions = newRule.actions.filter((_, i) => i !== index);
                  setNewRule({...newRule, actions: updatedActions});
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setNewRule({
              ...newRule,
              actions: [...newRule.actions, { type: 'send_email', config: {} }]
            })}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Add Action
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Automation Rules</h3>
                <p className="text-sm text-gray-600">Automate tenant management tasks</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
            >
              <Plus size={16} />
              New Rule
            </button>
          </div>
        </div>

        <div className="p-6">
          {rules.length === 0 ? (
            <div className="text-center py-12">
              <Zap size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Automation Rules</h3>
              <p className="text-gray-600 mb-4">Create your first automation rule to streamline tenant management.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
              >
                Create Rule
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => {
                const TriggerIcon = getTriggerIcon(rule.trigger.type);
                const triggerColor = getTriggerColor(rule.trigger.type);
                
                return (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      rule.isActive 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 bg-${triggerColor}-500 rounded-lg flex items-center justify-center`}>
                          <TriggerIcon size={16} className="text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                          <p className="text-sm text-gray-600">
                            {renderTriggerConditions(rule.trigger)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className={`p-2 rounded-lg ${
                            rule.isActive 
                              ? 'text-green-600 hover:bg-green-100' 
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {rule.isActive ? <Play size={16} /> : <Pause size={16} />}
                        </button>
                        <button
                          onClick={() => setEditingRule(rule)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-gray-600">
                          Run {rule.runCount} times
                        </span>
                        {rule.lastRun && (
                          <span className="text-gray-600">
                            Last: {rule.lastRun.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingRule) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingRule ? 'Edit Rule' : 'Create Automation Rule'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingRule(null);
                    setNewRule({ name: '', trigger: { type: 'payment_late', conditions: {} }, actions: [], isActive: true });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {renderRuleForm()}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingRule(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingRule) {
                      onRuleUpdate(editingRule.id, newRule);
                    } else {
                      onRuleCreate(newRule);
                    }
                    setShowCreateModal(false);
                    setEditingRule(null);
                  }}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                >
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TenantAutomationRules;