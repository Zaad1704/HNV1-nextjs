'use client';
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardErrorBoundary from '@/components/dashboard/DashboardErrorBoundary';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-app-bg">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <DashboardErrorBoundary>
      <DashboardLayout>{children}</DashboardLayout>
    </DashboardErrorBoundary>
  );
}