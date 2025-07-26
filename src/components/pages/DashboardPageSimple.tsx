'use client';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import UniversalPagesLinks from '@/components/common/UniversalPagesLinks';

const DashboardPageSimple = () => {
  const { user } = useAuthStore();
  
  console.log('Simple Dashboard rendering with user:', user);
  
  if (!user) {
    return <div>Loading user...</div>;
  }
  
  if (!user.organizationId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to HNV Dashboard</h1>
        <p>No organization found. Please contact support to set up your account.</p>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Properties</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Tenants</h3>
          <p className="text-2xl font-bold">0</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Revenue</h3>
          <p className="text-2xl font-bold">$0</p>
        </div>
      </div>
      
      {/* Universal Pages Links */}
      <UniversalPagesLinks />
    </div>
  );
};

export default DashboardPageSimple;