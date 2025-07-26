'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';
import RoleSelector from '@/components/auth/RoleSelector';
import { Chrome, Mail, Lock, User, UserCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Landlord',
    organizationCode: '',
    isIndependentAgent: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [googleOAuthEnabled, setGoogleOAuthEnabled] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  // Check if Google OAuth is enabled
  useEffect(() => {
    const checkGoogleOAuth = async () => {
      try {
        const response = await apiClient.get('/auth/google/status');
        setGoogleOAuthEnabled(response.data.googleOAuthEnabled);
      } catch (err) {
        console.warn('Could not check Google OAuth status:', err);
        setGoogleOAuthEnabled(false);
      }
    };
    checkGoogleOAuth();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role) {
      setError('Please select your role to continue');
      return;
    }
    
    if (formData.role === 'Tenant' && !formData.organizationCode) {
      setError('Organization code is required for tenant signup');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        organizationCode: formData.organizationCode || undefined
      };
      
      // For landlords, create organization
      if (formData.role === 'Landlord') {
        registrationData.createOrganization = {
          name: `${formData.name}'s Properties`,
          type: 'property_management'
        };
      }
      
      const response = await apiClient.post('/auth/register', registrationData);

      setSuccess(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    if (!googleOAuthEnabled) {
      setError('Google signup is currently unavailable. Please use email and password.');
      return;
    }
    
    if (!formData.role) {
      setError('Please select your role before continuing with Google signup');
      return;
    }
    
    if (formData.role === 'Tenant' && !formData.organizationCode) {
      setError('Organization code is required for tenant signup');
      return;
    }
    
    const baseURL = apiClient.defaults.baseURL;
    const params = new URLSearchParams({
      signup: 'true',
      role: formData.role,
      ...(formData.organizationCode && { organizationCode: formData.organizationCode }),
      ...(formData.isIndependentAgent && { isIndependentAgent: 'true' })
    });
    window.location.href = `${baseURL}/auth/google?${params.toString()}`;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
            <UserCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-4">{t('auth.check_email')}</h1>
          <p className="text-text-secondary mb-8">
            {t('auth.verification_sent')}
          </p>
          <Link href="/login" className="btn-gradient px-8 py-3 rounded-2xl inline-flex items-center gap-2">
            {t('auth.go_to_login')} <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
            <UserCheck size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">{t('auth.create_account')}</h1>
          <p className="text-text-secondary">{t('auth.join_thousands')}</p>
        </div>

        <div className="app-surface rounded-3xl p-8 border border-app-border shadow-app-lg">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-center text-sm mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Role Selection - First Step */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-text-primary mb-2">Choose Your Account Type</h2>
              <p className="text-text-secondary text-sm">Select the option that best describes your role. This determines your access level and features.</p>
            </div>
            
            <RoleSelector
              selectedRole={formData.role}
              onRoleChange={(role) => setFormData({ ...formData, role })}
            />
            
            {(formData.role === 'Tenant' || formData.role === 'Agent') && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Organization Code {formData.role === 'Tenant' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name="organizationCode"
                  value={formData.organizationCode}
                  onChange={handleChange}
                  required={formData.role === 'Tenant'}
                  className="w-full p-3 border border-app-border rounded-2xl bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                  placeholder={formData.role === 'Tenant' ? 'Enter organization code' : 'Enter organization code (optional)'}
                />
                {formData.role === 'Tenant' && (
                  <p className="text-xs text-text-secondary mt-1">Get this code from your landlord or property manager</p>
                )}
              </div>
            )}

            {formData.role === 'Agent' && !formData.organizationCode && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mt-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isIndependentAgent"
                    checked={formData.isIndependentAgent}
                    onChange={handleChange}
                    className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue"
                  />
                  <div>
                    <span className="text-sm font-medium text-yellow-800">I am an independent agent</span>
                    <p className="text-xs text-yellow-700 mt-1">
                      I manage properties from multiple landlords and want to create my own organization
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="border-t border-app-border pt-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Account Information</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">{t('auth.full_name')}</label>
              <div className="relative">
                <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-app-border bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                  placeholder={t('auth.enter_full_name')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">{t('auth.email_address')}</label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-app-border bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                  placeholder={t('auth.enter_email')}
                />
              </div>
            </div>



            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">{t('auth.password')}</label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-app-border bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                  placeholder={t('auth.create_password')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">{t('auth.confirm_password')}</label>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-app-border bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                  placeholder={t('auth.confirm_password')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-4 text-lg font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>{t('auth.create_account')} <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          {/* Google Signup Section - Only show if enabled */}
          {googleOAuthEnabled && (
            <>
              <div className="relative flex items-center justify-center my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-app-border"></div>
                </div>
                <div className="relative bg-app-surface px-4">
                  <span className="text-text-muted text-sm font-medium">{t('auth.or')}</span>
                </div>
              </div>

              <button
                onClick={handleGoogleSignup}
                className="w-full flex justify-center items-center gap-3 py-4 border border-app-border rounded-2xl font-semibold text-text-primary bg-app-surface hover:bg-app-bg transition-all duration-300 hover:shadow-app"
              >
                <Chrome size={20} />
                {t('auth.continue_google')}
              </button>
            </>
          )}

          <div className="mt-8 text-center">
            <p className="text-text-secondary">
              {t('auth.have_account')}{' '}
              <Link href="/login" className="font-semibold text-brand-blue hover:text-brand-blue/80 transition-colors">
                {t('auth.sign_in')}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;