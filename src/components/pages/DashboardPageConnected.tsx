'use client';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';

const DashboardPageConnected = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getDashboardStats();
        setStats(response.data);
      } catch (err: any) {
        setError(err.message);
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.organizationId) {
      fetchDashboardStats();
    }
  }, [user]);

  if (!user) {
    return <div className="p-6">Loading user...</div>;
  }

  if (!user.organizationId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome to HNV Dashboard</h1>
        <p>No organization found. Please contact support to set up your account.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading dashboard: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const overview = stats?.overview || {};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Properties</h3>
          <p className="text-3xl font-bold text-blue-600">{overview.totalProperties || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Tenants</h3>
          <p className="text-3xl font-bold text-green-600">{overview.activeTenants || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Occupancy Rate</h3>
          <p className="text-3xl font-bold text-purple-600">{overview.occupancyRate || 0}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-orange-600">${overview.monthlyRevenue || 0}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Tenants</h3>
          {stats?.recentTenants?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentTenants.map((tenant: any) => (
                <div key={tenant._id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{tenant.firstName} {tenant.lastName}</p>
                    <p className="text-sm text-gray-500">{tenant.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tenant.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent tenants</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Alerts</h3>
          {stats?.alerts?.length > 0 ? (
            <div className="space-y-3">
              {stats.alerts.map((alert: any, index: number) => (
                <div key={index} className={`p-3 rounded-lg ${
                  alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm ${
                    alert.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No alerts</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors">
            Add Property
          </button>
          <button className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors">
            Add Tenant
          </button>
          <button className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors">
            Record Payment
          </button>
          <button className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition-colors">
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPageConnected;