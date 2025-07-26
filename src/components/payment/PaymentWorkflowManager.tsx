import React, { useState } from 'react';
import { Workflow, Plus, Play, Pause, Settings, Users, DollarSign, Calendar, Mail } from 'lucide-react';

interface PaymentWorkflowManagerProps {
  payments: any[];
  onWorkflowCreate: (workflow: any) => void;
  onWorkflowUpdate: (id: string, workflow: any) => void;
}

const PaymentWorkflowManager: React.FC<PaymentWorkflowManagerProps> = ({
  payments,
  onWorkflowCreate,
  onWorkflowUpdate
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    steps: [
      { id: '1', type: 'trigger', config: { event: 'payment_due' } },
      { id: '2', type: 'action', config: { action: 'send_reminder' } }
    ],
    enabled: true
  });

  // Mock existing workflows
  const [workflows] = useState([
    {
      id: '1',
      name: 'Payment Collection Workflow',
      description: 'Automated payment collection and follow-up process',
      steps: [
        { id: '1', type: 'trigger', config: { event: 'payment_due' } },
        { id: '2', type: 'wait', config: { days: 1 } },
        { id: '3', type: 'action', config: { action: 'send_reminder' } },
        { id: '4', type: 'wait', config: { days: 3 } },
        { id: '5', type: 'action', config: { action: 'send_final_notice' } },
        { id: '6', type: 'action', config: { action: 'mark_overdue' } }
      ],
      enabled: true,
      lastRun: '2024-01-15',
      totalRuns: 45
    },
    {
      id: '2',
      name: 'Receipt Distribution',
      description: 'Automatically send receipts after payment confirmation',
      steps: [
        { id: '1', type: 'trigger', config: { event: 'payment_received' } },
        { id: '2', type: 'action', config: { action: 'generate_receipt' } },
        { id: '3', type: 'action', config: { action: 'send_receipt' } }
      ],
      enabled: true,
      lastRun: '2024-01-16',
      totalRuns: 128
    }
  ]);

  const stepTypes = [
    { value: 'trigger', label: 'Trigger', icon: Play, color: 'bg-green-500' },
    { value: 'action', label: 'Action', icon: Settings, color: 'bg-blue-500' },
    { value: 'wait', label: 'Wait', icon: Pause, color: 'bg-yellow-500' },
    { value: 'condition', label: 'Condition', icon: Users, color: 'bg-purple-500' }
  ];

  const triggerEvents = [
    { value: 'payment_due', label: 'Payment Due' },
    { value: 'payment_received', label: 'Payment Received' },
    { value: 'payment_overdue', label: 'Payment Overdue' },
    { value: 'payment_failed', label: 'Payment Failed' }
  ];

  const actionTypes = [
    { value: 'send_reminder', label: 'Send Reminder Email' },
    { value: 'send_sms', label: 'Send SMS' },
    { value: 'generate_receipt', label: 'Generate Receipt' },
    { value: 'send_receipt', label: 'Send Receipt' },
    { value: 'mark_overdue', label: 'Mark as Overdue' },
    { value: 'apply_late_fee', label: 'Apply Late Fee' },
    { value: 'create_task', label: 'Create Task' }
  ];

  const addStep = () => {
    const newStep = {
      id: Date.now().toString(),
      type: 'action',
      config: { action: 'send_reminder' }
    };
    setNewWorkflow({
      ...newWorkflow,
      steps: [...newWorkflow.steps, newStep]
    });
  };

  const updateStep = (stepId: string, updates: any) => {
    setNewWorkflow({
      ...newWorkflow,
      steps: newWorkflow.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    });
  };

  const removeStep = (stepId: string) => {
    setNewWorkflow({
      ...newWorkflow,
      steps: newWorkflow.steps.filter(step => step.id !== stepId)
    });
  };

  const handleCreateWorkflow = () => {
    onWorkflowCreate(newWorkflow);
    setNewWorkflow({
      name: '',
      description: '',
      steps: [
        { id: '1', type: 'trigger', config: { event: 'payment_due' } },
        { id: '2', type: 'action', config: { action: 'send_reminder' } }
      ],
      enabled: true
    });
    setShowCreateModal(false);
  };

  const renderWorkflowModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Workflow size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Create Payment Workflow</h3>
            <p className="text-sm text-gray-600">Design automated payment processes</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Workflow Name</label>
              <input
                type="text"
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Payment Collection Process"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Workflow Steps</h4>
              <button
                onClick={addStep}
                className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
              >
                <Plus size={14} />
                Add Step
              </button>
            </div>

            <div className="space-y-3">
              {newWorkflow.steps.map((step, index) => {
                const stepType = stepTypes.find(t => t.value === step.type);
                const StepIcon = stepType?.icon || Settings;

                return (
                  <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 ${stepType?.color} rounded-lg flex items-center justify-center`}>
                        <StepIcon size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <select
                          value={step.type}
                          onChange={(e) => updateStep(step.id, { type: e.target.value })}
                          className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          {stepTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <span className="text-sm text-gray-500">Step {index + 1}</span>
                      {newWorkflow.steps.length > 1 && (
                        <button
                          onClick={() => removeStep(step.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {step.type === 'trigger' && (
                      <select
                        value={step.config.event}
                        onChange={(e) => updateStep(step.id, { config: { ...step.config, event: e.target.value } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {triggerEvents.map(event => (
                          <option key={event.value} value={event.value}>{event.label}</option>
                        ))}
                      </select>
                    )}

                    {step.type === 'action' && (
                      <select
                        value={step.config.action}
                        onChange={(e) => updateStep(step.id, { config: { ...step.config, action: e.target.value } })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {actionTypes.map(action => (
                          <option key={action.value} value={action.value}>{action.label}</option>
                        ))}
                      </select>
                    )}

                    {step.type === 'wait' && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Wait</span>
                        <input
                          type="number"
                          value={step.config.days || 1}
                          onChange={(e) => updateStep(step.id, { config: { ...step.config, days: parseInt(e.target.value) } })}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">days</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowCreateModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateWorkflow}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Create Workflow
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Workflow size={20} className="text-blue-600" />
          <h3 className="font-semibold text-gray-900">Payment Workflows</h3>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus size={16} />
          Create Workflow
        </button>
      </div>

      <div className="space-y-4">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{workflow.name}</h4>
                <p className="text-sm text-gray-600">{workflow.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  workflow.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {workflow.enabled ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => onWorkflowUpdate(workflow.id, { ...workflow, enabled: !workflow.enabled })}
                  className="p-2 text-gray-400 hover:text-blue-600"
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{workflow.steps.length} steps</span>
              <span>Last run: {new Date(workflow.lastRun).toLocaleDateString()}</span>
              <span>Total runs: {workflow.totalRuns}</span>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && renderWorkflowModal()}
    </div>
  );
};

export default PaymentWorkflowManager;