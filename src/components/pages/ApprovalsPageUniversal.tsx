'use client';
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckSquare, Plus, Calendar, User, Download, Building2, Clock, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '@/lib/api';
import LazyLoader from '@/components/common/LazyLoader';

// Import universal components
import UniversalSectionPage from '@/components/common/UniversalSectionPage';
import UniversalFloatingActionMenu from '@/components/common/UniversalFloatingActionMenu';
import UniversalRadialActionWheel from '@/components/common/UniversalRadialActionWheel';
import UniversalGlassyCard from '@/components/common/UniversalGlassyCard';
import UniversalSearchModal from '@/components/common/UniversalSearchModal';
import UniversalAnalyticsModal from '@/components/common/UniversalAnalyticsModal';

const fetchApprovals = async () => {
  try {
    const { data } = await apiClient.get('/approvals');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch approvals:', error);
    return [];
  }
};

const ApprovalsPageUniversal = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([]);
  
  const { data: approvals = [], isLoading, error } = useQuery({
    queryKey: ['approvals'],
    queryFn: fetchApprovals
  });

  const handleApprovalSelect = (approvalId: string, selected: boolean) => {
    if (selected) {
      setSelectedApprovals(prev => [...prev, approvalId]);
    } else {
      setSelectedApprovals(prev => prev.filter(id => id !== approvalId));
    }
  };

  // Calculate stats
  const pendingApprovals = useMemo(() => {
    return approvals.filter((a: any) => a.status === 'Pending');
  }, [approvals]);

  const approvedCount = useMemo(() => {
    return approvals.filter((a: any) => a.status === 'Approved').length;
  }, [approvals]);

  const rejectedCount = useMemo(() => {
    return approvals.filter((a: any) => a.status === 'Rejected').length;
  }, [approvals]);

  const handleApprove = async (approvalId: string) => {
    try {
      await apiClient.put(`/approvals/${approvalId}`, { status: 'Approved' });
      // Refetch approvals
      // You would typically use queryClient.invalidateQueries(['approvals']) here
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleReject = async (approvalId: string) => {
    try {
      await apiClient.put(`/approvals/${approvalId}`, { status: 'Rejected' });
      // Refetch approvals
      // You would typically use queryClient.invalidateQueries(['approvals']) here
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  return (
    <>
    <UniversalSectionPage
      title="Approvals"
      subtitle={`Manage approval requests (${approvals.length} requests)`}
      icon={CheckSquare}
      stats={[
        { label: 'Total', value: approvals.length },
        { label: 'Pending', value: pendingApprovals.length },
        { label: 'Approved', value: approvedCount }
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
          sectionName="Approval"
          onAddItem={() => setShowAddModal(true)}
          onBulkAction={() => setShowBulkAction(true)}
          onExport={() => setShowExport(true)}
          onSearch={() => setShowSearch(true)}
          onAnalytics={() => setShowAnalytics(true)}
        />
      }
      aiInsightsData={{
        properties: approvals.map((a: any) => a.propertyId).filter(Boolean),
        tenants: approvals.map((a: any) => a.tenantId).filter(Boolean)
      }}
      smartSuggestionsData={{
        properties: approvals.map((a: any) => a.propertyId).filter(Boolean),
        tenants: approvals.map((a: any) => a.tenantId).filter(Boolean)
      }}
      isLoading={isLoading}
      error={error}
    >
      {approvals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {approvals.map((approval: any, index: number) => {
            const isPending = approval.status === 'Pending';
            const isApproved = approval.status === 'Approved';
            const isRejected = approval.status === 'Rejected';
            
            const getStatusIcon = () => {
              if (isApproved) return CheckCircle;
              if (isRejected) return XCircle;
              return Clock;
            };
            
            const StatusIcon = getStatusIcon();
            
            return (
              <LazyLoader key={approval._id}>
                <UniversalGlassyCard
                  item={approval}
                  index={index}
                  icon={CheckSquare}
                  title={approval.title || `Approval Request #${approval._id.substring(0, 8)}`}
                  subtitle={`${approval.description || 'No description'}`}
                  status={approval.status || 'Pending'}
                  stats={[
                    { 
                      label: 'Status', 
                      value: approval.status || 'Pending', 
                      icon: StatusIcon,
                      color: isApproved ? 'text-green-300' : isRejected ? 'text-red-300' : 'text-yellow-300'
                    },
                    { 
                      label: 'Requested On', 
                      value: new Date(approval.createdAt).toLocaleDateString(), 
                      icon: Calendar,
                      color: 'text-blue-300'
                    },
                    ...(approval.requestedBy ? [{ 
                      label: 'Requested By', 
                      value: approval.requestedBy, 
                      icon: User,
                      color: 'text-purple-300'
                    }] : []),
                    ...(approval.propertyName ? [{ 
                      label: 'Property', 
                      value: approval.propertyName, 
                      icon: Building2,
                      color: 'text-orange-300'
                    }] : [])
                  ]}
                  badges={[
                    { 
                      label: approval.type || 'General', 
                      value: '', 
                      color: approval.type === 'Urgent' ? 'bg-red-500' : 
                             approval.type === 'Financial' ? 'bg-green-500' : 'bg-blue-500'
                    }
                  ]}
                  detailsPath={`/dashboard/approvals-universal/${approval._id}`}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  secondaryActions={[
                    ...(isPending ? [
                      { 
                        icon: CheckCircle, 
                        label: 'Approve', 
                        onClick: () => handleApprove(approval._id), 
                        color: 'bg-gradient-to-r from-green-400 to-green-500'
                      },
                      { 
                        icon: XCircle, 
                        label: 'Reject', 
                        onClick: () => handleReject(approval._id), 
                        color: 'bg-gradient-to-r from-red-400 to-red-500'
                      }
                    ] : [])
                  ]}
                  showCheckbox={false}
                  isSelected={selectedApprovals.includes(approval._id)}
                  onSelect={handleApprovalSelect}
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
              <CheckSquare size={64} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-4">
              No Approval Requests
            </h3>
            <p className="text-gray-300 mb-10 text-lg">
              Create approval requests to streamline your decision-making process.
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
      sectionName="Approval"
      onSearch={(query, filters) => {
        console.log('Search approvals:', query, filters);
      }}
      data={approvals}
    />
    
    <UniversalAnalyticsModal
      isOpen={showAnalytics}
      onClose={() => setShowAnalytics(false)}
      sectionName="Approval"
      data={approvals}
    />
  </>
  );
};

export default ApprovalsPageUniversal;