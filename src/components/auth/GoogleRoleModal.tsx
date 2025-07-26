import React, { useState } from 'react';
import { X } from 'lucide-react';
import RoleSelector from './RoleSelector';
import apiClient from '@/lib/api';

interface GoogleRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSignup?: boolean;
}

const GoogleRoleModal: React.FC<GoogleRoleModalProps> = ({ isOpen, onClose, isSignup = true }) => {
  const [selectedRole, setSelectedRole] = useState('');

  const handleGoogleAuth = () => {
    if (!selectedRole) {
      return;
    }
    const baseURL = apiClient.defaults.baseURL;
    window.location.href = `${baseURL}/auth/google?signup=true&role=${selectedRole}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-app-surface rounded-2xl w-full max-w-md border border-app-border shadow-app-lg">
        <div className="p-6 border-b border-app-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">
            Choose Your Role
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <p className="text-blue-800 text-sm font-medium mb-2">⚠️ Role Selection Required</p>
            <p className="text-blue-700 text-sm">
              Please select your role to continue with Google signup. This cannot be changed later.
            </p>
          </div>
          
          <RoleSelector
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            className="mb-6"
          />
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-app-border rounded-xl hover:bg-app-bg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGoogleAuth}
              disabled={!selectedRole}
              className="flex-1 px-4 py-3 btn-gradient rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleRoleModal;