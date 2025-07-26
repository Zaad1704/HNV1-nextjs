import React from 'react';
import { useAuthStore } from '@/store/authStore';

const EmailVerificationWarning = () => {
  const { user } = useAuthStore();
  
  if (!user || user.isEmailVerified) {
    return null;
  }
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 m-4 rounded-lg">
      <p className="text-yellow-800">
        Please verify your email address to access all features.
      </p>
    </div>
  );
};

export default EmailVerificationWarning;