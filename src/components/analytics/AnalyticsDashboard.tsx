import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, 
  AlertTriangle, Calendar, RefreshCw
} from 'lucide-react';
import apiClient from '@/lib/api';

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6months');

  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['analyticsDashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/dashboard');
      return response.data.data;
    },
    refetchInterval: 5 * 60 * 1000
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { currentMonth, topProperties, highRiskTenants } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Collection Analytics</h1>
          <p className="text-gray-600 mt-1">Performance insights and trends</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Collection Rate"
          value={`${currentMonth?.performance?.collectionRate?.toFixed(1) || 0}%`}
          change={currentMonth?.performance?.trends?.collectionRateChange || 0}
          icon={<TrendingUp size={24} />}
          color="blue"
        />
        <MetricCard
          title="Total Collected"
          value={`$${currentMonth?.performance?.totalCollected?.toLocaleString() || 0}`}
          change={5.2}
          icon={<DollarSign size={24} />}
          color="green"
        />
        <MetricCard
          title="Outstanding"
          value={`$${currentMonth?.performance?.totalOutstanding?.toLocaleString() || 0}`}
          change={currentMonth?.performance?.trends?.outstandingChange || 0}
          icon={<AlertTriangle size={24} />}
          color="red"
        />
        <MetricCard
          title="Avg Days to Collect"
          value={`${currentMonth?.performance?.averageDaysToCollect?.toFixed(1) || 0}`}
          change={currentMonth?.performance?.trends?.averageDaysChange || 0}
          icon={<Calendar size={24} />}
          color="purple"
        />
      </div>

      {/* Property Performance & Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Properties</h3>
          <div className="space-y-4">
            {topProperties?.slice(0, 5).map((property: any) => (
              <div key={property.propertyId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{property.name}</p>
                  <p className="text-sm text-gray-500">{property.tenantCount} tenants</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{property.collectionRate?.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">${property.collected?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">High Risk Tenants</h3>
          <div className="space-y-4">
            {highRiskTenants?.slice(0, 5).map((tenant: any) => (
              <div key={tenant.tenantId} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{tenant.name}</p>
                  <p className="text-sm text-gray-500">{tenant.property}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">{tenant.latePaymentRate?.toFixed(1)}%</p>
                  <p className="text-sm text-gray-500">{tenant.averageDaysLate?.toFixed(0)} days avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center gap-1 mt-1">
            {change >= 0 ? (
              <TrendingUp size={14} className="text-green-500" />
            ) : (
              <TrendingDown size={14} className="text-red-500" />
            )}
            <span className={`text-xs font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;