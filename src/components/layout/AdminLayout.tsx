'use client';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import AdminSidebar from '@/components/admin/AdminSidebar';
import MobileBottomNav from './MobileBottomNav';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <div className="bg-app-bg h-screen flex items-center justify-center text-text-primary">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-app-bg">
      {/* Admin Sidebar - Hidden on mobile, flex on md and up */}
      <aside className="hidden md:flex w-64 flex-shrink-0 app-surface border-r border-app-border">
        <AdminSidebar />
      </aside>
      
      <main className="flex-1 flex flex-col bg-app-bg">
        <header className="h-20 app-surface/95 backdrop-blur-md border-b border-app-border flex-shrink-0 flex items-center justify-end px-4 sm:px-8 shadow-app">
            <div className="text-right">
                <p className="font-semibold text-text-primary">{user.name}</p>
                <p className="text-sm text-text-secondary">{user.role}</p>
            </div>
        </header>
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto pb-24 md:pb-8">
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default AdminLayout;
