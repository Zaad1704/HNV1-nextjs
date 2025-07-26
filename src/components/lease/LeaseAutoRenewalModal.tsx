import React, { useState } from 'react';
import { X, Save, Settings, RefreshCw } from 'lucide-react';
import apiClient from '@/lib/api';

interface AutoRenewalSettings {
  enabled: boolean;
  renewalPeriod: number;
  rentIncrease?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  notificationDays: number;
}

interface LeaseAutoRenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaseId: string;
  currentSettings: AutoRenewalSettings;
  tenantName: string;
}

const LeaseAutoRenewalModal: React.FC<LeaseAutoRenewalModalProps> = ({
  isOpen,
  onClose,
  leaseId,
  currentSettings,
  tenantName
}) => {
  const [settings, setSettings] = useState<AutoRenewalSettings>(currentSettings);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/advanced-lease/${leaseId}/auto-renewal`, {
        autoRenewal: settings
      });
      alert('Auto-renewal settings updated successfully!');
      onClose();
    } catch (error) {
      alert('Failed to update auto-renewal settings');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Auto-Renewal Settings</h2>
              <p className="text-sm text-gray-600">{tenantName}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Enable Auto-Renewal */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Enable Auto-Renewal</label>
              <p className="text-xs text-gray-500">Automatically renew lease when it expires</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.enabled && (
            <>
              {/* Renewal Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renewal Period (months)
                </label>
                <select
                  value={settings.renewalPeriod}
                  onChange={(e) => setSettings({ ...settings, renewalPeriod: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={6}>6 months</option>
                  <option value={12}>12 months</option>
                  <option value={24}>24 months</option>
                </select>
              </div>

              {/* Rent Increase */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rent Increase (optional)
                </label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <select
                      value={settings.rentIncrease?.type || 'percentage'}
                      onChange={(e) => setSettings({
                        ...settings,
                        rentIncrease: {
                          type: e.target.value as 'percentage' | 'fixed',
                          value: settings.rentIncrease?.value || 0
                        }
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                    <input
                      type="number"
                      value={settings.rentIncrease?.value || 0}
                      onChange={(e) => setSettings({
                        ...settings,
                        rentIncrease: {
                          type: settings.rentIncrease?.type || 'percentage',
                          value: Number(e.target.value)
                        }
                      })}
                      placeholder={settings.rentIncrease?.type === 'percentage' ? '5' : '100'}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {settings.rentIncrease?.type === 'percentage' 
                      ? `${settings.rentIncrease?.value || 0}% increase`
                      : `$${settings.rentIncrease?.value || 0} increase`
                    }
                  </p>
                </div>
              </div>

              {/* Notification Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Days Before Expiry
                </label>
                <select
                  value={settings.notificationDays}
                  onChange={(e) => setSettings({ ...settings, notificationDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaseAutoRenewalModal;