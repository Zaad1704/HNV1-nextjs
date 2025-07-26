'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserPlus, Lock } from 'lucide-react';

const AcceptInvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { login } = useAuthStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const acceptInviteMutation = useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const response = await apiClient.post('/auth/accept-invite', data);
      return response.data;
    },
    onSuccess: (data) => {
      login(data.token, data.user);
      router.push('/dashboard');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to accept invitation');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token && password) {
      acceptInviteMutation.mutate({ token, password });
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
            <UserPlus size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">Join Organization</h1>
          <p className="text-text-secondary">Set your password to complete registration</p>
        </div>

        <div className="app-surface rounded-3xl p-8 border border-app-border shadow-app-lg">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-center text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Create Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-app-border bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={acceptInviteMutation.isLoading}
              className="w-full btn-gradient py-4 text-lg font-semibold rounded-2xl disabled:opacity-50"
            >
              {acceptInviteMutation.isLoading ? 'Joining...' : 'Join Organization'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AcceptInvitePage;