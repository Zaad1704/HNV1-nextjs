'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';

import { Chrome, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleOAuthEnabled, setGoogleOAuthEnabled] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();
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

  // Check for URL parameters (error messages and success)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    const messageParam = urlParams.get('message');
    const tokenParam = urlParams.get('token');
    const userParam = urlParams.get('user');
    
    // Handle successful Google authentication
    if (tokenParam && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        login(tokenParam, userData);
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.pathname);
        
        // Redirect based on user role
        if (userData.role === 'Super Admin' || userData.role === 'Super Moderator') {
          router.replace('/admin');
        } else {
          router.replace('/dashboard');
        }
        return;
      } catch (parseError) {
        console.error('Failed to parse user data:', parseError);
        setError('Authentication successful but failed to process user data. Please try logging in again.');
      }
    }
    
    // Handle authentication errors
    if (errorParam) {
      let errorMessage = 'An error occurred';
      
      switch (errorParam) {
        case 'google-auth-failed':
          errorMessage = messageParam || 'Google authentication failed. Please try again.';
          break;
        case 'auth-verification-failed':
          errorMessage = messageParam || 'Failed to verify Google authentication. Please try again.';
          break;
        case 'no-token':
          errorMessage = messageParam || 'Authentication token not received. Please try again.';
          break;
        case 'invalid-token':
          errorMessage = messageParam || 'Invalid authentication token. Please try again.';
          break;
        case 'state-mismatch':
          errorMessage = 'Security validation failed. Please try again.';
          break;
        case 'google-profile-error':
          errorMessage = 'Failed to retrieve Google profile. Please try again.';
          break;
        default:
          errorMessage = messageParam || 'Google authentication failed. Please try again.';
      }
      
      setError(errorMessage);
      setLoading(false);
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.pathname);
    }
  }, [login, router]);

  const handleLogin = async (e: React.FormEvent, retryCount = 0) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Client-side validation
    if (!email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    if (!password.trim()) {
      setError('Password is required');
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    try {
      const response = await apiClient.post('/auth/login', { 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (response.data.success && response.data.token && response.data.user) {
        login(response.data.token, response.data.user);
        // Add success feedback
        setError('');
        
        // Redirect based on user role
        if (response.data.user.role === 'Super Admin' || response.data.user.role === 'Super Moderator') {
          router.replace('/admin');
        } else {
          router.replace('/dashboard');
        }
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle specific error codes
      const errorCode = err.response?.data?.code;
      const errorMessage = err.response?.data?.message;
      const status = err.response?.status;
      
      switch (errorCode) {
        case 'MISSING_CREDENTIALS':
          setError('Please provide both email and password.');
          break;
        case 'INVALID_CREDENTIALS':
          setError('Invalid email or password. Please check your credentials.');
          break;
        case 'ACCOUNT_SUSPENDED':
          setError('Your account has been suspended. Please contact support.');
          break;
        case 'EMAIL_NOT_VERIFIED':
          setError('Please verify your email address before logging in.');
          break;
        case 'SERVER_ERROR':
          setError('Server error. Please try again in a moment.');
          break;
        case 'OAUTH_NOT_CONFIGURED':
          setError('Google login is temporarily unavailable. Please use email/password.');
          break;
        default:
          // Enhanced retry logic
          if (err.code === 'ECONNABORTED' || 
              err.message?.includes('timeout') || 
              status >= 500 ||
              err.code === 'ERR_NETWORK' ||
              !navigator.onLine) {
            if (retryCount < 3) {
              setError(`Connection issue... Retrying (${retryCount + 1}/4)`);
              setTimeout(() => {
                handleLogin(e, retryCount + 1);
              }, Math.min(2000 * Math.pow(2, retryCount), 10000)); // Exponential backoff
              return;
            } else {
              setError('Unable to connect to server. Please check your internet connection and try again.');
            }
          } else if (status === 429) {
            setError('Too many login attempts. Please wait a few minutes and try again.');
          } else {
            setError(errorMessage || 'Login failed. Please try again.');
          }
      }
    } finally {
      if (retryCount === 0) setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await apiClient.post('/auth/resend-verification', { email });
      setError('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    }
  };

  const handleGoogleLogin = () => {
    if (!googleOAuthEnabled) {
      setError('Google login is currently unavailable. Please use email and password.');
      return;
    }
    
    try {
      const baseURL = apiClient.defaults.baseURL;
      setError('');
      setLoading(true);
      
      // Add state parameter for security
      const state = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('google_auth_state', state);
      
      // Use the callback URL that matches our route
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const googleAuthUrl = `${baseURL}/auth/google?state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      console.log('Initiating Google login:', {
        baseURL,
        redirectUri,
        state,
        fullUrl: googleAuthUrl
      });
      
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('Google login error:', error);
      setError('Failed to initiate Google login. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 app-gradient rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6">
            <Lock size={24} className="text-white md:hidden" />
            <Lock size={32} className="text-white hidden md:block" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-text-primary mb-2">
            {t('auth.welcome_back')}
          </h1>
          <p className="text-sm md:text-base text-text-secondary">
            {t('auth.sign_in_subtitle')}
          </p>
        </div>

        {/* Login Form */}
        <div className="app-surface rounded-2xl md:rounded-3xl p-6 md:p-8 border border-app-border shadow-app-lg">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`px-4 py-3 rounded-2xl text-center text-sm mb-6 ${
                error.includes('Retrying') 
                  ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}
              role="alert"
              aria-live="polite"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('auth.email_address')}
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" />
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border border-app-border bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                  placeholder={t('auth.enter_email')}
                  aria-describedby="email-error"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-text-secondary">
                  {t('auth.password')}
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-brand-blue hover:text-brand-blue/80 font-medium"
                >
                  {t('auth.forgot_password')}
                </Link>
              </div>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-app-border bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all"
                  placeholder={t('auth.enter_password')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient py-3 md:py-4 text-base md:text-lg font-semibold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t('auth.sign_in')}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Google Login Section - Only show if enabled */}
          {googleOAuthEnabled && (
            <>
              {/* Divider */}
              <div className="relative flex items-center justify-center my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-app-border"></div>
                </div>
                <div className="relative bg-app-surface px-4">
                  <span className="text-text-muted text-sm font-medium">{t('auth.or')}</span>
                </div>
              </div>

              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex justify-center items-center gap-3 py-3 md:py-4 border border-app-border rounded-2xl font-semibold text-text-primary bg-app-surface hover:bg-app-bg transition-all duration-300 hover:shadow-app touch-target"
              >
                <Chrome size={20} />
                {t('auth.continue_google')}
              </button>
            </>
          )}

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-text-secondary">
              {t('auth.no_account')}{' '}
              <Link 
                to="/register" 
                className="font-semibold text-brand-blue hover:text-brand-blue/80 transition-colors"
              >
                {t('auth.sign_up')}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default LoginPage;