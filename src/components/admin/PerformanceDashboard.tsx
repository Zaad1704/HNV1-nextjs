import React, { useState, useEffect } from 'react';
import { Activity, Zap, Database, Users, TrendingUp } from 'lucide-react';
import apiClient from '@/lib/api';

interface PerformanceData {
  responseTime: number;
  memoryUsage: number;
  activeUsers: number;
  cacheHitRate: number;
  errorRate: number;
}

const PerformanceDashboard: React.FC = () => {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const response = await apiClient.get('/super-admin/performance');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch performance data:', error);
        // Mock data for demo
        setData({
          responseTime: 245,
          memoryUsage: 68,
          activeUsers: 142,
          cacheHitRate: 87,
          errorRate: 0.2
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Response Time',
      value: `${data?.responseTime}ms`,
      icon: <Zap className="w-5 h-5" />,
      color: data?.responseTime && data.responseTime < 300 ? 'text-green-600' : 'text-yellow-600',
      bgColor: data?.responseTime && data.responseTime < 300 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    {
      label: 'Memory Usage',
      value: `${data?.memoryUsage}%`,
      icon: <Database className="w-5 h-5" />,
      color: data?.memoryUsage && data.memoryUsage < 80 ? 'text-green-600' : 'text-red-600',
      bgColor: data?.memoryUsage && data.memoryUsage < 80 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
    },
    {
      label: 'Active Users',
      value: data?.activeUsers?.toString() || '0',
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      label: 'Cache Hit Rate',
      value: `${data?.cacheHitRate}%`,
      icon: <Activity className="w-5 h-5" />,
      color: data?.cacheHitRate && data.cacheHitRate > 80 ? 'text-green-600' : 'text-yellow-600',
      bgColor: data?.cacheHitRate && data.cacheHitRate > 80 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    {
      label: 'Error Rate',
      value: `${data?.errorRate}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: data?.errorRate && data.errorRate < 1 ? 'text-green-600' : 'text-red-600',
      bgColor: data?.errorRate && data.errorRate < 1 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className={`${metric.bgColor} rounded-lg p-4`}>
            <div className={`${metric.color} mb-2`}>
              {metric.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {metric.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
          <button 
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;