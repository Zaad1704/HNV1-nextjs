'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuthStore();
  const router = useRouter();
  
  useEffect(() => {
    if (!token || !user) {
      router.replace('/login');
      return;
    }
    
    if (!['Super Admin', 'Super Moderator'].includes(user.role)) {
      router.replace('/dashboard');
      return;
    }
  }, [token, user, router]);
  
  if (!token || !user || !['Super Admin', 'Super Moderator'].includes(user.role)) {
    return <div>Loading...</div>;
  }
  
  return <>{children}</>;
};

export default AdminRoute;