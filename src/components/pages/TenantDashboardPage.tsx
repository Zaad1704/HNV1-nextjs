'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { 
  Home, CreditCard, Wrench, FileText, Calendar, 
  DollarSign, AlertCircle, CheckCircle, Clock,
  Phone, Mail, MapPin
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const fetchTenantData = async () => {
  const { data } = await apiClient.get('/tenant/dashboard');
  return data.data;
};

const TenantDashboardPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: tenantData, isLoading } = useQuery({
    queryKey: ['tenantDashboard'],
    queryFn: fetchTenantData
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading your portal...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Welcome Header */}
      <div className="app-gradient rounded-3xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Home size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
            <p className="text-white/80">Your tenant portal</p>
          </div>
        </div>
      </div>

      {/* Property Info Card */}
      <div className="app-surface rounded-3xl p-8 border border-app-border">
        <h2 className="text-xl font-bold text-text-primary mb-6">Your Property</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Home size={20} className="text-text-muted" />
              <div>
                <p className="text-sm text-text-secondary">Property</p>
                <p className="font-semibold text-text-primary">{tenantData?.property?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={20} className="text-text-muted" />
              <div>
                <p className="text-sm text-text-secondary">Unit</p>
                <p className="font-semibold text-text-primary">{tenantData?.tenant?.unit || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-text-muted" />
              <div>
                <p className="text-sm text-text-secondary">Lease Expires</p>
                <p className="font-semibold text-text-primary">
                  {tenantData?.tenant?.leaseEndDate 
                    ? new Date(tenantData.tenant.leaseEndDate).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <DollarSign size={20} className="text-text-muted" />
              <div>
                <p className="text-sm text-text-secondary">Monthly Rent</p>
                <p className="font-semibold text-text-primary">${tenantData?.tenant?.rentAmount || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-text-muted" />
              <div>
                <p className="text-sm text-text-secondary">Status</p>
                <p className={`font-semibold ${
                  tenantData?.tenant?.status === 'Active' ? 'text-green-600' :
                  tenantData?.tenant?.status === 'Late' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {tenantData?.tenant?.status || 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-text-muted" />
              <div>
                <p className="text-sm text-text-secondary">Contact Support</p>
                <p className="font-semibold text-text-primary">support@property.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-app-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Payment Status */}
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Payment Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">Rent Paid</p>
                    <p className="text-sm text-green-700">January 2024</p>
                  </div>
                </div>
                <span className="font-bold text-green-900">$1,200</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">Next Due</p>
                    <p className="text-sm text-blue-700">February 1, 2024</p>
                  </div>
                </div>
                <span className="font-bold text-blue-900">$1,200</span>
              </div>
            </div>
          </div>

          {/* Recent Maintenance */}
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Maintenance Requests</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-app-bg rounded-xl">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-orange-500" />
                  <div>
                    <p className="font-medium text-text-primary">Kitchen faucet leak</p>
                    <p className="text-sm text-text-secondary">Submitted 2 days ago</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                  In Progress
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-app-bg rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-green-500" />
                  <div>
                    <p className="font-medium text-text-primary">Light bulb replacement</p>
                    <p className="text-sm text-text-secondary">Completed last week</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Completed
                </span>
              </div>
            </div>
            <button className="w-full mt-4 bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors">
              Submit New Request
            </button>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="app-surface rounded-3xl p-8 border border-app-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-text-primary">Payment History</h3>
            <button className="btn-gradient px-6 py-3 rounded-2xl font-semibold">
              Make Payment
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-app-border">
                <tr>
                  <th className="text-left py-3 font-semibold text-text-secondary">Date</th>
                  <th className="text-left py-3 font-semibold text-text-secondary">Description</th>
                  <th className="text-left py-3 font-semibold text-text-secondary">Amount</th>
                  <th className="text-left py-3 font-semibold text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {[
                  { date: '2024-01-01', desc: 'January Rent', amount: '$1,200', status: 'Paid' },
                  { date: '2023-12-01', desc: 'December Rent', amount: '$1,200', status: 'Paid' },
                  { date: '2023-11-01', desc: 'November Rent', amount: '$1,200', status: 'Paid' }
                ].map((payment, index) => (
                  <tr key={index}>
                    <td className="py-3 text-text-primary">{payment.date}</td>
                    <td className="py-3 text-text-primary">{payment.desc}</td>
                    <td className="py-3 text-text-primary font-semibold">{payment.amount}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="app-surface rounded-3xl p-8 border border-app-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-text-primary">Maintenance Requests</h3>
            <button className="btn-gradient px-6 py-3 rounded-2xl font-semibold">
              New Request
            </button>
          </div>
          <div className="space-y-4">
            {[
              { id: 1, issue: 'Kitchen faucet leak', status: 'in_progress', date: '2024-01-15', priority: 'medium' },
              { id: 2, issue: 'Light bulb replacement', status: 'completed', date: '2024-01-10', priority: 'low' },
              { id: 3, issue: 'Heating not working', status: 'pending', date: '2024-01-08', priority: 'high' }
            ].map((request) => (
              <div key={request.id} className="p-4 border border-app-border rounded-2xl">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-text-primary">{request.issue}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'completed' ? 'bg-green-100 text-green-800' :
                    request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Submitted: {request.date}</span>
                  <span className={`font-medium ${
                    request.priority === 'high' ? 'text-red-600' :
                    request.priority === 'medium' ? 'text-orange-600' :
                    'text-green-600'
                  }`}>
                    {request.priority} priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="app-surface rounded-3xl p-8 border border-app-border">
          <h3 className="text-xl font-bold text-text-primary mb-6">Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Lease Agreement', type: 'PDF', date: '2024-01-01' },
              { name: 'Move-in Checklist', type: 'PDF', date: '2024-01-01' },
              { name: 'Property Rules', type: 'PDF', date: '2024-01-01' },
              { name: 'Emergency Contacts', type: 'PDF', date: '2024-01-01' }
            ].map((doc, index) => (
              <div key={index} className="p-4 border border-app-border rounded-2xl hover:bg-app-bg transition-colors cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <FileText size={20} className="text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{doc.name}</p>
                    <p className="text-sm text-text-secondary">{doc.type} • {doc.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TenantDashboardPage;