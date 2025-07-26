import React from 'react';
import { AlertTriangle, Shield, Key, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const SettingsAlert = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Check for security recommendations
  const needsSecuritySetup = !user?.twoFactorEnabled;
  const needsProfileUpdate = !user?.phone;
  
  if (!needsSecuritySetup && !needsProfileUpdate) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-xl">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Security Recommendations
          </h3>
          <div className="text-sm text-yellow-700 mt-1 space-y-1">
            {needsSecuritySetup && (
              <p>• Enable two-factor authentication for better security</p>
            )}
            {needsProfileUpdate && (
              <p>• Add your phone number for account recovery</p>
            )}
          </div>
        </div>
        <button
          onClick={() => router.push('/settings')}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors flex items-center gap-2"
        >
          <Shield size={16} />
          Update Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsAlert;