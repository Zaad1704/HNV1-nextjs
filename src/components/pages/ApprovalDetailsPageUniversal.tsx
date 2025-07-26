'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  CheckSquare, 
  Calendar, 
  Building2, 
  User, 
  FileText, 
  Edit, 
  ArrowLeft,
  Share2,
  Save,
  X,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import UniversalGlassyCardSimple from '@/components/common/UniversalGlassyCardSimple';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';

const fetchApprovalDetails = async (id: string) => {
  const { data } = await apiClient.get(`/approvals/${id}`);
  return data.data;
};

const ApprovalDetailsPageUniversal = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const { data: approval, isLoading, error } = useQuery({
    queryKey: ['approval', id],
    queryFn: () => fetchApprovalDetails(id!),
    enabled: Boolean(id)
  });

  const handleBack = () => {
    router.push('/dashboard/approvals-universal');
  };

  const handleApprove = async () => {
    try {
      await apiClient.put(`/approvals/${id}`, { status: 'Approved' });
      queryClient.invalidateQueries({ queryKey: ['approval', id] });
      alert('Request approved successfully!');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request. Please try again.');
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    try {
      await apiClient.put(`/approvals/${id}`, { 
        status: 'Rejected',
        rejectionReason: reason || undefined
      });
      queryClient.invalidateQueries({ queryKey: ['approval', id] });
      alert('Request rejected successfully!');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full animate-pulse"></div>
        <span className="ml-3 text-white/70">Loading approval details...</span>
      </div>
    );
  }

  if (error || !approval) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-white mb-2">Approval Request Not Found</h3>
        <p className="text-white/70 mb-4">The approval request you're looking for doesn't exist.</p>
        <button onClick={handleBack} className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold">
          Back to Approvals
        </button>
      </div>
    );
  }

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
    <>
      {/* Header */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-3xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}></div>
        <div className="relative rounded-3xl p-6 border-2 border-white/40" style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', 
          backdropFilter: 'blur(25px) saturate(200%)',
          WebkitBackdropFilter: 'blur(25px) saturate(200%)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBack}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
                  Approval Request Details
                </h1>
                <div className="flex items-center gap-2 text-white/90 mt-1">
                  <CheckSquare size={16} />
                  <span>{approval?.title || 'Approval Request'} - {new Date(approval?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {(user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Landlord') && (
                <button
                  onClick={() => {
                    setEditData({
                      title: approval?.title || '',
                      description: approval?.description || '',
                      type: approval?.type || 'General',
                      priority: approval?.priority || 'Normal'
                    });
                    setIsEditing(true);
                  }}
                  className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                  style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
                  title="Edit Request"
                >
                  <Edit size={20} className="text-white" />
                </button>
              )}
              <button
                onClick={() => {
                  const shareData = {
                    title: `Approval Request - ${approval?.title}`,
                    text: `${approval?.description || 'Approval Request'}`,
                    url: window.location.href
                  };
                  if (navigator.share) {
                    navigator.share(shareData);
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
                title="Share Request"
              >
                <Share2 size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          {/* Request Overview */}
          <UniversalGlassyCardSimple>
            <h3 className="text-lg font-bold mb-4 text-white/90">Request Overview</h3>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                  <CheckSquare size={32} className="text-blue-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{approval?.title || 'Approval Request'}</h2>
                  <p className="text-blue-400 font-medium">Type: {approval?.type || 'General'}</p>
                </div>
              </div>
              <UniversalStatusBadge 
                status={approval?.status || 'Pending'} 
                variant={isApproved ? 'success' : isRejected ? 'error' : 'warning'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Calendar size={20} className="text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Requested On</p>
                    <p className="font-semibold text-white">{new Date(approval?.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <StatusIcon size={20} className={isApproved ? 'text-green-300' : isRejected ? 'text-red-300' : 'text-yellow-300'} />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Status</p>
                    <p className="font-semibold text-white">{approval?.status || 'Pending'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {approval?.requestedBy && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <User size={20} className="text-blue-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Requested By</p>
                      <p className="font-semibold text-white">{approval.requestedBy}</p>
                    </div>
                  </div>
                )}
                {approval?.propertyName && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <Building2 size={20} className="text-purple-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Property</p>
                      <p className="font-semibold text-white">{approval.propertyName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {approval?.description && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <FileText size={20} className="text-orange-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/70 mb-2">Description</p>
                    <p className="text-white leading-relaxed">{approval.description}</p>
                  </div>
                </div>
              </div>
            )}

            {approval?.rejectionReason && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <XCircle size={20} className="text-red-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/70 mb-2">Rejection Reason</p>
                    <p className="text-red-300 leading-relaxed">{approval.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Actions */}
            {isPending && (user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Landlord') && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <h4 className="text-sm font-medium text-white/70 mb-3">Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleApprove}
                    className="px-4 py-2 bg-green-500/30 hover:bg-green-500/50 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Approve Request
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-500/30 hover:bg-red-500/50 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <XCircle size={16} />
                    Reject Request
                  </button>
                </div>
              </div>
            )}
          </UniversalGlassyCardSimple>

          {/* Request Details */}
          <UniversalGlassyCardSimple>
            <h3 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
              <FileText size={20} className="text-yellow-300" />
              Request Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <CheckSquare size={20} className="text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Request ID</p>
                    <p className="font-semibold text-white font-mono">{approval?._id || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Calendar size={20} className="text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Last Updated</p>
                    <p className="font-semibold text-white">{approval?.updatedAt ? new Date(approval.updatedAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <FileText size={20} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Type</p>
                    <p className="font-semibold text-white">{approval?.type || 'General'}</p>
                  </div>
                </div>
                {approval?.approvedBy && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(34, 197, 94, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <User size={20} className="text-green-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Approved By</p>
                      <p className="font-semibold text-white">{approval.approvedBy}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </UniversalGlassyCardSimple>
        </div>
      </div>
      
      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Approval Request</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editData.type}
                  onChange={(e) => setEditData({...editData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="General">General</option>
                  <option value="Financial">Financial</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Legal">Legal</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData({...editData, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  try {
                    await apiClient.put(`/approvals/${id}`, editData);
                    queryClient.invalidateQueries({ queryKey: ['approval', id] });
                    setIsEditing(false);
                    alert('Approval request updated successfully!');
                  } catch (error) {
                    console.error('Error updating approval request:', error);
                    alert('Failed to update approval request. Please try again.');
                  }
                }}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApprovalDetailsPageUniversal;