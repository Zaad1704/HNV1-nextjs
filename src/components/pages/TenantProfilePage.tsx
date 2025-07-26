'use client';
import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, DollarSign, Edit, Save, X } from 'lucide-react';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalActionButton from '@/components/common/UniversalActionButton';
import { useCrossData } from '@/hooks/useCrossData';
import { useAuthStore } from '@/store/authStore';

const TenantProfilePage = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const { stats } = useCrossData();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const handleSave = () => {
    // Save profile changes
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      emergencyContact: '',
      emergencyPhone: ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <UniversalHeader
        title="Profile"
        subtitle="Manage your personal information"
        icon={User}
        stats={[
          { label: 'Role', value: user?.role || 'Tenant', color: 'blue' },
          { label: 'Status', value: 'Active', color: 'green' }
        ]}
        actions={
          <UniversalActionButton
            variant={isEditing ? 'secondary' : 'primary'}
            icon={isEditing ? X : Edit}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </UniversalActionButton>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture */}
        <UniversalCard gradient="blue" className="text-center">
          <div className="w-32 h-32 app-gradient rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">{user?.name}</h2>
          <p className="text-text-secondary">{user?.role}</p>
          {isEditing && (
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
              Change Photo
            </button>
          )}
        </UniversalCard>

        {/* Profile Information */}
        <UniversalCard gradient="green" className="lg:col-span-2">
          <h3 className="text-xl font-bold text-text-primary mb-6">Personal Information</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-app-bg rounded-xl">
                    <Phone size={20} className="text-text-muted" />
                    <span className="text-text-primary">{formData.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Emergency Contact
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full p-3 border border-app-border rounded-xl bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                    placeholder="Emergency contact name"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-app-bg rounded-xl">
                    <User size={20} className="text-text-muted" />
                    <span className="text-text-primary">{formData.emergencyContact || 'Not provided'}</span>
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3 pt-6 border-t border-app-border">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 rounded-xl border border-app-border text-text-secondary hover:text-text-primary hover:bg-app-bg transition-colors"
                >
                  Cancel
                </button>
                <UniversalActionButton variant="primary" icon={Save} onClick={handleSave}>
                  Save Changes
                </UniversalActionButton>
              </div>
            )}
          </div>
        </UniversalCard>
      </div>
    </div>
  );
};

export default TenantProfilePage;