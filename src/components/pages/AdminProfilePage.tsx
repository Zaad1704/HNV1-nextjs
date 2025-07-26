'use client';
import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Save } from 'lucide-react';

interface ProfileState {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AdminProfilePage = () => {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState<ProfileState>({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email
      };

      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage('New passwords do not match');
          setLoading(false);
          return;
        }
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const { data } = await apiClient.put('/auth/profile', updateData);
      setUser(data.data);
      setMessage('Profile updated successfully!');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 app-gradient rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Admin Profile</h1>
          <p className="text-text-secondary">Manage your admin account settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={20} className="text-brand-blue" />
            <h3 className="font-semibold text-text-primary">Account Info</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-text-secondary">Role</p>
              <p className="font-medium text-text-primary">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">User ID</p>
              <p className="font-mono text-sm text-text-primary">{user?._id}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Account Status</p>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <div className="lg:col-span-2 app-surface rounded-3xl p-6 border border-app-border">
          <h3 className="font-semibold text-text-primary mb-6">Update Profile</h3>
          
          {message && (
            <div className={`p-4 rounded-2xl mb-6 ${
              message.includes('success') 
                ? 'bg-green-50 text-green-600 border border-green-200' 
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  <User size={16} className="inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
            </div>

            <hr className="border-app-border" />

            <div>
              <h4 className="font-medium text-text-primary mb-4">Change Password (Optional)</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-gradient px-8 py-3 rounded-2xl flex items-center gap-2 font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminProfilePage;