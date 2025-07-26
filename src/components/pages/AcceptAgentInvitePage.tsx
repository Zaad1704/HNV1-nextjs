'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserCheck, Building, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '@/lib/api';

const AcceptAgentInvitePage = () => {
  const { token } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'accepted' | 'error'>('loading');
  const [inviteData, setInviteData] = useState<any>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const validateInvite = async () => {
      try {
        const response = await apiClient.get(`/api/invitations/agent/${token}`);
        if (response.data.success) {
          setInviteData(response.data.data);
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      } catch (error) {
        setStatus('invalid');
      }
    };

    if (token) {
      validateInvite();
    } else {
      setStatus('invalid');
    }
  }, [token]);

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await apiClient.post(`/api/invitations/agent/${token}/accept`, {
        password: formData.password
      });

      if (response.data.success) {
        setStatus('accepted');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 app-gradient rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-text-secondary">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={32} className="text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">Invalid Invitation</h1>
          <p className="text-text-secondary mb-8">
            This invitation link is invalid or has expired.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="btn-gradient px-8 py-3 rounded-2xl font-semibold"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">Welcome to the Team!</h1>
          <p className="text-text-secondary mb-8">
            Your agent account has been created successfully. You will be redirected to login shortly.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 app-gradient rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Join as Agent</h1>
          <p className="text-text-secondary">
            You've been invited to join <strong>{inviteData?.organizationName}</strong> as an agent.
          </p>
        </div>

        <div className="app-surface rounded-3xl p-8 border border-app-border shadow-app-lg">
          <div className="mb-6 p-4 bg-blue-50 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <Building size={20} className="text-blue-600" />
              <span className="font-semibold text-blue-900">Organization Details</span>
            </div>
            <p className="text-blue-800 text-sm">
              <strong>Organization:</strong> {inviteData?.organizationName}<br />
              <strong>Invited by:</strong> {inviteData?.inviterName}<br />
              <strong>Email:</strong> {inviteData?.email}
            </p>
          </div>

          <form onSubmit={handleAcceptInvite} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Create Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                placeholder="Enter a strong password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-gradient py-4 text-lg font-semibold rounded-2xl"
            >
              Accept Invitation & Create Account
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AcceptAgentInvitePage;