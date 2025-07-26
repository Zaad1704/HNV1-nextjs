import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { DollarSign, Receipt, Wrench, Bell, CheckCircle, Activity, Filter, Users, Home, Calendar } from 'lucide-react';

interface DataPreviewProps {
  propertyId: string;
  selectedUnit?: string;
  property?: any;
  tenants?: any[];
  payments?: any[];
  expenses?: any[];
  maintenanceRequests?: any[];
}

const DataPreviewSections: React.FC<DataPreviewProps> = ({ propertyId, selectedUnit, property, tenants, payments, expenses, maintenanceRequests }) => {
  const [unitFilter, setUnitFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const { data: previews, isLoading, error } = useQuery({
    queryKey: ['propertyDataPreviews', propertyId, unitFilter, statusFilter, dateFilter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (unitFilter) params.append('unit', unitFilter);
        if (statusFilter) params.append('status', statusFilter);
        if (dateFilter) params.append('date', dateFilter);
        const queryString = params.toString();
        const { data } = await apiClient.get(`/properties/${propertyId}/data-previews${queryString ? `?${queryString}` : ''}`);
        return data.data;
      } catch (error) {
        console.error('Failed to fetch data previews:', error);
        return {
          payments: [],
          receipts: [],
          expenses: [],
          maintenance: [],
          reminders: [],
          approvals: [],
          auditLogs: []
        };
      }
    },
    retry: false
  });

  // Generate unit options from property data
  const getUnitOptions = () => {
    if (!property?.numberOfUnits) return [];
    return Array.from({ length: property.numberOfUnits }, (_, i) => (i + 1).toString());
  };

  // Get occupied/vacant units
  const occupiedUnits = tenants?.filter(t => t.status === 'Active').map(t => t.unit) || [];
  const vacantUnits = getUnitOptions().filter(unit => !occupiedUnits.includes(unit));

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

  if (!previews) {
    // Fallback data structure
    const fallbackPreviews = {
      payments: [],
      receipts: [],
      expenses: [],
      maintenance: [],
      reminders: [],
      approvals: [],
      auditLogs: []
    };
    return (
      <div className="space-y-8">
        <div className="text-center py-8 bg-gray-50 rounded-2xl">
          <p className="text-gray-500">Unable to load data previews. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Filter Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Filter size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">Smart Filters</h3>
            <p className="text-sm text-text-secondary">Filter data by unit, status, and time period</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Unit Filter */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              <Home size={14} className="inline mr-1" />
              Filter by Unit
            </label>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">All Units ({property?.numberOfUnits || 0})</option>
              {getUnitOptions().map(unit => {
                const tenant = tenants?.find(t => t.unit === unit);
                const isOccupied = !!tenant;
                return (
                  <option key={unit} value={unit}>
                    Unit {unit} {isOccupied ? `(${tenant.name})` : '(Vacant)'}
                  </option>
                );
              })}
            </select>
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              <Users size={14} className="inline mr-1" />
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white"
            >
              <option value="">All Status</option>
              <option value="occupied">Occupied Units ({occupiedUnits.length})</option>
              <option value="vacant">Vacant Units ({vacantUnits.length})</option>
              <option value="active">Active Tenants</option>
              <option value="late">Late Payments</option>
              <option value="pending">Pending Items</option>
            </select>
          </div>
          
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              <Calendar size={14} className="inline mr-1" />
              Time Period
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white"
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
        
        {/* Active Filters Display */}
        {(unitFilter || statusFilter || dateFilter) && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-text-secondary">Active filters:</span>
            {unitFilter && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1">
                Unit {unitFilter}
                <button onClick={() => setUnitFilter('')} className="ml-1 hover:bg-blue-200 rounded-full p-0.5">
                  ×
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                <button onClick={() => setStatusFilter('')} className="ml-1 hover:bg-green-200 rounded-full p-0.5">
                  ×
                </button>
              </span>
            )}
            {dateFilter && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium flex items-center gap-1">
                {dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1)}
                <button onClick={() => setDateFilter('')} className="ml-1 hover:bg-purple-200 rounded-full p-0.5">
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setUnitFilter('');
                setStatusFilter('');
                setDateFilter('');
              }}
              className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Data Preview Grid */}
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
              to={`/dashboard/payments?propertyId=${propertyId}${unitFilter ? `&unit=${unitFilter}` : ''}`}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {previews.payments?.slice(0, 3).map((payment: any) => (
              <div key={payment._id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  {payment.tenant ? (
                    <Link 
                      to={`/dashboard/tenants/${payment.tenant._id}`}
                      className="font-medium text-sm text-blue-600 hover:text-blue-800"
                    >
                      {payment.tenant.name}
                    </Link>
                  ) : (
                    <p className="font-medium text-sm text-gray-500">No Tenant</p>
                  )}
                  <p className="text-xs text-gray-600">
                    {payment.tenant?.unit && `Unit ${payment.tenant.unit} • `}{payment.rentMonth} • {payment.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${payment.amount}</p>
                  <p className={`text-xs ${payment.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {payment.status}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No recent payments</p>
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
              to={`/dashboard/receipts?propertyId=${propertyId}${unitFilter ? `&unit=${unitFilter}` : ''}`}
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
                  <p className="text-xs text-gray-600">
                    {receipt.tenant ? (
                      <Link 
                        to={`/dashboard/tenants/${receipt.tenant._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {receipt.tenant.name}
                      </Link>
                    ) : 'No Tenant'} • {receipt.paymentMethod}
                  </p>
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

        {/* Expenses Preview */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-6 border border-red-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <DollarSign size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Recent Expenses</h3>
                <p className="text-sm text-text-secondary">{previews.expenses?.length || 0} expenses</p>
              </div>
            </div>
            <Link 
              to={`/dashboard/expenses?propertyId=${propertyId}`}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-3">
            {previews.expenses?.slice(0, 3).map((expense: any) => (
              <div key={expense._id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{expense.description}</p>
                  <p className="text-xs text-gray-600">
                    {expense.category} • {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">${expense.amount}</p>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No recent expenses</p>
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
              to={`/dashboard/maintenance?propertyId=${propertyId}${unitFilter ? `&unit=${unitFilter}` : ''}`}
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
                  <p className="text-xs text-gray-600">
                    {maintenance.tenant ? (
                      <Link 
                        to={`/dashboard/tenants/${maintenance.tenant._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {maintenance.tenant.name} (Unit {maintenance.tenant.unit})
                      </Link>
                    ) : 'Property'} • {maintenance.priority}
                  </p>
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
              to={`/dashboard/reminders?propertyId=${propertyId}${unitFilter ? `&unit=${unitFilter}` : ''}`}
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
              to={`/dashboard/approvals?propertyId=${propertyId}`}
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

        {/* Audit Logs Preview */}
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
              to={`/dashboard/audit?propertyId=${propertyId}`}
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

export default DataPreviewSections;