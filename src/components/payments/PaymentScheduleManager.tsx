import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Play, Pause, Edit, Trash2, Plus } from 'lucide-react';
import apiClient from '@/lib/api';

interface PaymentSchedule {
  _id: string;
  tenantId: any;
  propertyId: any;
  unitId?: any;
  scheduleType: string;
  frequency: string;
  amount: number;
  nextDueDate: string;
  status: string;
  autoProcess: boolean;
  processedPayments: Array<{
    processedDate: string;
    amount: number;
    status: string;
  }>;
}

const PaymentScheduleManager: React.FC = () => {
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data } = await apiClient.get('/enhanced-bulk-payment/schedules');
      setSchedules(data.data);
    } catch (error) {
      console.error('Failed to fetch payment schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly'
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <div className="p-4 text-center">Loading payment schedules...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            Payment Schedules
          </h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Create Schedule
          </button>
        </div>
      </div>

      <div className="p-6">
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No payment schedules created yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => {
              const daysUntilDue = getDaysUntilDue(schedule.nextDueDate);
              const isOverdue = daysUntilDue < 0;
              const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

              return (
                <div key={schedule._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        schedule.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                      <div>
                        <div className="font-medium">{schedule.tenantId?.name}</div>
                        <div className="text-sm text-gray-500">
                          {schedule.propertyId?.name}
                          {schedule.unitId && ` - Unit ${schedule.unitId.unitNumber}`}
                          {schedule.unitId?.nickname && ` (${schedule.unitId.nickname})`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                        {schedule.status}
                      </span>
                      {schedule.autoProcess && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          Auto
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Amount</div>
                      <div className="font-bold">${schedule.amount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Frequency</div>
                      <div className="font-medium">{getFrequencyLabel(schedule.frequency)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Next Due</div>
                      <div className={`font-medium ${
                        isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-gray-900'
                      }`}>
                        {new Date(schedule.nextDueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Processed</div>
                      <div className="font-medium">{schedule.processedPayments.length} payments</div>
                    </div>
                  </div>

                  {/* Due Date Alert */}
                  {isOverdue && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <Clock size={16} />
                        <span className="font-medium">Overdue by {Math.abs(daysUntilDue)} days</span>
                      </div>
                    </div>
                  )}

                  {isDueSoon && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <Clock size={16} />
                        <span className="font-medium">Due in {daysUntilDue} days</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {schedule.status === 'active' ? (
                      <button className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200 transition-colors flex items-center gap-1">
                        <Pause size={14} />
                        Pause
                      </button>
                    ) : (
                      <button className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 transition-colors flex items-center gap-1">
                        <Play size={14} />
                        Resume
                      </button>
                    )}
                    
                    <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition-colors flex items-center gap-1">
                      <Edit size={14} />
                      Edit
                    </button>
                    
                    <button className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200 transition-colors flex items-center gap-1">
                      <Trash2 size={14} />
                      Cancel
                    </button>

                    {(isOverdue || isDueSoon) && (
                      <button className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm hover:bg-purple-200 transition-colors">
                        Process Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentScheduleManager;