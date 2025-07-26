'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import apiClient from '@/lib/api';

const GoogleAuthCallback = () => {
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const message = searchParams.get('message');

      console.log('Google Auth Callback Debug:');
      console.log('- Token:', token ? 'Present' : 'Missing');
      console.log('- Error:', error);
      console.log('- Message:', message);
      console.log('- Full URL:', window.location.href);

      if (error) {
        console.error('Google auth error:', error, message);
        setStatus('Authentication failed');
        setTimeout(() => {
          router.push(`/login?error=${error}&message=${encodeURIComponent(message || 'Google authentication failed')}`);
        }, 2000);
        return;
      }

      if (token) {
        try {
          setStatus('Verifying authentication...');
          console.log('Making API call to /auth/me...');
          
          // Get user info with the token
          const response = await apiClient.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('API Response:', response.data);
          
          if (response.data.success && response.data.data) {
            setStatus('Success! Redirecting...');
            console.log('User data:', response.data.data);
            login(token, response.data.data);
            
            // Redirect based on user role
            const userRole = response.data.data.role;
            console.log('Redirecting user with role:', userRole);
            
            if (userRole === 'Super Admin' || userRole === 'Super Moderator') {
              router.push('/admin', { replace: true });
            } else {
              router.push('/dashboard', { replace: true });
            }
          } else {
            console.error('Invalid API response:', response.data);
            throw new Error('Invalid response from server');
          }
        } catch (err: any) {
          console.error('Google auth callback error:', err);
          console.error('Error details:', err.response?.data);
          setStatus('Authentication verification failed');
          setTimeout(() => {
            router.push('/login?error=auth-verification-failed&message=Failed to verify Google authentication');
          }, 2000);
        }
      } else {
        console.error('No token found in URL parameters');
        setStatus('No authentication token received');
        setTimeout(() => {
          router.push('/login?error=no-token&message=No authentication token received from Google');
        }, 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-text-secondary">{status}</p>
        <div className="mt-6 text-sm text-text-muted">
          <p>Please wait while we complete your Google sign-in...</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;