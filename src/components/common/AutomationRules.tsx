import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, Edit, Trash2, Play, Pause, Calendar, Mail, DollarSign } from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  isActive: boolean;
  lastRun?: string;
  runsCount: number;
  category: 'payment' | 'maintenance' | 'communication' | 'reporting';
}

const AutomationRules = () => {
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Late Rent Reminder',
      trigger: 'Rent overdue by 3 days',
      action: 'Send email reminder to tenant',
      isActive: true,
      lastRun: '2024-01-15',
      runsCount: 23,
      category: 'payment'
    },
    {
      id: '2',
      name: 'Lease Renewal Notice',
      trigger: '60 days before lease expiry',
      action: 'Send renewal notice to tenant',
      isActive: true,
      lastRun: '2024-01-10',
      runsCount: 8,
      category: 'communication'
    },
    {
      id: '3',
      name: 'Maintenance Follow-up',
      trigger: 'Maintenance request completed',
      action: 'Send satisfaction survey',
      isActive: false,
      lastRun: '2024-01-08',
      runsCount: 15,
      category: 'maintenance'
    },
    {
      id: '4',
      name: 'Monthly Financial Report',
      trigger: 'First day of each month',
      action: 'Generate and email financial summary',
      isActive: true,
      lastRun: '2024-01-01',
      runsCount: 12,
      category: 'reporting'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const deleteRule = (id: string) => {
    if (confirm('Are you sure you want to delete this automation rule?')) {
      setRules(prev => prev.filter(rule => rule.id !== id));
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment': return <DollarSign size={16} className="text-green-600" />;
      case 'maintenance': return <Zap size={16} className="text-orange-600" />;
      case 'communication': return <Mail size={16} className="text-blue-600" />;
      case 'reporting': return <Calendar size={16} className="text-purple-600" />;
      default: return <Zap size={16} className="text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'payment': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'communication': return 'bg-blue-100 text-blue-800';
      case 'reporting': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Automation Rules</h1>
          <p className="text-text-secondary mt-1">Automate repetitive tasks and workflows</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Create Rule
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="app-surface rounded-2xl p-6 border border-app-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Active Rules</p>
              <p className="text-2xl font-bold text-text-primary">
                {rules.filter(r => r.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Play size={20} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="app-surface rounded-2xl p-6 border border-app-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Executions</p>
              <p className="text-2xl font-bold text-text-primary">
                {rules.reduce((sum, rule) => sum + rule.runsCount, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="app-surface rounded-2xl p-6 border border-app-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Time Saved</p>
              <p className="text-2xl font-bold text-text-primary">24h</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="app-surface rounded-2xl p-6 border border-app-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-text-primary">98.5%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="app-surface rounded-3xl border border-app-border overflow-hidden">
        <div className="p-6 border-b border-app-border">
          <h2 className="text-xl font-bold text-text-primary">Automation Rules</h2>
        </div>
        
        <div className="divide-y divide-app-border">
          {rules.map((rule) => (
            <div key={rule.id} className="p-6 hover:bg-app-bg transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(rule.category)}
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-text-primary">{rule.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(rule.category)}`}>
                          {rule.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-text-secondary text-sm mb-1">
                        <strong>When:</strong> {rule.trigger}
                      </p>
                      <p className="text-text-secondary text-sm">
                        <strong>Then:</strong> {rule.action}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-text-secondary">
                    <p>Runs: {rule.runsCount}</p>
                    {rule.lastRun && <p>Last: {rule.lastRun}</p>}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        rule.isActive 
                          ? 'text-orange-600 hover:bg-orange-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={rule.isActive ? 'Pause rule' : 'Activate rule'}
                    >
                      {rule.isActive ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    
                    <button
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit rule"
                    >
                      <Edit size={16} />
                    </button>
                    
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete rule"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Templates */}
      <div className="app-surface rounded-3xl p-8 border border-app-border">
        <h2 className="text-xl font-bold text-text-primary mb-6">Quick Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Late Payment Reminder', category: 'payment', description: 'Automatically remind tenants of overdue payments' },
            { name: 'Lease Expiry Alert', category: 'communication', description: 'Notify about upcoming lease expirations' },
            { name: 'Maintenance Follow-up', category: 'maintenance', description: 'Follow up on completed maintenance requests' },
            { name: 'Monthly Report', category: 'reporting', description: 'Generate monthly financial summaries' },
            { name: 'Rent Increase Notice', category: 'communication', description: 'Send rent increase notifications' },
            { name: 'Property Inspection', category: 'maintenance', description: 'Schedule regular property inspections' }
          ].map((template, index) => (
            <div key={index} className="p-4 border border-app-border rounded-2xl hover:bg-app-bg transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                {getCategoryIcon(template.category)}
                <h4 className="font-medium text-text-primary">{template.name}</h4>
              </div>
              <p className="text-sm text-text-secondary">{template.description}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AutomationRules;