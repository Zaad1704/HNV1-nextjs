'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckSquare, Clock, User, Building, Check, X, Download, AlertTriangle, Shield, DollarSign } from 'lucide-react';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';
import UniversalActionButton from '@/components/common/UniversalActionButton';
import { useCrossData } from '@/hooks/useCrossData';
import apiClient from '@/lib/api';
import UniversalSearch, { SearchFilters } from '@/components/common/UniversalSearch';
import UniversalExport from '@/components/common/UniversalExport';
import MessageButtons from '@/components/common/MessageButtons';

const fetchApprovals = async () => {
  try {
    const { data } = await apiClient.get('/approvals');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch approvals:', error);
    return [];
  }
};

const updateApproval = async ({ id, status }: { id: string; status: string }) => {
  const { data } = await apiClient.put(`/approvals/${id}`, { status });
  return data.data;
};

const ApprovalRequestsPage = () => {
  const queryClient = useQueryClient();
  const { stats } = useCrossData();
  const [showExport, setShowExport] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['approvals'],
    queryFn: fetchApprovals,
    retry: 1
  });

  const mutation = useMutation({
    mutationFn: updateApproval,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    }
  });

  const handleApproval = (id: string, status: string) => {
    mutation.mutate({ id, status });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading approvals...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <UniversalHeader
        title="Approval Requests"
        subtitle={`Manage agent permission requests (${approvals.length} requests)`}
        icon={CheckSquare}
        stats={[
          { label: 'Total', value: approvals.length, color: 'blue' },
          { label: 'Pending', value: approvals.filter(a => a.status === 'Pending').length, color: 'yellow' },
          { label: 'Approved', value: approvals.filter(a => a.status === 'Approved').length, color: 'green' },
          { label: 'Rejected', value: approvals.filter(a => a.status === 'Rejected').length, color: 'red' }
        ]}
        actions={
          <UniversalActionButton variant="success" size="sm" icon={Download} onClick={() => setShowExport(true)}>Export</UniversalActionButton>
        }
      />

      <UniversalSearch
        onSearch={setSearchFilters}
        placeholder="Search approval requests..."
        showStatusFilter={true}
        statusOptions={[
          { value: 'Pending', label: 'Pending' },
          { value: 'Approved', label: 'Approved' },
          { value: 'Rejected', label: 'Rejected' }
        ]}
      />

      {approvals.length > 0 ? (
        <div className="space-y-6">
          {approvals.map((approval: any, index: number) => (
            <UniversalCard key={approval._id} delay={index * 0.1} gradient="purple">
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 gradient-dark-orange-blue rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      {approval.status === 'Pending' ? (
                        <AlertTriangle size={24} className="text-white" />
                      ) : approval.status === 'Approved' ? (
                        <Check size={24} className="text-white" />
                      ) : (
                        <X size={24} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-text-primary group-hover:text-brand-blue transition-colors">
                          {approval.type?.replace('_', ' ').toUpperCase() || 'APPROVAL REQUEST'}
                        </h3>
                        <UniversalStatusBadge 
                          status={approval.status || 'PENDING'}
                          variant={
                            approval.status === 'Pending' ? 'warning' :
                            approval.status === 'Approved' ? 'success' : 'error'
                          }
                        />
                      </div>
                      <p className="text-sm text-text-secondary font-medium">
                        Agent requesting permission for restricted action
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-text-secondary mb-4">
                    {approval.description || 'No description provided'}
                  </p>
                  
                  <div className="bg-app-bg/50 rounded-2xl p-4 space-y-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <User size={14} className="text-blue-600" />
                      </div>
                      <span className="text-sm text-text-primary font-medium">
                        Requested by: {approval.requestedBy?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Building size={14} className="text-green-600" />
                      </div>
                      <span className="text-sm text-text-primary font-medium">
                        Property: {approval.propertyId?.name || 'General'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Clock size={14} className="text-purple-600" />
                      </div>
                      <span className="text-sm text-text-primary font-medium">
                        {approval.createdAt ? new Date(approval.createdAt).toLocaleDateString() : 'No date'}
                      </span>
                    </div>
                    {approval.amount && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <DollarSign size={14} className="text-yellow-600" />
                        </div>
                        <span className="text-sm text-text-primary font-medium">
                          Amount: ${approval.amount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Business Rules & Approval Chain */}
                  {(approval.businessRules || approval.approvalChain) && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 mb-4">
                      <h4 className="text-xs font-semibold text-orange-800 mb-2">Approval Requirements</h4>
                      <div className="space-y-1 text-xs text-orange-700">
                        {approval.businessRules?.autoApprovalThreshold && (
                          <div>• Auto-approval threshold: ${approval.businessRules.autoApprovalThreshold}</div>
                        )}
                        {approval.businessRules?.requiresMultipleApprovals && (
                          <div>• Requires multiple approvals</div>
                        )}
                        {approval.approvalChain?.requiredApprovers?.length > 0 && (
                          <div>• Required approvers: {approval.approvalChain.requiredApprovers.length}</div>
                        )}
                        {approval.businessRules?.escalationTimeout && (
                          <div>• Escalates after: {approval.businessRules.escalationTimeout} hours</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  {approval.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproval(approval._id, 'Approved')}
                        disabled={mutation.isPending}
                        className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
                      >
                        <Check size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproval(approval._id, 'Rejected')}
                        disabled={mutation.isPending}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 flex items-center gap-2 disabled:opacity-50"
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </div>
                  )}
                  <MessageButtons
                    phone={approval.requestedBy?.phone}
                    email={approval.requestedBy?.email}
                    name={approval.requestedBy?.name}
                    customMessage={`Your ${approval.type} request has been ${approval.status.toLowerCase()}.`}
                  />
                </div>
              </div>
            </UniversalCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckSquare size={48} className="text-white" />
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent mb-4">
            No Pending Approvals
          </h3>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto text-lg leading-relaxed">
            All agent permission requests have been processed. New requests from agents will appear here when they need approval for restricted actions.
          </p>
          <div className="bg-blue-50 p-4 rounded-2xl max-w-md mx-auto">
            <div className="flex items-center gap-2 text-blue-800">
              <Shield size={16} />
              <span className="text-sm font-medium">Agents need approval for:</span>
            </div>
            <ul className="text-xs text-blue-700 mt-2 space-y-1">
              <li>• Editing property details</li>
              <li>• Deleting tenants</li>
              <li>• Modifying payments</li>
              <li>• Adding large expenses</li>
              <li>• Closing maintenance requests</li>
            </ul>
          </div>
        </div>
      )}
      <UniversalExport
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={approvals}
        filename="approval-requests"
        filters={searchFilters}
        title="Export Approval Requests"
      />
    </div>
  );
};

export default ApprovalRequestsPage;