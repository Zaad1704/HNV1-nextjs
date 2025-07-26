import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, BarChart3, Plus, Play, Clock, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '@/lib/api';

interface PaymentAnalytics {
  summary: {
    totalRevenue: number;
    totalPayments: number;
    avgPaymentAmount: number;
    activeSchedules: number;
  };
  recentBatches: Array<{
    _id: string;
    batchName: string;
    status: string;
    totalAmount: number;
    successfulPayments: number;
    totalPayments: number;
    createdAt: string;
  }>;
  recentActivity: Array<{
    _id: string;
    amount: number;
    tenantId: any;
    propertyId: any;
    createdAt: string;
  }>;
}

const EnhancedBulkPaymentDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await apiClient.get('/enhanced-bulk-payment/analytics');
      setAnalytics(data.data);
    } catch (error) {
      console.error('Failed to fetch payment analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      partial: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-600" />;
      case 'processing': return <Clock size={16} className="text-blue-600" />;
      case 'failed': return <XCircle size={16} className="text-red-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading payment dashboard...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Enhanced Bulk Payment System</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateSchedule(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Calendar size={16} />
            Create Schedule
          </button>
          <button
            onClick={() => setShowCreateBatch(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} />
            Create Batch
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <CreditCard className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">${analytics.summary.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold">{analytics.summary.totalPayments}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <Calendar className="text-purple-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Active Schedules</p>
                <p className="text-2xl font-bold">{analytics.summary.activeSchedules}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <CreditCard className="text-orange-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Avg Payment</p>
                <p className="text-2xl font-bold">${Math.round(analytics.summary.avgPaymentAmount)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Batches & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Recent Bulk Batches</h3>
          </div>
          <div className="p-6">
            {analytics?.recentBatches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No bulk batches created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics?.recentBatches.map((batch) => (
                  <div key={batch._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(batch.status)}
                      <div>
                        <div className="font-medium">{batch.batchName}</div>
                        <div className="text-sm text-gray-500">
                          {batch.successfulPayments}/{batch.totalPayments} payments
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${batch.totalAmount.toLocaleString()}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                        {batch.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
          </div>
          <div className="p-6">
            {analytics?.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No recent payment activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics?.recentActivity.map((payment) => (
                  <div key={payment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{payment.tenantId?.name}</div>
                      <div className="text-sm text-gray-500">{payment.propertyId?.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${payment.amount}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
              <div className="flex items-center gap-3 mb-2">
                <Play className="text-blue-600" size={20} />
                <span className="font-medium">Process Scheduled Payments</span>
              </div>
              <p className="text-sm text-gray-600">Run automated payment processing for due schedules</p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="text-green-600" size={20} />
                <span className="font-medium">Monthly Rent Collection</span>
              </div>
              <p className="text-sm text-gray-600">Create bulk batch for monthly rent collection</p>
            </button>

            <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="text-purple-600" size={20} />
                <span className="font-medium">Payment Reports</span>
              </div>
              <p className="text-sm text-gray-600">Generate detailed payment analytics and reports</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBulkPaymentDashboard;