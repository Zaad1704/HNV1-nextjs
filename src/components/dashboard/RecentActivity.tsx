import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Users, Building, Wrench } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api';

interface ActivityItem {
  id: string;
  type: 'payment' | 'tenant' | 'property' | 'maintenance';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
}

const RecentActivity = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/recent-activity');
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment': return DollarSign;
      case 'tenant': return Users;
      case 'property': return Building;
      case 'maintenance': return Wrench;
      default: return Calendar;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-green-500';
      case 'tenant': return 'bg-blue-500';
      case 'property': return 'bg-purple-500';
      case 'maintenance': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="app-surface border border-app-border rounded-3xl p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="app-surface border border-app-border rounded-3xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 gradient-dark-orange-blue rounded-lg flex items-center justify-center">
            <Calendar size={16} className="text-white" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
        </div>
        <Link 
          to="/dashboard/audit-log" 
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {activities?.length > 0 ? (
          activities.slice(0, 5).map((activity: ActivityItem) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);
            
            return (
              <div key={activity.id} className="flex items-center gap-4 p-3 bg-app-bg rounded-xl">
                <div className={`w-10 h-10 ${colorClass} rounded-full flex items-center justify-center`}>
                  <Icon size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{activity.title}</p>
                  <p className="text-sm text-text-secondary">{activity.description}</p>
                  <p className="text-xs text-text-muted">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
                {activity.amount && (
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      ${activity.amount.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-text-secondary">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Activity will appear here as you use the system</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecentActivity;