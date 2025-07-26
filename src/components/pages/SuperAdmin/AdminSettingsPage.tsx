'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, User, Lock, Bell, Shield, Save } from 'lucide-react';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

const AdminSettingsPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    notifications: {
      email: true,
      browser: true,
      security: true
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiClient.put('/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => apiClient.put('/auth/change-password', data),
    onSuccess: () => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Settings }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 app-gradient rounded-xl flex items-center justify-center">
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Admin Settings</h1>
          <p className="text-text-secondary">Manage your account and system preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="app-surface rounded-3xl p-6 border border-app-border">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeTab === tab.id
                      ? 'app-gradient text-white'
                      : 'text-text-secondary hover:bg-app-bg'
                  }`}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="app-surface rounded-3xl p-8 border border-app-border">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-6">Profile Settings</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={user?.role || 'Super Admin'}
                        disabled
                        className="w-full p-3 border border-app-border rounded-2xl bg-app-bg text-text-muted"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
                  >
                    <Save size={20} />
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-6">Security Settings</h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="btn-gradient px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold"
                  >
                    <Lock size={20} />
                    Change Password
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-app-border rounded-2xl">
                    <div>
                      <h3 className="font-semibold text-text-primary">Email Notifications</h3>
                      <p className="text-sm text-text-secondary">Receive notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, email: e.target.checked }
                      }))}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-app-border rounded-2xl">
                    <div>
                      <h3 className="font-semibold text-text-primary">Browser Notifications</h3>
                      <p className="text-sm text-text-secondary">Show desktop notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications.browser}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, browser: e.target.checked }
                      }))}
                      className="w-5 h-5"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-app-border rounded-2xl">
                    <div>
                      <h3 className="font-semibold text-text-primary">Security Alerts</h3>
                      <p className="text-sm text-text-secondary">Important security notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications.security}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, security: e.target.checked }
                      }))}
                      className="w-5 h-5"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-6">System Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border border-app-border rounded-2xl">
                    <h3 className="font-semibold text-text-primary mb-2">Account Type</h3>
                    <p className="text-text-secondary">Super Administrator</p>
                  </div>
                  <div className="p-4 border border-app-border rounded-2xl">
                    <h3 className="font-semibold text-text-primary mb-2">Last Login</h3>
                    <p className="text-text-secondary">Today</p>
                  </div>
                  <div className="p-4 border border-app-border rounded-2xl">
                    <h3 className="font-semibold text-text-primary mb-2">Session Status</h3>
                    <p className="text-green-600">Active</p>
                  </div>
                  <div className="p-4 border border-app-border rounded-2xl">
                    <h3 className="font-semibold text-text-primary mb-2">Two-Factor Auth</h3>
                    <p className="text-text-secondary">Disabled</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminSettingsPage;