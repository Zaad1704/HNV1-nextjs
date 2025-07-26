import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { DollarSign, Receipt, Wrench, Bell, CheckCircle, Activity, Filter, Calendar, TrendingUp } from 'lucide-react';

interface TenantDataPreviewProps {
  tenantId: string;
  tenant?: any;
}

const TenantDataPreviewSections: React.FC<TenantDataPreviewProps> = ({ tenantId, tenant }) => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const { data: previews, isLoading } = useQuery({
    queryKey: ['tenantDataPreviews', tenantId, statusFilter, dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);
      const queryString = params.toString();
      const { data } = await apiClient.get(`/tenants/${tenantId}/data-previews${queryString ? `?${queryString}` : ''}`);
      return data.data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['tenantStats', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tenants/${tenantId}/stats`);
      return data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="app-surface rounded-3xl p-6 border border-app-border animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
            <div className="space-y-2">
              {[1,2,3].map(j => (
                <div key={j} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!previews) return null;

  return (
    <div className="space-y-8">
      {/* Filter Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Filter size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">Tenant Data Filters</h3>
            <p className="text-sm text-text-secondary">Filter tenant-specific data by status and time</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              <TrendingUp size={14} className="inline mr-1" />
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm bg-white"
            >
              <option value="">All Status</option>
              <option value="paid">Paid Items</option>
              <option value="pending">Pending Items</option>
              <option value="overdue">Overdue Items</option>
              <option value="completed">Completed Items</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              <Calendar size={14} className="inline mr-1" />
              Time Period
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm bg-white"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <DollarSign size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Payment Stats</h3>
                <p className="text-sm text-green-600">{stats.payments.paymentRate}% payment rate</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Paid:</span>
                <span className="font-semibold text-green-600">${stats.payments.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Outstanding:</span>
                <span className="font-semibold text-red-600">${stats.payments.outstanding}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Wrench size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-800">Maintenance</h3>
                <p className="text-sm text-orange-600">{stats.maintenance.total} total requests</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Open:</span>
                <span className="font-semibold text-red-600">{stats.maintenance.open}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Closed:</span>
                <span className="font-semibold text-green-600">{stats.maintenance.closed}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800">Lease Info</h3>
                <p className="text-sm text-blue-600">{stats.lease.monthsSinceStart} months active</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly Rent:</span>
                <span className="font-semibold text-blue-600">${stats.lease.rentAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Months Paid:</span>
                <span className="font-semibold text-green-600">{stats.lease.monthsPaid}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Payments Preview */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                <DollarSign size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Recent Payments</h3>
                <p className="text-sm text-text-secondary">{previews.payments?.length || 0} payments</p>
              </div>
            </div>
            <Link 
              to={`/dashboard/payments?tenantId=${tenantId}`}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {previews.payments?.slice(0, 3).map((payment: any) => (
              <div key={payment._id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">${payment.amount}</p>
                  <p className="text-xs text-gray-600">
                    {payment.rentMonth} • {payment.paymentMethod}
                  </p>
                  {payment.property && (
                    <Link 
                      to={`/dashboard/properties/${payment.property._id}`}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {payment.property.name}
                    </Link>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-xs ${payment.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {payment.status}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No recent payments</p>
            )}
          </div>
        </div>

        {/* Maintenance Preview */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Wrench size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Maintenance</h3>
                <p className="text-sm text-text-secondary">{previews.maintenance?.length || 0} requests</p>
              </div>
            </div>
            <Link 
              to={`/dashboard/maintenance?tenantId=${tenantId}`}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {previews.maintenance?.slice(0, 3).map((maintenance: any) => (
              <div key={maintenance._id} className="p-3 bg-orange-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-sm">{maintenance.description}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    maintenance.status === 'Open' ? 'bg-red-100 text-red-800' :
                    maintenance.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {maintenance.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-600">{maintenance.priority} priority</p>
                    {maintenance.property && (
                      <Link 
                        to={`/dashboard/properties/${maintenance.property._id}`}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        {maintenance.property.name}
                      </Link>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    {new Date(maintenance.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No maintenance requests</p>
            )}
          </div>
        </div>

        {/* Receipts Preview */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Receipt size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Recent Receipts</h3>
                <p className="text-sm text-text-secondary">{previews.receipts?.length || 0} receipts</p>
              </div>
            </div>
            <Link 
              to={`/dashboard/receipts?tenantId=${tenantId}`}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {previews.receipts?.slice(0, 3).map((receipt: any) => (
              <div key={receipt._id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">#{receipt.receiptNumber}</p>
                  <p className="text-xs text-gray-600">{receipt.paymentMethod}</p>
                  {receipt.property && (
                    <Link 
                      to={`/dashboard/properties/${receipt.property._id}`}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {receipt.property.name}
                    </Link>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">${receipt.amount}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(receipt.paymentDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No recent receipts</p>
            )}
          </div>
        </div>

        {/* Reminders Preview */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Reminders</h3>
                <p className="text-sm text-text-secondary">{previews.reminders?.length || 0} active</p>
              </div>
            </div>
            <Link 
              to={`/dashboard/reminders?tenantId=${tenantId}`}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {previews.reminders?.slice(0, 3).map((reminder: any) => (
              <div key={reminder._id} className="p-3 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-sm">{reminder.title}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reminder.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {reminder.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-600 capitalize">{reminder.type.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(reminder.nextRunDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No active reminders</p>
            )}
          </div>
        </div>

        {/* Approvals Preview */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 border border-yellow-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
                <CheckCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Approvals</h3>
                <p className="text-sm text-text-secondary">{previews.approvals?.length || 0} requests</p>
              </div>
            </div>
            <Link 
              to={`/dashboard/approvals?tenantId=${tenantId}`}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {previews.approvals?.slice(0, 3).map((approval: any) => (
              <div key={approval._id} className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-sm">{approval.description}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    approval.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    approval.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {approval.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-600 capitalize">
                    {approval.type.replace('_', ' ')} • {approval.priority}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(approval.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No approval requests</p>
            )}
          </div>
        </div>

        {/* Activity Logs Preview */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-3xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-500 rounded-xl flex items-center justify-center">
                <Activity size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Activity Logs</h3>
                <p className="text-sm text-text-secondary">{previews.auditLogs?.length || 0} recent</p>
              </div>
            </div>
            <Link 
              to={`/dashboard/audit?tenantId=${tenantId}`}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {previews.auditLogs?.slice(0, 3).map((log: any) => (
              <div key={log._id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-sm">{log.action}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.severity === 'low' ? 'bg-green-100 text-green-800' :
                    log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    log.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {log.severity}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-600">
                    {log.user?.name || 'System'} • {log.resource}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDataPreviewSections;