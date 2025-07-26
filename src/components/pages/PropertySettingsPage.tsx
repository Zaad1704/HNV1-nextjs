'use client';
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Settings, Save, Archive, AlertTriangle } from 'lucide-react';
import apiClient from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const PropertySettingsPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    autoRentReminders: true,
    reminderDaysBefore: 5,
    lateFeeDays: 5,
    lateFeeAmount: 50,
    allowOnlinePayments: true,
    requireLeaseDocuments: true,
    autoArchiveAfterDays: 365,
    notificationPreferences: {
      email: true,
      sms: false,
      push: true
    }
  });

  // Fetch property details
  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/properties/${propertyId}`);
      return data.data;
    },
    enabled: !!propertyId
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!confirm(`Are you sure you want to archive ${property?.name}? This will hide it from active listings but preserve all data.`)) {
      return;
    }

    try {
      await apiClient.put(`/properties/${propertyId}`, { status: 'Archived' });
      alert('Property archived successfully!');
      window.location.href = '/dashboard/properties';
    } catch (error) {
      alert('Failed to archive property');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!property) {
    return (
      <div className="min-h-screen relative flex items-center justify-center" style={{background: 'linear-gradient(to right, #FFDAB9, #ADD8E6)'}}>
        <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-2xl p-8 shadow-2xl text-center" style={{backdropFilter: 'blur(20px) saturate(180%)'}}>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Property not found</h2>
          <Link to="/dashboard/properties" className="text-blue-600 hover:text-blue-800">
            ← Back to Properties
          </Link>
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

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to={`/dashboard/properties/${propertyId}`}
              className="p-3 rounded-xl backdrop-blur-xl bg-white/10 border-2 border-white/20 text-white hover:bg-white/20 transition-all"
              style={{backdropFilter: 'blur(20px) saturate(180%)'}}
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">Property Settings</h1>
              <p className="text-gray-700">{property.name}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-blue-500 text-white rounded-xl hover:shadow-xl transition-all disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <div className="space-y-8">
          {/* Rent & Payment Settings */}
          <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-3xl p-6 shadow-2xl" style={{backdropFilter: 'blur(20px) saturate(180%)'}}>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Settings size={20} />
              Rent & Payment Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-800">Auto Rent Reminders</label>
                  <p className="text-sm text-gray-700">Automatically send rent reminders to tenants</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoRentReminders}
                    onChange={(e) => setSettings({ ...settings, autoRentReminders: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Reminder Days Before Due
                  </label>
                  <input
                    type="number"
                    value={settings.reminderDaysBefore}
                    onChange={(e) => setSettings({ ...settings, reminderDaysBefore: Number(e.target.value) })}
                    className="w-full px-3 py-2 backdrop-blur-xl bg-white/20 border-2 border-white/30 rounded-lg text-gray-800 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    style={{backdropFilter: 'blur(20px) saturate(180%)'}}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Late Fee Days
                  </label>
                  <input
                    type="number"
                    value={settings.lateFeeDays}
                    onChange={(e) => setSettings({ ...settings, lateFeeDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 backdrop-blur-xl bg-white/20 border-2 border-white/30 rounded-lg text-gray-800 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    style={{backdropFilter: 'blur(20px) saturate(180%)'}}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Late Fee Amount ($)
                </label>
                <input
                  type="number"
                  value={settings.lateFeeAmount}
                  onChange={(e) => setSettings({ ...settings, lateFeeAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 backdrop-blur-xl bg-white/20 border-2 border-white/30 rounded-lg text-gray-800 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                  style={{backdropFilter: 'blur(20px) saturate(180%)'}}
                />
              </div>
            </div>
          </div>

          {/* Tenant Management Settings */}
          <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-3xl p-6 shadow-2xl" style={{backdropFilter: 'blur(20px) saturate(180%)'}}>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Tenant Management</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-text-primary">Allow Online Payments</label>
                  <p className="text-sm text-text-secondary">Enable tenants to pay rent online</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowOnlinePayments}
                    onChange={(e) => setSettings({ ...settings, allowOnlinePayments: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-text-primary">Require Lease Documents</label>
                  <p className="text-sm text-text-secondary">Require signed lease documents for new tenants</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireLeaseDocuments}
                    onChange={(e) => setSettings({ ...settings, requireLeaseDocuments: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-3xl p-6 shadow-2xl" style={{backdropFilter: 'blur(20px) saturate(180%)'}}>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Notification Preferences</h2>
            <div className="space-y-4">
              {Object.entries(settings.notificationPreferences).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="font-medium text-text-primary capitalize">{key} Notifications</label>
                    <p className="text-sm text-text-secondary">Receive notifications via {key}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setSettings({
                        ...settings,
                        notificationPreferences: {
                          ...settings.notificationPreferences,
                          [key]: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="backdrop-blur-xl bg-red-500/10 border-2 border-red-300/30 rounded-3xl p-6 shadow-2xl" style={{backdropFilter: 'blur(20px) saturate(180%)'}}>
            <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} />
              Danger Zone
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-red-800">Archive Property</h3>
                <p className="text-sm text-red-700 mb-3">
                  Archive this property to hide it from active listings. All data will be preserved and can be restored later.
                </p>
                <button
                  onClick={handleArchive}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Archive size={16} />
                  Archive Property
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySettingsPage;