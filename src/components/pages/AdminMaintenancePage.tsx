'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, AlertCircle, CheckCircle, Clock, Filter, Download } from 'lucide-react';

const AdminMaintenancePage = () => {
  const [filter, setFilter] = useState('all');
  
  const maintenanceRequests = [
    {
      id: '1',
      property: 'Sunset Apartments',
      unit: '2A',
      tenant: 'John Doe',
      issue: 'Leaking faucet in kitchen',
      priority: 'medium',
      status: 'pending',
      createdAt: '2024-01-15',
      organization: 'ABC Properties'
    },
    {
      id: '2',
      property: 'Downtown Complex',
      unit: '5B',
      tenant: 'Jane Smith',
      issue: 'Heating not working',
      priority: 'high',
      status: 'in_progress',
      createdAt: '2024-01-14',
      organization: 'XYZ Management'
    },
    {
      id: '3',
      property: 'Garden View',
      unit: '1C',
      tenant: 'Mike Johnson',
      issue: 'Light fixture replacement',
      priority: 'low',
      status: 'completed',
      createdAt: '2024-01-13',
      organization: 'ABC Properties'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'in_progress': return <AlertCircle size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const filteredRequests = maintenanceRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Maintenance Requests</h1>
          <p className="text-text-secondary mt-1">Monitor all maintenance requests across organizations</p>
        </div>
        <button className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2">
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="app-surface rounded-2xl p-6 border border-app-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Total Requests</p>
              <p className="text-2xl font-bold text-text-primary">{maintenanceRequests.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Wrench size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="app-surface rounded-2xl p-6 border border-app-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Pending</p>
              <p className="text-2xl font-bold text-text-primary">
                {maintenanceRequests.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="app-surface rounded-2xl p-6 border border-app-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">In Progress</p>
              <p className="text-2xl font-bold text-text-primary">
                {maintenanceRequests.filter(r => r.status === 'in_progress').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <AlertCircle size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="app-surface rounded-2xl p-6 border border-app-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">Completed</p>
              <p className="text-2xl font-bold text-text-primary">
                {maintenanceRequests.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-app-border rounded-xl bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Requests Table */}
      <div className="app-surface rounded-2xl border border-app-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-app-bg border-b border-app-border">
              <tr>
                <th className="text-left p-4 font-semibold text-text-secondary">Request</th>
                <th className="text-left p-4 font-semibold text-text-secondary">Property</th>
                <th className="text-left p-4 font-semibold text-text-secondary">Tenant</th>
                <th className="text-left p-4 font-semibold text-text-secondary">Priority</th>
                <th className="text-left p-4 font-semibold text-text-secondary">Status</th>
                <th className="text-left p-4 font-semibold text-text-secondary">Organization</th>
                <th className="text-left p-4 font-semibold text-text-secondary">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-app-bg transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-text-primary">{request.issue}</div>
                    <div className="text-sm text-text-secondary">Unit {request.unit}</div>
                  </td>
                  <td className="p-4 text-text-primary">{request.property}</td>
                  <td className="p-4 text-text-primary">{request.tenant}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="p-4 text-text-primary">{request.organization}</td>
                  <td className="p-4 text-text-secondary">{request.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminMaintenancePage;