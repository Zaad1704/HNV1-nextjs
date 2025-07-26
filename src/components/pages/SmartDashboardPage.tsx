'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brain, TrendingUp, Bot, BarChart3, DollarSign, Building2, Users, CreditCard, Wrench, RefreshCw, Plus } from 'lucide-react';
import { 
  SmartDashboard, 
  PredictiveAnalytics, 
  AutomationCenter, 
  PerformanceOptimizer 
} from '@/components/advanced';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import FinancialChart from '@/components/charts/FinancialChart';
import RentStatusChart from '@/components/charts/RentStatusChart';
import ActionItemWidget from '@/components/dashboard/ActionItemWidget';
import { useCrossData } from '@/hooks/useCrossData';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuthStore } from '@/store/authStore';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

const fetchOverviewStats = async () => {
  try {
    const { data } = await apiClient.get('/dashboard/overview-stats');
    return data.data || { totalProperties: 0, activeTenants: 0, monthlyRevenue: 0, occupancyRate: '0%' };
  } catch (error) {
    return { totalProperties: 0, activeTenants: 0, monthlyRevenue: 0, occupancyRate: '0%' };
  }
};

const fetchLateTenants = async () => {
  try {
    const { data } = await apiClient.get('/dashboard/late-tenants');
    return data.data || [];
  } catch (error) {
    return [];
  }
};

const fetchFinancialSummary = async () => {
  try {
    const { data } = await apiClient.get('/dashboard/financial-summary');
    return data.data || [];
  } catch (error) {
    return [];
  }
};

const fetchRentStatus = async () => {
  try {
    const { data } = await apiClient.get('/dashboard/rent-status');
    return data.data || [];
  } catch (error) {
    return [];
  }
};

const SmartDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'predictions' | 'automation' | 'optimizer'>('overview');
  const { stats } = useCrossData();
  const { currency } = useCurrency();
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Prevent crashes if user is not loaded yet
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }
  
  const { data: overviewStats = { totalProperties: 0, activeTenants: 0, monthlyRevenue: 0, occupancyRate: '0%' } } = useQuery({ 
    queryKey: ['overviewStats'], 
    queryFn: fetchOverviewStats,
    enabled: !!user && !!user.organizationId,
    retry: false,
    staleTime: 30000
  });
  const { data: lateTenants = [] } = useQuery({ 
    queryKey: ['lateTenants'], 
    queryFn: fetchLateTenants,
    enabled: !!user && !!user.organizationId,
    retry: false,
    staleTime: 30000
  });
  const { data: financialData = [] } = useQuery({ 
    queryKey: ['financialSummary'], 
    queryFn: fetchFinancialSummary,
    enabled: !!user && !!user.organizationId,
    retry: false,
    staleTime: 30000
  });
  const { data: rentStatusData = [] } = useQuery({ 
    queryKey: ['rentStatus'], 
    queryFn: fetchRentStatus,
    enabled: !!user && !!user.organizationId,
    retry: false,
    staleTime: 30000
  });

  const tabs = [
    { id: 'overview', label: 'Smart Dashboard', icon: Brain, component: null },
    { id: 'insights', label: 'AI Insights', icon: BarChart3, component: SmartDashboard },
    { id: 'predictions', label: 'Predictive Analytics', icon: TrendingUp, component: PredictiveAnalytics },
    { id: 'automation', label: 'Automation Center', icon: Bot, component: AutomationCenter },
    { id: 'optimizer', label: 'Performance Optimizer', icon: BarChart3, component: PerformanceOptimizer }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="space-y-8">
      <UniversalHeader
        title="Smart Dashboard"
        subtitle="Advanced AI-powered property management tools"
        icon={Brain}
        stats={[
          { label: 'Properties', value: overviewStats?.totalProperties || 0, color: 'blue' },
          { label: 'Tenants', value: overviewStats?.activeTenants || 0, color: 'green' },
          { label: 'Revenue', value: `${currency}${overviewStats?.monthlyRevenue || 0}`, color: 'purple' },
          { label: 'Occupancy', value: `${overviewStats?.occupancyRate || 0}%`, color: 'orange' }
        ]}
      />

      {/* Tab Navigation */}
      <UniversalCard gradient="blue" className="phase4-container">
        <div className="phase4-tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={20} />
              <span className="font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </UniversalCard>

      {/* Active Component */}
      {activeTab === 'overview' ? (
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                    <Building2 size={32} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {(user?.organizationId && user.organizationId.name) || `${user?.name || 'User'}'s Properties`}
                    </h1>
                    <p className="text-white opacity-80">Welcome back, {user?.name || 'User'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white bg-opacity-10 rounded-2xl p-4">
                    <p className="text-white opacity-80 text-sm">Monthly Revenue</p>
                    <p className="text-2xl font-bold">{currency}{overviewStats?.monthlyRevenue?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-2xl p-4">
                    <p className="text-white opacity-80 text-sm">Active Properties</p>
                    <p className="text-2xl font-bold">{overviewStats?.totalProperties || 0}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Occupancy Rate</span>
                  <TrendingUp size={16} className="text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{overviewStats?.occupancyRate || '0%'}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Active Tenants</span>
                  <Users size={16} className="text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{overviewStats?.activeTenants || 0}</p>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link href="/dashboard/tenants" className="bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overviewStats?.activeTenants || 0}</p>
                  <p className="text-sm text-gray-600">Active Tenants</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/properties" className="bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overviewStats?.totalProperties || 0}</p>
                  <p className="text-sm text-gray-600">Properties</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/payments" className="bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CreditCard size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overviewStats?.totalPayments || 0}</p>
                  <p className="text-sm text-gray-600">Payments</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/receipts" className="bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overviewStats?.totalReceipts || 0}</p>
                  <p className="text-sm text-gray-600">Receipts</p>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard/maintenance" className="bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wrench size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{overviewStats?.pendingMaintenance || 0}</p>
                  <p className="text-sm text-gray-600">Maintenance</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Financial Overview</h3>
              <FinancialChart data={financialData || []} />
            </div>
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Rent Status</h3>
              <RentStatusChart data={rentStatusData || []} />
            </div>
          </div>
        </div>
      ) : (
        ActiveComponent && <ActiveComponent />
      )}
    </div>
  );
};

export default SmartDashboardPage;