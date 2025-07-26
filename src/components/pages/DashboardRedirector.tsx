'use client';
import React from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

const FullScreenLoader = () => (
  <div className="flex items-center justify-center h-screen bg-slate-900">
    <div className="text-white text-lg">Loading Your Dashboard...</div>
  </div>
);

const DashboardRedirector = () => {
  const { user, isAuthenticated, loading } = useAuthStore();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Role-based redirect
    switch (user.role) {
      case "Tenant":
        router.push('/dashboard/tenant');
        break;
      case "Super Admin":
      case "Super Moderator":
        router.push('/dashboard/overview');
        break;
      case "Landlord":
      case "Agent":
        router.push('/dashboard/overview');
        break;
      default:
        router.push('/login');
    }
  }, [user, loading, router]);

  return <FullScreenLoader />;
};

export default DashboardRedirector;
