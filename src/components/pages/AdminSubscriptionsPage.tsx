'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CreditCard, Users, Calendar, DollarSign, Edit, Check, X } from 'lucide-react';
import apiClient from '@/lib/api';

const AdminSubscriptionsPage = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['adminSubscriptions'],
    queryFn: async () => {
      const { data } = await apiClient.get('/subscription/admin/all');
      return data.data || [];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data } = await apiClient.put(`/subscription/admin/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptions'] });
      setEditingId(null);
      setEditData({});
    }
  });

  const handleEdit = (subscription: any) => {
    setEditingId(subscription._id);
    setEditData({
      status: subscription.status,
      currentPeriodEndsAt: subscription.currentPeriodEndsAt?.split('T')[0] || '',
      amount: subscription.amount / 100
    });
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        updates: {
          ...editData,
          amount: editData.amount * 100,
          currentPeriodEndsAt: editData.currentPeriodEndsAt ? new Date(editData.currentPeriodEndsAt) : null
        }
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trialing': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'canceled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading subscriptions...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Subscription Management</h1>
          <p className="text-text-secondary mt-1">Manage all user subscriptions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold">
                {subscriptions?.filter((s: any) => s.status === 'active').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Trialing</p>
              <p className="text-2xl font-bold">
                {subscriptions?.filter((s: any) => s.status === 'trialing').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <X size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold">
                {subscriptions?.filter((s: any) => s.status === 'expired').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">
                ${subscriptions?.reduce((sum: number, s: any) => sum + (s.amount || 0), 0) / 100 || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscriptions?.map((subscription: any) => (
                <tr key={subscription._id}>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{subscription.organizationId?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{subscription._id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{subscription.planId?.name || 'Unknown Plan'}</p>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === subscription._id ? (
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        className="border rounded px-2 py-1"
                      >
                        <option value="trialing">Trialing</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {subscription.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === subscription._id ? (
                      <input
                        type="number"
                        value={editData.amount}
                        onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
                        className="border rounded px-2 py-1 w-20"
                      />
                    ) : (
                      <p>${(subscription.amount / 100).toFixed(2)}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === subscription._id ? (
                      <input
                        type="date"
                        value={editData.currentPeriodEndsAt}
                        onChange={(e) => setEditData({ ...editData, currentPeriodEndsAt: e.target.value })}
                        className="border rounded px-2 py-1"
                      />
                    ) : (
                      <p className="text-sm">
                        {subscription.currentPeriodEndsAt 
                          ? new Date(subscription.currentPeriodEndsAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === subscription._id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(subscription)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSubscriptionsPage;