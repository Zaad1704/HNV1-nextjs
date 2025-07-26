import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  CreditCard, Settings, Plus, Trash2, 
  CheckCircle, XCircle, DollarSign
} from 'lucide-react';
import apiClient from '@/lib/api';

const IntegrationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const response = await apiClient.get('/integrations');
      return response.data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/integrations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    }
  });

  const availableIntegrations = [
    {
      id: 'stripe',
      name: 'Stripe',
      type: 'payment',
      description: 'Accept online payments from tenants',
      icon: <CreditCard size={24} />,
      color: 'bg-blue-500'
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      type: 'accounting',
      description: 'Sync financial data with QuickBooks',
      icon: <DollarSign size={24} />,
      color: 'bg-green-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        <span className="ml-3 text-gray-600">Loading integrations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-1">Connect third-party services to enhance functionality</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 flex items-center gap-2"
        >
          <Plus size={16} />
          Add Integration
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Integrations</h3>
        {integrations && integrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration: any) => (
              <div key={integration._id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                      integration.provider === 'stripe' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {integration.provider === 'stripe' ? <CreditCard size={20} /> : <DollarSign size={20} />}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">{integration.provider}</h4>
                      <p className="text-sm text-gray-500 capitalize">{integration.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.config.isActive ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <XCircle size={16} className="text-red-500" />
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    integration.config.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {integration.config.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Settings size={14} />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(integration._id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No integrations configured yet</p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableIntegrations.map((integration) => {
            const isConnected = integrations?.some((i: any) => i.provider === integration.id);
            return (
              <div key={integration.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${integration.color}`}>
                    {integration.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{integration.name}</h4>
                    <p className="text-sm text-gray-500 capitalize">{integration.type}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                <button
                  disabled={isConnected}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    isConnected
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isConnected ? 'Connected' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;