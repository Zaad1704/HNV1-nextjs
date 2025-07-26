import React from 'react';
import { redirect } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const AdminRoute: React.FC = () => {
  const { token, user } = useAuthStore();
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!['Super Admin', 'Super Moderator'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

export default AdminRoute;