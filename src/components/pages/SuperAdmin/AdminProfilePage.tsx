'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Edit, Save, X, Key, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

const AdminProfilePage = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const { data: emailStatus } = useQuery({
    queryKey: ['emailServiceStatus'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.post('/contact/test-email');
        return { status: 'running', message: 'Email service is operational' };
      } catch (error) {
        return { status: 'error', message: 'Email service unavailable' };
      }
    },
    refetchInterval: 60000,
    retry: false
  });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = () => {
    // Save profile changes
    setIsEditing(false);
    setShowPasswordChange(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
    setShowPasswordChange(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Admin Profile</h1>
          <p className="text-text-secondary mt-1">Manage your administrator account</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 flex items-center gap-2"
          >
            <Key size={16} />
            Change Password
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
          >
            {isEditing ? <X size={20} /> : <Edit size={20} />}
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture */}
        <div className="app-surface rounded-3xl p-8 border border-app-border text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">{user?.name}</h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield size={16} className="text-purple-600" />
            <p className="text-purple-600 font-semibold">{user?.role}</p>
          </div>
          
          {/* Email Service Status */}
          <div className="flex items-center justify-center gap-2 mb-4 p-2 rounded-lg bg-app-bg">
            {emailStatus?.status === 'running' ? (
              <CheckCircle size={16} className="text-green-500" />
            ) : (
              <XCircle size={16} className="text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              emailStatus?.status === 'running' ? 'text-green-600' : 'text-red-600'
            }`}>
              Email Service: {emailStatus?.status === 'running' ? 'Running' : 'Offline'}
            </span>
          </div>
          {isEditing && (
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
              Change Photo
            </button>
          )}
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-8">
          <div className="app-surface rounded-3xl p-8 border border-app-border">
            <h3 className="text-xl font-bold text-text-primary mb-6">Account Information</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-app-bg rounded-xl">
                    <User size={20} className="text-text-muted" />
                    <span className="text-text-primary">{formData.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-app-bg rounded-xl">
                    <Mail size={20} className="text-text-muted" />
                    <span className="text-text-primary">{formData.email}</span>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-6 border-t border-app-border">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 rounded-xl border border-app-border text-text-secondary hover:text-text-primary hover:bg-app-bg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-gradient px-6 py-3 rounded-xl flex items-center gap-2 font-semibold"
                  >
                    <Save size={20} />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Password Change Section */}
          {showPasswordChange && (
            <div className="app-surface rounded-3xl p-8 border border-app-border">
              <h3 className="text-xl font-bold text-text-primary mb-6">Change Password</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-app-border">
                  <button
                    onClick={() => setShowPasswordChange(false)}
                    className="px-6 py-3 rounded-xl border border-app-border text-text-secondary hover:text-text-primary hover:bg-app-bg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition-colors"
                  >
                    <Key size={20} />
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminProfilePage;