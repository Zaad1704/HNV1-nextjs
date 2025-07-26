import React, { useState } from 'react';
import { Bot, Play, Pause, Settings, Zap, Clock, CheckCircle, Plus } from 'lucide-react';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalActionButton from '@/components/common/UniversalActionButton';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  status: 'active' | 'paused' | 'draft';
  lastRun?: string;
  executions: number;
}

const AutomationCenter: React.FC = () => {
  const [automations, setAutomations] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Late Payment Reminder',
      description: 'Send automated reminders for overdue rent payments',
      trigger: 'Payment overdue by 3 days',
      action: 'Send SMS + Email reminder',
      status: 'active',
      lastRun: '2024-01-15',
      executions: 47
    },
    {
      id: '2',
      name: 'Lease Renewal Alert',
      description: 'Notify landlords 60 days before lease expiration',
      trigger: 'Lease expires in 60 days',
      action: 'Create task + Send notification',
      status: 'active',
      lastRun: '2024-01-14',
      executions: 12
    },
    {
      id: '3',
      name: 'Maintenance Follow-up',
      description: 'Follow up on pending maintenance requests',
      trigger: 'Request open for 7 days',
      action: 'Send escalation email',
      status: 'paused',
      lastRun: '2024-01-10',
      executions: 8
    }
  ]);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(auto => 
      auto.id === id 
        ? { ...auto, status: auto.status === 'active' ? 'paused' : 'active' }
        : auto
    ));
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <UniversalHeader
        title="Automation Center"
        subtitle="Streamline your property management with smart automation"
        icon={Bot}
        stats={[
          { label: 'Active Rules', value: automations.filter(a => a.status === 'active').length, color: 'green' },
          { label: 'Total Executions', value: automations.reduce((sum, a) => sum + a.executions, 0), color: 'blue' },
          { label: 'Time Saved', value: '24h/week', color: 'purple' }
        ]}
        actions={
          <UniversalActionButton variant="primary" icon={Plus}>
            Create Automation
          </UniversalActionButton>
        }
      />

      <div className="grid grid-cols-1 gap-6">
        {automations.map((automation, index) => (
          <UniversalCard key={automation.id} delay={index * 0.1} gradient="orange">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Bot size={24} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{automation.name}</h3>
                  <p className="text-sm text-gray-600">{automation.description}</p>
                </div>
              </div>
              <UniversalStatusBadge 
                status={automation.status} 
                variant={getStatusVariant(automation.status)}
                icon={automation.status === 'active' ? CheckCircle : undefined}
              />
            </div>

            <div className="space-y-3 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Trigger</span>
                </div>
                <p className="text-sm text-blue-700">{automation.trigger}</p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Play size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">Action</span>
                </div>
                <p className="text-sm text-green-700">{automation.action}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>Last run: {automation.lastRun || 'Never'}</span>
              </div>
              <span>{automation.executions} executions</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleAutomation(automation.id)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  automation.status === 'active'
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                {automation.status === 'active' ? (
                  <>
                    <Pause size={16} className="inline mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={16} className="inline mr-2" />
                    Activate
                  </>
                )}
              </button>
              
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Settings size={16} />
              </button>
            </div>
          </UniversalCard>
        ))}
      </div>
    </div>
  );
};

export default AutomationCenter;