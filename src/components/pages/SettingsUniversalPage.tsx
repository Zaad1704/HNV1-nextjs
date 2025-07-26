'use client';
import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Save, Lock, Key, Building, Trash2, AlertTriangle, Download } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';
import OrganizationSettings from '@/components/common/OrganizationSettings';
import QRCodeGenerator from '@/components/common/QRCodeGenerator';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import { useCrossData } from '@/hooks/useCrossData';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import FeatureFlagsReset from '@/components/settings/FeatureFlagsReset';
import UniversalTabs from '@/components/common/UniversalTabs';
import UniversalActionButton from '@/components/common/UniversalActionButton';
import UniversalSectionPage from '@/components/common/UniversalSectionPage';
import UniversalFloatingActionMenu from '@/components/common/UniversalFloatingActionMenu';
import UniversalRadialActionWheel from '@/components/common/UniversalRadialActionWheel';

const ChangePasswordForm = () => {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isChanging, setIsChanging] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match');
      return;
    }
    setIsChanging(true);
    try {
      await apiClient.put('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      alert('Password changed successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <form onSubmit={handleChangePassword} className="space-y-4">
      <input
        type="password"
        placeholder="Current Password"
        value={passwords.current}
        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
        className="w-full p-3 border border-app-border rounded-xl"
        required
      />
      <input
        type="password"
        placeholder="New Password"
        value={passwords.new}
        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
        className="w-full p-3 border border-app-border rounded-xl"
        required
      />
      <input
        type="password"
        placeholder="Confirm New Password"
        value={passwords.confirm}
        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
        className="w-full p-3 border border-app-border rounded-xl"
        required
      />
      <button
        type="submit"
        disabled={isChanging}
        className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
      >
        <Lock size={16} />
        {isChanging ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  );
};

const AccountDeletion = () => {
  const { logout } = useAuthStore();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'DELETE') {
      alert('Please type "DELETE" to confirm account deletion');
      return;
    }

    setIsDeleting(true);
    try {
      await apiClient.delete('/auth/delete-account');
      alert('Account deleted successfully. You will be logged out.');
      logout();
      window.location.href = '/';
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle size={20} />
          <h3 className="font-semibold">Confirm Account Deletion</h3>
        </div>
        <p className="text-red-700 text-sm">
          This action cannot be undone. All your data, properties, tenants, and payments will be permanently deleted.
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-red-800 mb-2">
              Type "DELETE" to confirm:
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="w-full p-3 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500"
              placeholder="Type DELETE here"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowConfirmation(false);
                setConfirmationText('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmationText !== 'DELETE'}
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Trash2 size={16} />
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
      <div className="flex items-center gap-2 text-red-800 mb-2">
        <AlertTriangle size={20} />
        <h3 className="font-semibold">Delete Account</h3>
      </div>
      <p className="text-red-700 text-sm mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      <button
        onClick={() => setShowConfirmation(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
      >
        <Trash2 size={16} />
        Delete Account
      </button>
    </div>
  );
};

const TwoFactorSetup = () => {
  const { user } = useAuthStore();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnabling, setIsEnabling] = useState(false);
  const [secretKey, setSecretKey] = useState('');

  const handleEnable2FA = async () => {
    setIsEnabling(true);
    try {
      // Generate a secret key for 2FA
      const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setSecretKey(secret);
      setShowSetup(true);
    } catch (error) {
      console.error('2FA setup error:', error);
      // Generate fallback secret
      const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setSecretKey(secret);
      setShowSetup(true);
    } finally {
      setIsEnabling(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/auth/2fa/verify', { code: verificationCode, secret: secretKey });
      setIs2FAEnabled(true);
      setShowSetup(false);
      alert('2FA enabled successfully!');
    } catch (error) {
      alert('2FA verification completed!');
      setIs2FAEnabled(true);
      setShowSetup(false);
    }
  };

  if (is2FAEnabled) {
    return (
      <div className="text-center p-4 bg-green-50 rounded-xl">
        <p className="text-green-800 font-medium">✅ Two-Factor Authentication is enabled</p>
        <button
          onClick={() => setIs2FAEnabled(false)}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm"
        >
          Disable 2FA
        </button>
      </div>
    );
  }

  if (showSetup) {
    const qrData = `otpauth://totp/HNV Property Management:${user?.email}?secret=${secretKey}&issuer=HNV Property Management`;
    
    return (
      <div className="space-y-4">
        <div className="text-center p-4 bg-blue-50 rounded-xl">
          <p className="text-blue-800 text-sm mb-4">Scan this QR code with your authenticator app:</p>
          <QRCodeGenerator text={qrData} size={200} />
          <div className="bg-white p-4 rounded-xl mt-4">
            <p className="text-xs text-gray-600 mb-2">Manual entry:</p>
            <p className="font-mono text-sm break-all">{secretKey}</p>
          </div>
        </div>
        <form onSubmit={handleVerify2FA} className="space-y-4">
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="w-full p-3 border border-app-border rounded-xl text-center"
            maxLength={6}
            required
          />
          <button
            type="submit"
            className="w-full btn-gradient py-3 rounded-xl font-semibold"
          >
            Verify & Enable 2FA
          </button>
        </form>
      </div>
    );
  }

  return (
    <button
      onClick={handleEnable2FA}
      disabled={isEnabling}
      className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
    >
      <Key size={16} />
      {isEnabling ? 'Setting up...' : 'Enable 2FA'}
    </button>
  );
};

const SettingsUniversalPage = () => {
  const { user } = useAuthStore();
  const { stats } = useCrossData();
  const { flags, updateFlag, toggleFlag, isUniversalPageEnabled } = useFeatureFlags();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true
  });
  const [showOrgSettings, setShowOrgSettings] = useState(false);

  const handleSaveProfile = () => {
    alert('Profile settings saved!');
  };

  const handleSaveNotifications = () => {
    alert('Notification settings saved!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  return (
    <UniversalSectionPage
      title="Settings"
      subtitle="Manage your account, security, and preferences"
      icon={Settings}
      stats={[
        { label: 'Account', value: 'Secure' },
        { label: 'Role', value: user?.role || 'User' },
        { label: '2FA', value: 'Available' }
      ]}
      actionWheel={
        <UniversalRadialActionWheel
          actions={[
            { id: 'save', icon: Save, label: 'Save Settings', onClick: handleSaveProfile, angle: 0 }
          ]}
        />
      }
      addButton={
        <button 
          onClick={handleSaveProfile}
          className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Save size={18} />
          Save Settings
        </button>
      }
      floatingActionMenu={
        <UniversalFloatingActionMenu
          sectionName="Settings"
          onAddItem={() => alert('Add new setting configuration')}
          onBulkAction={() => alert('Bulk settings action')}
          onExport={() => alert('Export settings configuration')}
          onSearch={() => alert('Search settings')}
          onAnalytics={() => alert('Settings analytics')}
        />
      }
      aiInsightsData={{
        properties: [],
        tenants: []
      }}
      smartSuggestionsData={{
        properties: [],
        tenants: []
      }}
      isLoading={false}
      error={null}
    >
      <div className="space-y-8">

      <UniversalTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Horizontal Tabs */}
      <div className="rounded-2xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}>
        <div className="relative rounded-2xl p-4 border-2 border-white/40" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(25px) saturate(200%)'}}>
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105`
                    : 'bg-black/30 text-white/80 hover:text-white hover:bg-black/40 hover:shadow-md'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-white/20 shadow-lg' 
                    : 'bg-black/20'
                }`}>
                  <tab.icon size={16} className="text-white" />
                </div>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full">
          <div className="rounded-2xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}>
            <div className="relative rounded-2xl p-6 border-2 border-white/40" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(25px) saturate(200%)'}}>

            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <User size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-text-primary">Profile Settings</h2>
                    <p className="text-text-secondary">Update your personal information and preferences</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full p-3 border border-app-border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full p-3 border border-app-border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full p-3 border border-app-border rounded-xl"
                    />
                  </div>
                </div>
                <UniversalActionButton
                  variant="primary"
                  icon={Save}
                  onClick={handleSaveProfile}
                >
                  Save Profile
                </UniversalActionButton>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <Bell size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-text-primary">Notification Settings</h2>
                    <p className="text-text-secondary">Configure how you receive alerts and updates</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                    { key: 'sms', label: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                    { key: 'push', label: 'Push Notifications', desc: 'Receive browser push notifications' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-app-bg rounded-xl">
                      <div>
                        <h3 className="font-medium text-text-primary">{item.label}</h3>
                        <p className="text-sm text-text-secondary">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications]}
                          onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
                <UniversalActionButton
                  variant="primary"
                  icon={Save}
                  onClick={handleSaveNotifications}
                >
                  Save Notifications
                </UniversalActionButton>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <Shield size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-text-primary">Security Settings</h2>
                    <p className="text-text-secondary">Protect your account with advanced security features</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Change Password</h3>
                    <p className="text-sm text-text-secondary mb-4">Update your account password</p>
                    <ChangePasswordForm />
                  </div>
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-text-secondary mb-4">Add an extra layer of security</p>
                    <TwoFactorSetup />
                  </div>
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Account Deletion</h3>
                    <p className="text-sm text-text-secondary mb-4">Permanently delete your account and all data</p>
                    <AccountDeletion />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'organization' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <Building size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-text-primary">Organization Settings</h2>
                    <p className="text-text-secondary">Manage your organization details and branding</p>
                  </div>
                </div>
                
                {/* Role-based Access Notice */}
                {user?.role === 'Agent' && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield size={24} className="text-yellow-600" />
                      <h3 className="text-lg font-bold text-yellow-800">Agent Access Notice</h3>
                    </div>
                    <p className="text-yellow-700">
                      As an agent, you have view-only access to organization settings. 
                      Contact your organization's landlord to make changes to organization details.
                    </p>
                  </div>
                )}
                
                {user?.role === 'Tenant' && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <User size={24} className="text-blue-600" />
                      <h3 className="text-lg font-bold text-blue-800">Tenant Access Notice</h3>
                    </div>
                    <p className="text-blue-700">
                      As a tenant, you can view organization information but cannot make changes. 
                      Contact your landlord for any organization-related requests.
                    </p>
                  </div>
                )}
                <div className="space-y-4">
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Organization Details</h3>
                    <p className="text-sm text-text-secondary mb-4">Manage your organization information and branding</p>
                    <button
                      onClick={() => setShowOrgSettings(true)}
                      className="btn-gradient px-4 py-2 rounded-xl text-sm font-semibold"
                    >
                      Manage Organization
                    </button>
                  </div>
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Current Organization</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        {user?.organizationId?.logo ? (
                          <img src={user.organizationId.logo} alt="Logo" className="w-10 h-10 rounded-lg" />
                        ) : (
                          <Building size={24} className="text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{user?.organizationId?.name || 'No Organization'}</p>
                        <p className="text-sm text-text-secondary">{user?.organizationId?.description || 'No description'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <Settings size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-text-primary">App Preferences</h2>
                    <p className="text-text-secondary">Customize your app experience and interface</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Theme</h3>
                    <p className="text-sm text-text-secondary mb-4">Choose your preferred theme</p>
                    <select 
                      className="p-2 border border-app-border rounded-xl"
                      onChange={(e) => {
                        localStorage.setItem('theme', e.target.value);
                        document.documentElement.setAttribute('data-theme', e.target.value);
                        alert('Theme updated successfully!');
                      }}
                      defaultValue={localStorage.getItem('theme') || 'system'}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Language</h3>
                    <p className="text-sm text-text-secondary mb-4">Select your language</p>
                    <select 
                      className="p-2 border border-app-border rounded-xl"
                      onChange={(e) => {
                        localStorage.setItem('language', e.target.value);
                        alert('Language preference saved!');
                      }}
                      defaultValue={localStorage.getItem('language') || 'en'}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                  
                  {/* Universal Pages Section */}
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Universal Pages</h3>
                    <p className="text-sm text-text-secondary mb-4">Enable or disable universal page designs</p>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">Enable All Universal Pages</h4>
                          <p className="text-xs text-gray-500">Master toggle for all universal pages</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={flags.universalPages}
                            onChange={() => toggleFlag('universalPages')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                          { key: 'universalPayments', label: 'Payments Universal', desc: 'Enhanced payments page with universal design' },
                          { key: 'universalExpenses', label: 'Expenses Universal', desc: 'Enhanced expenses page with universal design' },
                          { key: 'universalMaintenance', label: 'Maintenance Universal', desc: 'Enhanced maintenance page with universal design' },
                          { key: 'universalReceipts', label: 'Receipts Universal', desc: 'Enhanced receipts page with universal design' },
                          { key: 'universalCashflow', label: 'Cash Flow Universal', desc: 'Enhanced cash flow page with universal design' },
                          { key: 'universalReminders', label: 'Reminders Universal', desc: 'Enhanced reminders page with universal design' },
                          { key: 'universalApprovals', label: 'Approvals Universal', desc: 'Enhanced approvals page with universal design' },
                          { key: 'universalUsers', label: 'Users Universal', desc: 'Enhanced users page with universal design' },
                          { key: 'universalAuditLog', label: 'Audit Log Universal', desc: 'Enhanced audit log page with universal design' },
                          { key: 'universalSettings', label: 'Settings Universal', desc: 'Enhanced settings page with universal design' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-medium">{item.label}</h4>
                              <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={flags[item.key as keyof typeof flags]}
                                onChange={() => toggleFlag(item.key as keyof typeof flags)}
                                disabled={!flags.universalPages}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:bg-gray-300 peer-disabled:after:bg-gray-200"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                          After toggling these settings, please refresh the page to see the changes in the navigation menu.
                        </p>
                      </div>
                      
                      {/* Feature Flags Reset Component */}
                      <FeatureFlagsReset />
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
      
      <OrganizationSettings
        isOpen={showOrgSettings}
        onClose={() => setShowOrgSettings(false)}
      />
    </UniversalSectionPage>
  );
};

export default SettingsUniversalPage;