import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { Wrench, AlertCircle } from 'lucide-react';
import Link from 'next/link';

type MaintenanceStatus = 'Open' | 'In Progress' | 'Completed' | 'Closed' | 'Cancelled' | 'Urgent';

interface MaintenanceRequest {
  _id: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  propertyId: {
    name: string;
  };
  tenantId: {
    name: string;
  };
  createdAt: string;
}

const fetchMaintenanceRequests = async (): Promise<MaintenanceRequest[]> => {
  try {
    const { data } = await apiClient.get('/api/maintenance-requests?limit=5');
    return data.success ? (data.data || []) : [];
  } catch (error) {
    console.error('Failed to fetch maintenance requests:', error);
    return [];
  }
};

const MaintenanceWidget = () => {
  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['maintenanceRequests'],
    queryFn: fetchMaintenanceRequests,
    retry: 1,
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case 'Open':
      case 'Urgent':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'Urgent' || priority === 'High') {
      return <AlertCircle size={16} className="text-red-500" />;
    }
    return <Wrench size={16} className="text-text-muted" />;
  };

  if (isLoading) {
    return (
      <div className="app-surface rounded-3xl p-6 border border-app-border">
        <div className="flex items-center gap-3 mb-4">
          <Wrench size={20} className="text-brand-blue" />
          <h3 className="font-semibold text-text-primary">Recent Maintenance</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-app-bg rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app-surface rounded-3xl p-6 border border-app-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Wrench size={20} className="text-brand-blue" />
          <h3 className="font-semibold text-text-primary">Recent Maintenance</h3>
        </div>
        <Link 
          to="/dashboard/maintenance"
          className="text-brand-blue hover:text-brand-blue/80 text-sm font-medium"
        >
          View All
        </Link>
      </div>

      {requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request._id} className="flex items-center justify-between p-4 bg-app-bg rounded-2xl">
              <div className="flex items-start gap-3 flex-1">
                {getPriorityIcon(request.priority)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary text-sm truncate">
                    {request.title}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {request.propertyId?.name || 'Unknown Property'} • {request.tenantId?.name || 'Unknown Tenant'}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                {request.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Wrench size={32} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-secondary text-sm">No maintenance requests</p>
        </div>
      )}
    </div>
  );
};

export default MaintenanceWidget;