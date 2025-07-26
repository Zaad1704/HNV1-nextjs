import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { Shield, Smartphone, Key } from 'lucide-react';

const TwoFactorSetup = () => {
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'setup' | 'verify'>('setup');

  const { data: secretData, refetch } = useQuery({
    queryKey: ['twoFactorSecret'],
    queryFn: async () => {
      const response = await apiClient.post('/auth/2fa/generate');
      return response.data.data;
    },
    enabled: false
  });

  const enableMutation = useMutation({
    mutationFn: (token: string) => apiClient.post('/auth/2fa/enable', { token }),
    onSuccess: () => {
      alert('Two-factor authentication enabled successfully!');
      setStep('setup');
    },
    onError: () => alert('Invalid token. Please try again.')
  });

  const handleSetup = () => {
    refetch();
    setStep('verify');
  };

  const handleVerify = () => {
    if (token.length === 6) {
      enableMutation.mutate(token);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Add an extra layer of security to your account</p>
      </div>

      {step === 'setup' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Step 1</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Install an authenticator app</p>
            </div>
          </div>
          <button
            onClick={handleSetup}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate QR Code
          </button>
        </div>
      )}

      {step === 'verify' && secretData && (
        <div className="space-y-4">
          <div className="text-center">
            <img src={secretData.qrCode} alt="QR Code" className="mx-auto mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Scan this QR code with your authenticator app
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter 6-digit code
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-2xl tracking-widest"
              placeholder="000000"
            />
          </div>
          <button
            onClick={handleVerify}
            disabled={token.length !== 6 || enableMutation.isLoading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {enableMutation.isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Key className="w-5 h-5" />
            )}
            Enable 2FA
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;