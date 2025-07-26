'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building, 
  CreditCard, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  Activity,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import PlatformGrowthChart from '@/components/admin/charts/PlatformGrowthChart';
import PlanDistributionChart from '@/components/admin/charts/PlanDistributionChart';

const fetchAdminStats = async () => {
  const { data } = await apiClient.get('/super-admin/dashboard-stats');
  return data.data;
};

const fetchPlatformGrowth = async () => {
  const { data } = await apiClient.get('/super-admin/platform-growth');
  return data.data;
};

const fetchPlanDistribution = async () => {
  const { data } = await apiClient.get('/super-admin/plan-distribution');
  return data.data;
};

const StatCard = ({ 
  title, 
  value, 
  icon, 
  delay = 0,
  color = 'app-gradient'
}: { 
  title: string;
  value: number | string;
  icon: React.ReactNode;
  delay?: number;
  color?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="app-surface rounded-3xl p-8 border border-app-border hover:shadow-app-lg transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-text-secondary text-sm font-medium mb-2">{title}</p>
        <p className="text-4xl font-bold text-text-primary">{value}</p>
      </div>
      <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center text-white`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

const AdminDashboardPage = () => {
  const { data: stats, isLoading, error: statsError } = useQuery({
    queryKey: ['adminStats'],
    queryFn: fetchAdminStats,
    retry: 3,
    retryDelay: 1000
  });

  const { data: growthData, error: growthError } = useQuery({
    queryKey: ['platformGrowth'],
    queryFn: fetchPlatformGrowth,
    retry: 3,
    retryDelay: 1000
  });

  const { data: planData, error: planError } = useQuery({
    queryKey: ['planDistribution'],
    queryFn: fetchPlanDistribution,
    retry: 3,
    retryDelay: 1000
  });

  const { data: systemStatus } = useQuery({
    queryKey: ['systemStatus'],
    queryFn: async () => {
      const status = { api: 'offline', database: 'offline', email: 'offline' };
      
      // Test API
      try {
        await apiClient.get('/public/stats');
        status.api = 'operational';
      } catch (error) {
        status.api = 'offline';
      }
      
      // Test Database
      try {
        await apiClient.get('/super-admin/dashboard-stats');
        status.database = 'operational';
      } catch (error) {
        status.database = 'offline';
      }
      
      // Test Email - check if service is configured
      try {
        const response = await apiClient.get('/super-admin/email-status');
        status.email = response.data.data?.configured ? 'operational' : 'offline';
      } catch (error) {
        status.email = 'offline';
      }
      
      return status;
    },
    refetchInterval: 30000,
    retry: false
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading admin dashboard...</span>
      </div>
    );
  }

  // Don't show error for individual chart failures, show with fallback data
  const hasAnyData = stats || growthData || planData;
  
  if (!hasAnyData && (statsError || growthError || planError)) {
    return (
      <div className="text-center p-4 lg:p-8">
        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="lg:w-8 lg:h-8 text-red-600" />
        </div>
        <h2 className="text-lg lg:text-xl font-bold text-text-primary mb-2">Dashboard Unavailable</h2>
        <p className="text-sm lg:text-base text-text-secondary mb-4">Unable to load dashboard data. Please try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-gradient px-4 py-2 lg:px-6 lg:py-3 rounded-2xl font-semibold text-sm lg:text-base"
        >
          Refresh Dashboard
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Admin Header */}
      <div className="app-gradient rounded-2xl lg:rounded-3xl p-4 lg:p-8 text-white">
        <div className="flex items-center gap-3 lg:gap-4 mb-4">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center">
            <Shield size={24} className="lg:w-8 lg:h-8" />
          </div>
          <div>
            <h1 className="text-xl lg:text-3xl font-bold">Super Admin Dashboard</h1>
            <p className="text-sm lg:text-base text-white/80">Platform overview and management</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <StatCard
          delay={0.1}
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          icon={<Users size={24} />}
        />
        <StatCard
          delay={0.2}
          title="Organizations"
          value={stats?.totalOrgs?.toLocaleString() || '0'}
          icon={<Building size={24} />}
          color="bg-blue-500"
        />
        <StatCard
          delay={0.3}
          title="Active Subscriptions"
          value={stats?.activeSubscriptions?.toLocaleString() || '0'}
          icon={<CreditCard size={24} />}
          color="bg-green-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="app-surface rounded-3xl p-8 border border-app-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 app-gradient rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Platform Growth</h2>
          </div>
          <PlatformGrowthChart data={growthData || []} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="app-surface rounded-3xl p-8 border border-app-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <BarChart3 size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Plan Distribution</h2>
          </div>
          <PlanDistributionChart data={planData || []} />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="app-surface rounded-3xl p-8 border border-app-border"
      >
        <h2 className="text-xl font-bold text-text-primary mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
          {[
            { title: 'Manage Organizations', icon: Building, href: '/admin/organizations' },
            { title: 'User Management', icon: Users, href: '/admin/users' },
            { title: 'Billing Overview', icon: CreditCard, href: '/admin/billing' },
            { title: 'Site Settings', icon: Activity, href: '/admin/site-editor' }
          ].map((action, index) => (
            <Link
              key={action.title}
              to={action.href}
              className="flex flex-col items-center p-6 bg-app-bg rounded-2xl hover:bg-app-surface hover:shadow-app transition-all duration-300 group"
            >
              <div className="w-12 h-12 app-gradient rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <action.icon size={20} className="text-white" />
              </div>
              <span className="text-sm font-medium text-text-primary text-center">
                {action.title}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="app-surface rounded-3xl p-8 border border-app-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
            <Activity size={20} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">System Status</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              systemStatus?.api === 'operational' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <p className="text-sm font-medium text-text-primary">API Status</p>
            <p className="text-xs text-text-secondary">
              {systemStatus?.api === 'operational' ? 'Operational' : 'Offline'}
            </p>
          </div>
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              systemStatus?.database === 'operational' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <p className="text-sm font-medium text-text-primary">Database</p>
            <p className="text-xs text-text-secondary">
              {systemStatus?.database === 'operational' ? 'Operational' : 'Offline'}
            </p>
          </div>
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
              systemStatus?.email === 'operational' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <p className="text-sm font-medium text-text-primary">Email Service</p>
            <p className="text-xs text-text-secondary">
              {systemStatus?.email === 'operational' ? 'Operational' : 'Offline'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboardPage;