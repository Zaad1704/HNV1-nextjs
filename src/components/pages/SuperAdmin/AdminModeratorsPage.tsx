'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { motion } from 'framer-motion';
import { Users, Plus, Shield, Mail, Calendar } from 'lucide-react';

const fetchModerators = async () => {
  const { data } = await apiClient.get('/super-admin/moderators');
  return data.data;
};

const AdminModeratorsPage = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingModerator, setEditingModerator] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const addModeratorMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/super-admin/moderators', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderators'] });
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '' });
    }
  });

  const editModeratorMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/super-admin/moderators/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderators'] });
      setShowEditModal(false);
      setEditingModerator(null);
    }
  });

  const removeModeratorMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/super-admin/moderators/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderators'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addModeratorMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingModerator) {
      editModeratorMutation.mutate({
        id: editingModerator._id,
        data: {
          name: editingModerator.name,
          email: editingModerator.email,
          status: editingModerator.status
        }
      });
    }
  };

  const handleEditModerator = (moderator: any) => {
    setEditingModerator(moderator);
    setShowEditModal(true);
  };

  const handleRemoveModerator = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      removeModeratorMutation.mutate(id);
    }
  };

  const { data: moderators, isLoading } = useQuery({
    queryKey: ['moderators'],
    queryFn: fetchModerators
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading moderators...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Moderators</h1>
          <p className="text-text-secondary mt-1">Manage platform moderators</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Add Moderator
        </button>
      </div>

      {moderators && moderators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moderators.map((moderator: any, index: number) => (
            <motion.div
              key={moderator._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="app-surface rounded-3xl p-6 border border-app-border hover:shadow-app-lg transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 app-gradient rounded-full flex items-center justify-center text-white font-semibold">
                  {moderator.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{moderator.name}</h3>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {moderator.role}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Mail size={14} />
                  <span>{moderator.email}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Calendar size={14} />
                  <span>Joined: {new Date(moderator.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <Shield size={14} />
                  <span>Status: {moderator.status === 'active' ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => handleEditModerator(moderator)}
                  className="flex-1 bg-app-bg hover:bg-app-border text-text-primary py-2 px-4 rounded-xl text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleRemoveModerator(moderator._id, moderator.name)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-4 rounded-xl text-sm font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users size={48} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">No Moderators Yet</h3>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Add moderators to help manage the platform.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-gradient px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Add First Moderator
          </button>
        </motion.div>
      )}

      {/* Edit Moderator Modal */}
      {showEditModal && editingModerator && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <div className="app-surface rounded-3xl shadow-app-xl w-full max-w-md border border-app-border">
            <div className="flex justify-between items-center p-6 border-b border-app-border">
              <h2 className="text-xl font-bold text-text-primary">Edit Moderator</h2>
              <button onClick={() => setShowEditModal(false)} className="text-text-secondary hover:text-text-primary">
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Name</label>
                <input
                  type="text"
                  value={editingModerator.name}
                  onChange={(e) => setEditingModerator({...editingModerator, name: e.target.value})}
                  required
                  className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                <input
                  type="email"
                  value={editingModerator.email}
                  onChange={(e) => setEditingModerator({...editingModerator, email: e.target.value})}
                  required
                  className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
                <select
                  value={editingModerator.status}
                  onChange={(e) => setEditingModerator({...editingModerator, status: e.target.value})}
                  className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 rounded-2xl border border-app-border text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editModeratorMutation.isPending}
                  className="btn-gradient px-6 py-3 rounded-2xl"
                >
                  {editModeratorMutation.isPending ? 'Updating...' : 'Update Moderator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Moderator Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <div className="app-surface rounded-3xl shadow-app-xl w-full max-w-md border border-app-border">
            <div className="flex justify-between items-center p-6 border-b border-app-border">
              <h2 className="text-xl font-bold text-text-primary">Add Moderator</h2>
              <button onClick={() => setShowAddModal(false)} className="text-text-secondary hover:text-text-primary">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 rounded-2xl border border-app-border text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addModeratorMutation.isPending}
                  className="btn-gradient px-6 py-3 rounded-2xl"
                >
                  {addModeratorMutation.isPending ? 'Adding...' : 'Add Moderator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminModeratorsPage;