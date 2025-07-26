'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Home, CreditCard, Wrench, MessageSquare, 
  FileText, Calendar, DollarSign, AlertCircle,
  Download, Upload, Bell
} from 'lucide-react';
import apiClient from '@/lib/api';

const TenantPortal: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: tenantData } = useQuery({
    queryKey: ['tenantPortal'],
    queryFn: async () => {
      const response = await apiClient.get('/tenant/portal');
      return response.data.data;
    }
  });

  const { data: payments } = useQuery({
    queryKey: ['tenantPayments'],
    queryFn: async () => {
      const response = await apiClient.get('/tenant/payments');
      return response.data.data;
    }
  });

  const { data: maintenanceRequests } = useQuery({
    queryKey: ['tenantMaintenance'],
    queryFn: async () => {
      const response = await apiClient.get('/tenant/maintenance');
      return response.data.data;
    }
  });

  const paymentMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiClient.post('/tenant/payment', { amount });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantPayments'] });
    }
  });

  const maintenanceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/tenant/maintenance', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenantMaintenance'] });
    }
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Home size={20} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={20} /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench size={20} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={20} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tenant Portal</h1>
              <p className="text-gray-600">Welcome back, {tenantData?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab tenantData={tenantData} />}
        {activeTab === 'payments' && <PaymentsTab payments={payments} onPayment={paymentMutation.mutate} />}
        {activeTab === 'maintenance' && <MaintenanceTab requests={maintenanceRequests} onSubmit={maintenanceMutation.mutate} />}
        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'messages' && <MessagesTab />}
      </div>
    </div>
  );
};

const OverviewTab: React.FC<{ tenantData: any }> = ({ tenantData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Property Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Property</p>
            <p className="font-medium">{tenantData?.property?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Unit</p>
            <p className="font-medium">{tenantData?.unit}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Lease Start</p>
            <p className="font-medium">{new Date(tenantData?.leaseStart).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Lease End</p>
            <p className="font-medium">{new Date(tenantData?.leaseEnd).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
            Pay Rent
          </button>
          <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">
            Submit Maintenance
          </button>
          <button className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600">
            Download Lease
          </button>
        </div>
      </div>
    </div>
  </div>
);

const PaymentsTab: React.FC<{ payments: any[]; onPayment: (amount: number) => void }> = ({ payments, onPayment }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Make Payment</h3>
      <div className="flex items-center gap-4">
        <input
          type="number"
          placeholder="Amount"
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          onClick={() => onPayment(1200)}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Pay Now
        </button>
      </div>
    </div>
    
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold">Payment History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments?.map((payment: any) => (
              <tr key={payment._id}>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">${payment.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{payment.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const MaintenanceTab: React.FC<{ requests: any[]; onSubmit: (data: any) => void }> = ({ requests, onSubmit }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: '', description: '', priority: 'medium' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Maintenance Requests</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          New Request
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                Submit
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {requests?.map((request: any) => (
          <div key={request._id} className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{request.title}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${
                request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {request.priority}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3">{request.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Status: {request.status}</span>
              <span>{new Date(request.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DocumentsTab: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border">
    <h3 className="text-lg font-semibold mb-4">Documents</h3>
    <div className="space-y-3">
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-blue-500" />
          <span>Lease Agreement</span>
        </div>
        <button className="text-blue-500 hover:text-blue-600">
          <Download size={16} />
        </button>
      </div>
    </div>
  </div>
);

const MessagesTab: React.FC = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border">
    <h3 className="text-lg font-semibold mb-4">Messages</h3>
    <p className="text-gray-500">No messages yet</p>
  </div>
);

export default TenantPortal;