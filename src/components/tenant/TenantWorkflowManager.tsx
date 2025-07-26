import React from 'react';
import { GitBranch, Play, Pause, CheckCircle, Clock, AlertTriangle, Users, Settings } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'condition' | 'action' | 'delay';
  config: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  steps: WorkflowStep[];
  isActive: boolean;
  lastRun?: Date;
  successRate: number;
  totalRuns: number;
}

interface TenantWorkflowManagerProps {
  tenants: any[];
  onWorkflowCreate: (workflow: Omit<Workflow, 'id' | 'totalRuns' | 'successRate'>) => void;
  onWorkflowUpdate: (id: string, workflow: Partial<Workflow>) => void;
  className?: string;
}

const TenantWorkflowManager: React.FC<TenantWorkflowManagerProps> = ({
  tenants,
  onWorkflowCreate,
  onWorkflowUpdate,
  className = ''
}) => {
  const [workflows, setWorkflows] = React.useState<Workflow[]>([
    {
      id: '1',
      name: 'New Tenant Onboarding',
      description: 'Automated welcome sequence for new tenants',
      trigger: 'tenant_created',
      steps: [
        { id: '1', name: 'Send Welcome Email', type: 'action', config: { template: 'welcome' }, status: 'completed' },
        { id: '2', name: 'Wait 1 Day', type: 'delay', config: { duration: 1 }, status: 'completed' },
        { id: '3', name: 'Send Move-in Checklist', type: 'action', config: { template: 'checklist' }, status: 'running' },
        { id: '4', name: 'Schedule Property Tour', type: 'action', config: { type: 'calendar' }, status: 'pending' }
      ],
      isActive: true,
      lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      successRate: 95,
      totalRuns: 23
    },
    {
      id: '2',
      name: 'Late Payment Recovery',
      description: 'Escalating reminders for overdue payments',
      trigger: 'payment_overdue',
      steps: [
        { id: '1', name: 'Check Payment Status', type: 'condition', config: { field: 'payment_status' }, status: 'completed' },
        { id: '2', name: 'Send Friendly Reminder', type: 'action', config: { template: 'friendly_reminder' }, status: 'completed' },
        { id: '3', name: 'Wait 3 Days', type: 'delay', config: { duration: 3 }, status: 'running' },
        { id: '4', name: 'Send Formal Notice', type: 'action', config: { template: 'formal_notice' }, status: 'pending' },
        { id: '5', name: 'Wait 7 Days', type: 'delay', config: { duration: 7 }, status: 'pending' },
        { id: '6', name: 'Initiate Legal Process', type: 'action', config: { type: 'legal' }, status: 'pending' }
      ],
      isActive: true,
      lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      successRate: 78,
      totalRuns: 41
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = React.useState<Workflow | null>(null);
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  const getStepIcon = (type: string, status: string) => {
    if (status === 'running') return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    if (status === 'completed') return <CheckCircle size={16} className="text-green-500" />;
    if (status === 'failed') return <AlertTriangle size={16} className="text-red-500" />;
    return <Clock size={16} className="text-gray-400" />;
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-200 bg-green-50';
      case 'running': return 'border-blue-200 bg-blue-50';
      case 'failed': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === id ? { ...workflow, isActive: !workflow.isActive } : workflow
    ));
  };

  const renderWorkflowSteps = (workflow: Workflow) => (
    <div className="space-y-3">
      {workflow.steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStepColor(step.status)}`}>
            {getStepIcon(step.type, step.status)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{step.name}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                step.status === 'completed' ? 'bg-green-100 text-green-800' :
                step.status === 'running' ? 'bg-blue-100 text-blue-800' :
                step.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                {step.status}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {step.type === 'delay' ? `Wait ${step.config.duration} day(s)` :
               step.type === 'condition' ? `Check ${step.config.field}` :
               `Action: ${step.config.template || step.config.type}`}
            </div>
          </div>
          {index < workflow.steps.length - 1 && (
            <div className="absolute left-4 mt-8 w-0.5 h-6 bg-gray-300"></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <GitBranch size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">Workflow Manager</h3>
                <p className="text-sm text-gray-600">Automated tenant management workflows</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600"
            >
              <GitBranch size={16} />
              New Workflow
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workflow List */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Active Workflows</h4>
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedWorkflow?.id === workflow.id
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${workflow.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <h5 className="font-semibold text-gray-900">{workflow.name}</h5>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWorkflow(workflow.id);
                      }}
                      className={`p-1 rounded ${
                        workflow.isActive 
                          ? 'text-green-600 hover:bg-green-100' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {workflow.isActive ? <Play size={16} /> : <Pause size={16} />}
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">{workflow.steps.length} steps</span>
                      <span className="text-gray-600">{workflow.totalRuns} runs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        workflow.successRate >= 90 ? 'bg-green-100 text-green-800' :
                        workflow.successRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {workflow.successRate}% success
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Workflow Details */}
            <div>
              {selectedWorkflow ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Workflow Steps</h4>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Settings size={16} />
                      </button>
                    </div>
                    {renderWorkflowSteps(selectedWorkflow)}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="font-medium text-gray-900 mb-3">Performance Metrics</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">{selectedWorkflow.totalRuns}</div>
                        <div className="text-sm text-gray-600">Total Runs</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{selectedWorkflow.successRate}%</div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-900">Last Run</div>
                        <div className="text-sm text-gray-600">
                          {selectedWorkflow.lastRun?.toLocaleDateString() || 'Never'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-900">Status</div>
                        <div className={`text-sm font-medium ${
                          selectedWorkflow.isActive ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {selectedWorkflow.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4">
                    <h5 className="font-medium text-blue-900 mb-2">Trigger Conditions</h5>
                    <p className="text-sm text-blue-800">
                      This workflow runs when: <span className="font-medium">{selectedWorkflow.trigger.replace('_', ' ')}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <GitBranch size={48} className="text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Select a Workflow</h4>
                  <p className="text-gray-600">Choose a workflow from the list to view its details and performance.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create New Workflow</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Lease Renewal Process"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Describe what this workflow does..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Event</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    <option value="tenant_created">New Tenant Added</option>
                    <option value="payment_overdue">Payment Overdue</option>
                    <option value="lease_expiring">Lease Expiring</option>
                    <option value="maintenance_request">Maintenance Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Steps</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <GitBranch size={32} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-4">Workflow builder coming soon</p>
                    <p className="text-sm text-gray-500">Use templates to get started quickly</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600"
                >
                  Create Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TenantWorkflowManager;