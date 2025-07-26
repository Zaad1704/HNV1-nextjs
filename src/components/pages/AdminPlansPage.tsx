'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, DollarSign } from 'lucide-react';
import apiClient from '@/lib/api';

const fetchPlans = async () => {
  const { data } = await apiClient.get('/super-admin/plans');
  return data.data || [];
};

const AdminPlansPage = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: 'monthly',
    features: [''],
    isActive: true
  });

  const predefinedFeatures = [
    'Property Management',
    'Tenant Management', 
    'Payment Tracking',
    'Maintenance Requests',
    'Financial Reports',
    'Document Storage',
    'Email Notifications',
    'Mobile App Access',
    'Multi-user Access',
    'API Access',
    'Custom Branding',
    'Priority Support'
  ];

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['adminPlans'],
    queryFn: fetchPlans
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const response = await apiClient.post('/super-admin/plans', planData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
      setShowAddModal(false);
      resetForm();
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/super-admin/plans/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
      setEditingPlan(null);
      resetForm();
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/super-admin/plans/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
    }
  });

  const togglePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.put(`/super-admin/plans/${id}/activate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlans'] });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      duration: 'monthly',
      features: [''],
      isActive: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const planData = {
      ...formData,
      price: Number(formData.price) * 100, // Convert to cents
      features: selectedFeatures
    };

    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan._id, data: planData });
    } else {
      createPlanMutation.mutate(planData);
    }
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: (plan.price / 100).toString(),
      duration: plan.duration,
      features: plan.features || [''],
      isActive: plan.isActive
    });
    setSelectedFeatures(plan.features || []);
    setShowAddModal(true);
  };

  const handleDelete = (plan: any) => {
    if (confirm(`Delete plan "${plan.name}"? This action cannot be undone.`)) {
      deletePlanMutation.mutate(plan._id);
    }
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading plans...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 lg:space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Subscription Plans</h1>
          <p className="text-sm lg:text-base text-text-secondary mt-1">Manage pricing plans</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-gradient px-4 py-2 lg:px-6 lg:py-3 rounded-2xl flex items-center gap-2 font-semibold text-sm lg:text-base"
        >
          <Plus size={16} className="lg:w-5 lg:h-5" />
          Add Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {plans.map((plan: any, index: number) => (
          <motion.div
            key={plan._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="app-surface rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-app-border"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg lg:text-xl font-bold text-text-primary">{plan.name}</h3>
              <button
                onClick={() => togglePlanMutation.mutate(plan._id)}
                className="p-1"
              >
                {plan.isActive ? (
                  <ToggleRight size={24} className="text-green-500" />
                ) : (
                  <ToggleLeft size={24} className="text-gray-400" />
                )}
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl lg:text-3xl font-bold text-text-primary">
                  ${(plan.price / 100).toFixed(0)}
                </span>
                <span className="text-sm text-text-secondary">/{plan.duration}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-text-primary mb-2 text-sm">Features:</h4>
              <ul className="space-y-1">
                {plan.features?.slice(0, 3).map((feature: string, i: number) => (
                  <li key={i} className="text-xs lg:text-sm text-text-secondary flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    {feature}
                  </li>
                ))}
                {plan.features?.length > 3 && (
                  <li className="text-xs text-text-muted">+{plan.features.length - 3} more</li>
                )}
              </ul>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(plan)}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={14} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(plan)}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <div className="app-surface rounded-2xl lg:rounded-3xl shadow-app-xl w-full max-w-md border border-app-border max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 lg:p-6 border-b border-app-border">
              <h2 className="text-lg lg:text-xl font-bold text-text-primary">
                {editingPlan ? 'Edit Plan' : 'Add Plan'}
              </h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingPlan(null);
                  resetForm();
                }}
                className="text-text-secondary hover:text-text-primary"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 lg:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Plan Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-sm lg:text-base"
                  placeholder="e.g., Professional"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                    min="0"
                    step="0.01"
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-sm lg:text-base"
                    placeholder="29.99"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Duration</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-sm lg:text-base"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">Features</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-app-border rounded-xl p-3">
                  {predefinedFeatures.map((feature) => (
                    <label key={feature} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedFeatures.includes(feature)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFeatures([...selectedFeatures, feature]);
                          } else {
                            setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
                          }
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span>{feature}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-text-muted mt-2">{selectedFeatures.length} features selected</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPlan(null);
                    resetForm();
                  }}
                  className="px-4 py-2 lg:px-6 lg:py-3 rounded-2xl border border-app-border text-text-secondary hover:text-text-primary text-sm lg:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                  className="btn-gradient px-4 py-2 lg:px-6 lg:py-3 rounded-2xl text-sm lg:text-base"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminPlansPage;