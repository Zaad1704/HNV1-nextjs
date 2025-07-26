'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';

const GoogleCallbackPage: React.FC = () => {
  const router = useRouter();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const userParam = urlParams.get('user');
        const error = urlParams.get('error');
        const message = urlParams.get('message');
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        
        // Debug logging
        console.log('Google Callback URL:', window.location.href);
        console.log('URL Parameters:', {
          token: token ? 'Present' : 'Missing',
          user: userParam ? 'Present' : 'Missing', 
          error,
          message,
          code: code ? 'Present' : 'Missing',
          state,
          allParams: Object.fromEntries(urlParams.entries())
        });

        if (error) {
          console.log('Google auth error received:', error, message);
          router.push(`/login?error=${error}&message=${encodeURIComponent(message || 'Google authentication failed')}`, { replace: true });
          return;
        }

        // Handle direct token/user params (if backend sends them)
        if (token && userParam) {
          try {
            const userData = JSON.parse(decodeURIComponent(userParam));
            login(token, userData);
            
            if (userData.role === 'Super Admin' || userData.role === 'Super Moderator') {
              router.push('/admin', { replace: true });
            } else {
              router.push('/dashboard', { replace: true });
            }
            return;
          } catch (parseError) {
            console.error('Failed to parse user data:', parseError);
          }
        }

        // Handle token-only response (decode user from JWT or fetch from API)
        if (token && !userParam) {
          try {
            // Try to get user data from the API using the token
            const response = await apiClient.get('/auth/me', {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success && response.data.data) {
              login(token, response.data.data);
              
              if (response.data.data.role === 'Super Admin' || response.data.data.role === 'Super Moderator') {
                router.push('/admin', { replace: true });
              } else {
                router.push('/dashboard', { replace: true });
              }
              return;
            }
          } catch (apiError: any) {
            console.error('Failed to fetch user data with token:', apiError);
            // If API call fails, try to decode JWT manually
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              const userData = {
                _id: payload.id,
                name: payload.name,
                role: payload.role,
                email: payload.email || ''
              };
              
              // Mark as Google login
              localStorage.setItem('auth-method', 'google');
              login(token, userData);
              
              if (userData.role === 'Super Admin' || userData.role === 'Super Moderator') {
                router.push('/admin', { replace: true });
              } else {
                router.push('/dashboard', { replace: true });
              }
              return;
            } catch (jwtError) {
              console.error('Failed to decode JWT:', jwtError);
            }
          }
        }

        // Handle authorization code (exchange for token)
        if (code) {
          try {
            const response = await apiClient.post('/auth/google/callback', { code });
            
            if (response.data.success && response.data.token && response.data.user) {
              login(response.data.token, response.data.user);
              
              if (response.data.user.role === 'Super Admin' || response.data.user.role === 'Super Moderator') {
                router.push('/admin', { replace: true });
              } else {
                router.push('/dashboard', { replace: true });
              }
              return;
            }
          } catch (apiError: any) {
            console.error('Google callback API error:', apiError);
            const errorMsg = apiError.response?.data?.message || 'Failed to complete Google authentication';
            
            // Check if user needs to sign up
            if (apiError.response?.status === 404 || errorMsg.includes('not found') || errorMsg.includes('user not found')) {
              router.push('/register?error=account-not-found&message=Please sign up first to use Google login', { replace: true });
              return;
            }
            
            router.push(`/login?error=auth-verification-failed&message=${encodeURIComponent(errorMsg)}`, { replace: true });
            return;
          }
        }

        // If no token, user, or code - show detailed error
        console.log('No authentication data received. URL params:', Object.fromEntries(urlParams.entries()));
        const debugInfo = `URL: ${window.location.href}, Params: ${JSON.stringify(Object.fromEntries(urlParams.entries()))}`;
        router.push(`/login?error=no-token&message=${encodeURIComponent('Authentication token not received. Debug: ' + debugInfo)}`, { replace: true });
        
      } catch (error) {
        console.error('Google callback error:', error);
        router.push('/login?error=auth-verification-failed&message=Authentication verification failed', { replace: true });
      }
    };

    handleGoogleCallback();
  }, [navigate, login]);

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Completing Google Sign-in</h2>
        <p className="text-text-secondary">Please wait while we verify your authentication...</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;