'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    if (!token || !user) {
      router.replace('/login');
    }
  }, [token, user, router]);
  
  if (!token || !user) {
    return <LoadingSpinner size="lg" text="Redirecting..." />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;