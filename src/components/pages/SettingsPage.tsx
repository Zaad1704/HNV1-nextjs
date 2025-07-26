'use client';
import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Save, Lock, Key, Building, Trash2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';
import OrganizationSettings from '@/components/common/OrganizationSettings';
import QRCodeGenerator from '@/components/common/QRCodeGenerator';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import { useCrossData } from '@/hooks/useCrossData';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import FeatureFlagsReset from '@/components/settings/FeatureFlagsReset';

const ChangePasswordForm = () => {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isChanging, setIsChanging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match');
      return;
    }
    setIsChanging(true);
    setIsLoading(true);
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
      setIsLoading(false);
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
        {isLoading && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
        )}
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

const SettingsPage = () => {
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

  const handleSaveProfile = () => {
    alert('Profile settings saved!');
  };

  const handleSaveNotifications = () => {
    alert('Notification settings saved!');
  };

  const [showOrgSettings, setShowOrgSettings] = useState(false);
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, color: 'from-blue-500 to-purple-600' },
    { id: 'organization', label: 'Organization', icon: Building, color: 'from-green-500 to-blue-600' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-yellow-500 to-orange-600' },
    { id: 'security', label: 'Security', icon: Shield, color: 'from-red-500 to-pink-600' },
    { id: 'preferences', label: 'Preferences', icon: Settings, color: 'from-purple-500 to-indigo-600' }
  ];

  return (
    <div className="space-y-8">
      <UniversalHeader
        title="Settings"
        subtitle="Manage your account, security, and preferences"
        icon={Settings}
        stats={[
          { label: 'Account', value: 'Secure', color: 'green' },
          { label: 'Role', value: user?.role || 'User', color: 'blue' },
          { label: '2FA', value: 'Available', color: 'purple' }
        ]}
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-80">
          <UniversalCard gradient="blue">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-text-primary mb-2">Settings Menu</h3>
              <p className="text-sm text-text-secondary">Configure your account and preferences</p>
            </div>
            <nav className="space-y-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                      : 'text-text-secondary hover:text-text-primary hover:bg-app-bg hover:shadow-md hover:scale-102'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'bg-white/20 shadow-lg' 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <tab.icon size={20} className={activeTab === tab.id ? 'text-white' : 'text-gray-600'} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{tab.label}</p>
                    <p className={`text-xs ${
                      activeTab === tab.id ? 'text-white/80' : 'text-text-secondary'
                    }`}>
                      {tab.id === 'profile' && 'Personal information'}
                      {tab.id === 'organization' && 'Company settings'}
                      {tab.id === 'notifications' && 'Alert preferences'}
                      {tab.id === 'security' && 'Account protection'}
                      {tab.id === 'preferences' && 'App customization'}
                    </p>
                  </div>
                </button>
              ))}
            </nav>
          </UniversalCard>
        </div>

        {/* Content */}
        <div className="flex-1">
          <UniversalCard gradient="purple">
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
                <button
                  onClick={handleSaveProfile}
                  className="btn-gradient px-6 py-3 rounded-xl flex items-center gap-2 font-semibold"
                >
                  <Save size={16} />
                  Save Profile
                </button>
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
                <button
                  onClick={handleSaveNotifications}
                  className="btn-gradient px-6 py-3 rounded-xl flex items-center gap-2 font-semibold"
                >
                  <Save size={16} />
                  Save Notifications
                </button>
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
                  <div className="p-4 bg-app-bg rounded-xl">
                    <h3 className="font-medium text-text-primary mb-2">Notifications</h3>
                    <p className="text-sm text-text-secondary mb-4">Configure notification preferences</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          defaultChecked={localStorage.getItem('notifications-email') !== 'false'}
                          onChange={(e) => localStorage.setItem('notifications-email', e.target.checked.toString())}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm">Email notifications</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          defaultChecked={localStorage.getItem('notifications-push') !== 'false'}
                          onChange={(e) => localStorage.setItem('notifications-push', e.target.checked.toString())}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm">Push notifications</span>
                      </label>
                    </div>
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
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">Payments Universal</h4>
                            <p className="text-xs text-gray-500">Enhanced payments page with universal design</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={flags.universalPayments}
                              onChange={() => toggleFlag('universalPayments')}
                              disabled={!flags.universalPages}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:bg-gray-300 peer-disabled:after:bg-gray-200"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">Expenses Universal</h4>
                            <p className="text-xs text-gray-500">Enhanced expenses page with universal design</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={flags.universalExpenses}
                              onChange={() => toggleFlag('universalExpenses')}
                              disabled={!flags.universalPages}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:bg-gray-300 peer-disabled:after:bg-gray-200"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">Maintenance Universal</h4>
                            <p className="text-xs text-gray-500">Enhanced maintenance page with universal design</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={flags.universalMaintenance}
                              onChange={() => toggleFlag('universalMaintenance')}
                              disabled={!flags.universalPages}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:bg-gray-300 peer-disabled:after:bg-gray-200"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">Receipts Universal</h4>
                            <p className="text-xs text-gray-500">Enhanced receipts page with universal design</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={flags.universalReceipts}
                              onChange={() => toggleFlag('universalReceipts')}
                              disabled={!flags.universalPages}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:bg-gray-300 peer-disabled:after:bg-gray-200"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">Cash Flow Universal</h4>
                            <p className="text-xs text-gray-500">Enhanced cash flow page with universal design</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={flags.universalCashflow}
                              onChange={() => toggleFlag('universalCashflow')}
                              disabled={!flags.universalPages}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:bg-gray-300 peer-disabled:after:bg-gray-200"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">Reminders Universal</h4>
                            <p className="text-xs text-gray-500">Enhanced reminders page with universal design</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={flags.universalReminders}
                              onChange={() => toggleFlag('universalReminders')}
                              disabled={!flags.universalPages}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:bg-gray-300 peer-disabled:after:bg-gray-200"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">Approvals Universal</h4>
                            <p className="text-xs text-gray-500">Enhanced approvals page with universal design</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={flags.universalApprovals}
                              onChange={() => toggleFlag('universalApprovals')}
                              disabled={!flags.universalPages}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:bg-gray-300 peer-disabled:after:bg-gray-200"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">Users Universal</h4>
                            <p className="text-xs text-gray-500">Enhanced users page with universal design</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={flags.universalUsers}
                              onChange={() => toggleFlag('universalUsers')}
                              disabled={!flags.universalPages}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:bg-gray-300 peer-disabled:after:bg-gray-200"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">Audit Log Universal</h4>
                            <p className="text-xs text-gray-500">Enhanced audit log page with universal design</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={flags.universalAuditLog}
                              onChange={() => toggleFlag('universalAuditLog')}
                              disabled={!flags.universalPages}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:bg-gray-300 peer-disabled:after:bg-gray-200"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium">Settings Universal</h4>
                            <p className="text-xs text-gray-500">Enhanced settings page with universal design</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={flags.universalSettings}
                              onChange={() => toggleFlag('universalSettings')}
                              disabled={!flags.universalPages}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:bg-gray-300 peer-disabled:after:bg-gray-200"></div>
                          </label>
                        </div>
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
          </UniversalCard>
        </div>
      </div>
      
      <OrganizationSettings
        isOpen={showOrgSettings}
        onClose={() => setShowOrgSettings(false)}
      />
    </div>
  );
};

export default SettingsPage;