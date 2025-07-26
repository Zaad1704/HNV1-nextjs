'use client';
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wrench, Plus, Building2, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import apiClient from '@/lib/api';
import LazyLoader from '@/components/common/LazyLoader';

// Import universal components
import UniversalSectionPage from '@/components/common/UniversalSectionPage';
import UniversalFloatingActionMenu from '@/components/common/UniversalFloatingActionMenu';
import UniversalRadialActionWheel from '@/components/common/UniversalRadialActionWheel';
import UniversalGlassyCard from '@/components/common/UniversalGlassyCard';
import UniversalSearchModal from '@/components/common/UniversalSearchModal';
import UniversalAnalyticsModal from '@/components/common/UniversalAnalyticsModal';

const fetchMaintenanceRequests = async () => {
  try {
    const { data } = await apiClient.get('/maintenance');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch maintenance requests:', error);
    return [];
  }
};

const MaintenanceRequestsPageUniversal = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  
  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: ['maintenance'],
    queryFn: fetchMaintenanceRequests
  });

  const handleRequestSelect = (requestId: string, selected: boolean) => {
    if (selected) {
      setSelectedRequests(prev => [...prev, requestId]);
    } else {
      setSelectedRequests(prev => prev.filter(id => id !== requestId));
    }
  };

  // Calculate stats
  const urgentRequests = useMemo(() => {
    return requests.filter(r => r.priority === 'High' || r.priority === 'Urgent');
  }, [requests]);

  const pendingRequests = useMemo(() => {
    return requests.filter(r => r.status === 'Pending' || r.status === 'In Progress');
  }, [requests]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return CheckCircle;
      case 'Pending':
        return Clock;
      case 'In Progress':
        return Wrench;
      default:
        return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-300';
      case 'Pending':
        return 'text-yellow-300';
      case 'In Progress':
        return 'text-blue-300';
      default:
        return 'text-red-300';
    }
  };

  return (
    <>
    <UniversalSectionPage
      title="Maintenance"
      subtitle={`Track and manage maintenance requests (${requests.length} requests)`}
      icon={Wrench}
      stats={[
        { label: 'Total', value: requests.length },
        { label: 'Urgent', value: urgentRequests.length },
        { label: 'Pending', value: pendingRequests.length }
      ]}
      actionWheel={
        <UniversalRadialActionWheel
          actions={[
            { id: 'bulk', icon: Building2, label: 'Bulk Action', onClick: () => setShowBulkAction(true), angle: -60 },
            { id: 'export', icon: Download, label: 'Export Data', onClick: () => setShowExport(true), angle: 0 },
            { id: 'add', icon: Plus, label: 'Add Request', onClick: () => setShowAddModal(true), angle: 60 }
          ]}
        />
      }
      addButton={
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Add Request
        </button>
      }
      floatingActionMenu={
        <UniversalFloatingActionMenu
          sectionName="Maintenance"
          onAddItem={() => setShowAddModal(true)}
          onBulkAction={() => setShowBulkAction(true)}
          onExport={() => setShowExport(true)}
          onSearch={() => setShowSearch(true)}
          onAnalytics={() => setShowAnalytics(true)}
        />
      }
      aiInsightsData={{
        properties: requests.map(r => r.propertyId).filter(Boolean),
        tenants: requests.map(r => r.tenantId).filter(Boolean)
      }}
      smartSuggestionsData={{
        properties: requests.map(r => r.propertyId).filter(Boolean),
        tenants: requests.map(r => r.tenantId).filter(Boolean)
      }}
      isLoading={isLoading}
      error={error}
    >
      {requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((request, index) => {
            const StatusIcon = getStatusIcon(request.status);
            return (
              <LazyLoader key={request._id}>
                <UniversalGlassyCard
                  item={request}
                  index={index}
                  icon={Wrench}
                  title={request.title || `Maintenance Request #${request._id.substring(0, 8)}`}
                  subtitle={`${request.propertyId?.name || 'Unknown Property'} - ${new Date(request.createdAt).toLocaleDateString()}`}
                  status={request.status || 'Pending'}
                  stats={[
                    { 
                      label: 'Status', 
                      value: request.status || 'Pending', 
                      icon: StatusIcon,
                      color: getStatusColor(request.status)
                    },
                    { 
                      label: 'Priority', 
                      value: request.priority || 'Medium', 
                      icon: AlertTriangle,
                      color: request.priority === 'High' || request.priority === 'Urgent' ? 'text-red-300' : 'text-yellow-300'
                    },
                    { 
                      label: 'Property', 
                      value: request.propertyId?.name || 'Unknown', 
                      icon: Building2,
                      color: 'text-blue-300'
                    }
                  ]}
                  badges={[
                    { 
                      label: request.priority || 'Medium', 
                      value: '', 
                      color: request.priority === 'High' || request.priority === 'Urgent' ? 'bg-red-500' : 
                             request.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }
                  ]}
                  detailsPath={`/dashboard/maintenance-universal/${request._id}`}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  secondaryActions={[
                    { 
                      icon: CheckCircle, 
                      label: 'Complete', 
                      onClick: () => {}, 
                      color: 'bg-gradient-to-r from-green-400 to-green-500'
                    }
                  ]}
                  showCheckbox={false}
                  isSelected={selectedRequests.includes(request._id)}
                  onSelect={handleRequestSelect}
                />
              </LazyLoader>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="rounded-2xl p-12 shadow-lg max-w-lg mx-auto border-2 border-white/20" 
               style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px)'}}>
            <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-white/20"
                 style={{background: 'rgba(249, 115, 22, 0.3)'}}>
              <Wrench size={64} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-4">
              No Maintenance Requests
            </h3>
            <p className="text-gray-300 mb-10 text-lg">
              Start tracking maintenance issues by adding requests.
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium"
            >
              <Plus size={18} className="inline mr-2" />
              Add Request
            </button>
          </div>
        </div>
      )}
    </UniversalSectionPage>
    
    {/* Modals */}
    <UniversalSearchModal
      isOpen={showSearch}
      onClose={() => setShowSearch(false)}
      sectionName="Maintenance"
      onSearch={(query, filters) => {
        console.log('Search maintenance:', query, filters);
      }}
      data={requests}
    />
    
    <UniversalAnalyticsModal
      isOpen={showAnalytics}
      onClose={() => setShowAnalytics(false)}
      sectionName="Maintenance"
      data={requests}
    />
  </>
  );
};

export default MaintenanceRequestsPageUniversal;