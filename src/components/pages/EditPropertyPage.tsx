'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import apiClient from '@/lib/api';

const EditPropertyPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    numberOfUnits: 1,
    status: 'Active',
    description: ''
  });

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/properties/${propertyId}`);
      return data.data;
    },
    enabled: !!propertyId
  });

  // Update form data when property is loaded
  React.useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || '',
        address: {
          street: property.address?.street || '',
          city: property.address?.city || '',
          state: property.address?.state || '',
          zipCode: property.address?.zipCode || ''
        },
        numberOfUnits: property.numberOfUnits || 1,
        status: property.status || 'Active',
        description: property.description || ''
      });
    }
  }, [property]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.put(`/properties/${propertyId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      alert('Property updated successfully!');
      router.push(`/dashboard/properties/${propertyId}`);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to update property');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center" style={{background: 'linear-gradient(to right, #FFDAB9, #ADD8E6)'}}>
        <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl flex items-center" style={{backdropFilter: 'blur(20px) saturate(180%)'}}>
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full animate-pulse"></div>
          <span className="ml-3 text-gray-700">Loading property...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{background: 'linear-gradient(to right, #FFDAB9, #ADD8E6)'}}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{backgroundColor: '#FFDAB9', opacity: 0.3}}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{backgroundColor: '#ADD8E6', opacity: 0.3}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-2000" style={{backgroundColor: '#D4C4D2', opacity: 0.2}}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Link
            to={`/dashboard/properties/${propertyId}`}
            className="p-3 rounded-xl backdrop-blur-xl bg-white/10 border-2 border-white/20 text-white hover:bg-white/20 transition-all"
            style={{backdropFilter: 'blur(20px) saturate(180%)'}}
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">Edit Property</h1>
            <p className="text-gray-700">Update property information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-3xl p-8 shadow-2xl space-y-6" style={{backdropFilter: 'blur(20px) saturate(180%)'}}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Property Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 backdrop-blur-xl bg-white/20 border-2 border-white/30 rounded-xl text-gray-800 placeholder-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              style={{backdropFilter: 'blur(20px) saturate(180%)'}}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Number of Units *
            </label>
            <input
              type="number"
              min="1"
              value={formData.numberOfUnits}
              onChange={(e) => setFormData({ ...formData, numberOfUnits: parseInt(e.target.value) })}
              className="w-full p-3 backdrop-blur-xl bg-white/20 border-2 border-white/30 rounded-xl text-gray-800 placeholder-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              style={{backdropFilter: 'blur(20px) saturate(180%)'}}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Street Address *
            </label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, street: e.target.value }
              })}
              className="w-full p-3 backdrop-blur-xl bg-white/20 border-2 border-white/30 rounded-xl text-gray-800 placeholder-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              style={{backdropFilter: 'blur(20px) saturate(180%)'}}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              City *
            </label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, city: e.target.value }
              })}
              className="w-full p-3 backdrop-blur-xl bg-white/20 border-2 border-white/30 rounded-xl text-gray-800 placeholder-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              style={{backdropFilter: 'blur(20px) saturate(180%)'}}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              State *
            </label>
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, state: e.target.value }
              })}
              className="w-full p-3 backdrop-blur-xl bg-white/20 border-2 border-white/30 rounded-xl text-gray-800 placeholder-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              style={{backdropFilter: 'blur(20px) saturate(180%)'}}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              ZIP Code *
            </label>
            <input
              type="text"
              value={formData.address.zipCode}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, zipCode: e.target.value }
              })}
              className="w-full p-3 backdrop-blur-xl bg-white/20 border-2 border-white/30 rounded-xl text-gray-800 placeholder-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
              style={{backdropFilter: 'blur(20px) saturate(180%)'}}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full p-3 backdrop-blur-xl bg-white/20 border-2 border-white/30 rounded-xl text-gray-800 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            style={{backdropFilter: 'blur(20px) saturate(180%)'}}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Under Renovation">Under Renovation</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full p-3 backdrop-blur-xl bg-white/20 border-2 border-white/30 rounded-xl text-gray-800 placeholder-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            style={{backdropFilter: 'blur(20px) saturate(180%)'}}
            placeholder="Property description..."
          />
        </div>

        <div className="flex justify-end gap-4">
          <Link
            to={`/dashboard/properties/${propertyId}`}
            className="px-6 py-3 backdrop-blur-xl bg-white/20 border-2 border-white/30 rounded-xl font-medium text-gray-700 hover:bg-white/30 transition-all"
            style={{backdropFilter: 'blur(20px) saturate(180%)'}}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isLoading}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-blue-500 text-white rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 hover:shadow-xl transition-all"
          >
            <Save size={20} />
            {updateMutation.isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default EditPropertyPage;