'use client';
import React from "react";
import { useAuthStore } from "../store/authStore";
import { Navigate } from "react-router-dom";

const FullScreenLoader = () => (
  <div className="flex items-center justify-center h-screen bg-slate-900">
    <div className="text-white text-lg">Loading Your Dashboard...</div>
  </div>
);

const DashboardRedirector = () => {
  const { user, isAuthenticated, loading } = useAuthStore();

  if (loading) return <FullScreenLoader />;
  if (isAuthenticated && !user) return <FullScreenLoader />;

  // If not authenticated or user lost, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // Role-based redirect
  switch (user.role) {
    case "Tenant":
      return <Navigate to="/dashboard/tenant" replace />;
    case "Super Admin":
    case "Super Moderator":
      return <Navigate to="/dashboard/overview" replace />;
    case "Landlord":
    case "Agent":
      return <Navigate to="/dashboard/overview" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRedirector;
