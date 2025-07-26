import React, { useState } from 'react';
import { X, User, Shield, Building2, UserCheck, UserX, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose, user }) => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Agent',
    status: user?.status || 'active',
    assignedProperties: user?.assignedProperties || []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await apiClient.get('/properties');
      return data.data || [];
    },
    enabled: isOpen && formData.role === 'Agent'
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await apiClient.put(`/users/${user._id}`, userData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      alert('User updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update user');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const updateData = {
        ...formData,
        managedProperties: formData.role === 'Agent' ? formData.assignedProperties : []
      };
      
      await updateUserMutation.mutateAsync(updateData);
    } catch (error) {
      console.error('Update user error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePropertyToggle = (propertyId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedProperties: prev.assignedProperties.includes(propertyId)
        ? prev.assignedProperties.filter((id: string) => id !== propertyId)
        : [...prev.assignedProperties, propertyId]
    }));
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-dark-orange-blue rounded-2xl flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Manage User</h3>
              <p className="text-gray-600">Update user details and permissions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                required
                disabled
              />
            </div>
          </div>

          {/* Role and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value, assignedProperties: [] })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                required
              >
                <option value="Agent">Agent</option>
                <option value="Landlord">Landlord</option>
                <option value="Tenant">Tenant</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Property Assignment for Agents */}
          {formData.role === 'Agent' && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 size={20} className="text-brand-blue" />
                Property Assignment
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Select properties this agent will manage. Agents can only access data from assigned properties.
              </p>
              
              {properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-4">
                  {properties.map((property: any) => (
                    <label key={property._id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.assignedProperties.includes(property._id)}
                        onChange={() => handlePropertyToggle(property._id)}
                        className="w-4 h-4 text-brand-blue rounded focus:ring-brand-blue"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{property.name}</p>
                        <p className="text-sm text-gray-600">{property.address?.formattedAddress || 'No address'}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <Building2 size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">No properties available for assignment</p>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong> {formData.assignedProperties.length} properties
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Agent will only see tenants, payments, and data from assigned properties
                </p>
              </div>
            </div>
          )}

          {/* Role Permissions Info */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Shield size={16} />
              Role Permissions
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              {formData.role === 'Landlord' && (
                <>
                  <p>• Full access to all properties, tenants, and payments</p>
                  <p>• Can approve agent requests and manage users</p>
                  <p>• Access to all financial reports and analytics</p>
                </>
              )}
              {formData.role === 'Agent' && (
                <>
                  <p>• Access limited to assigned properties only</p>
                  <p>• Can manage tenants and record payments</p>
                  <p>• Requires approval for property edits and deletions</p>
                  <p>• Can submit maintenance requests and expenses</p>
                </>
              )}
              {formData.role === 'Tenant' && (
                <>
                  <p>• Access to personal tenant portal only</p>
                  <p>• Can view payment history and submit maintenance requests</p>
                  <p>• Access to lease documents and property information</p>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 btn-gradient text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50 font-bold flex items-center gap-2"
            >
              <Save size={16} />
              {isSubmitting ? 'Updating User...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementModal;