'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Wrench, 
  Calendar, 
  Building2, 
  User, 
  FileText, 
  Edit, 
  ArrowLeft,
  Share2,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Eye
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import UniversalGlassyCardSimple from '@/components/common/UniversalGlassyCardSimple';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';

const fetchMaintenanceDetails = async (id: string) => {
  const { data } = await apiClient.get(`/maintenance/${id}`);
  return data.data;
};

const MaintenanceDetailsPageUniversal = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const { data: maintenance, isLoading, error } = useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => fetchMaintenanceDetails(id!),
    enabled: Boolean(id)
  });

  const handleBack = () => {
    router.push('/dashboard/maintenance-universal');
  };

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
        return 'success';
      case 'Pending':
        return 'warning';
      case 'In Progress':
        return 'info';
      default:
        return 'error';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
      case 'Urgent':
        return 'text-red-300';
      case 'Medium':
        return 'text-yellow-300';
      case 'Low':
        return 'text-green-300';
      default:
        return 'text-blue-300';
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await apiClient.put(`/maintenance/${id}`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['maintenance', id] });
      alert(`Maintenance request status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full animate-pulse"></div>
        <span className="ml-3 text-white/70">Loading maintenance details...</span>
      </div>
    );
  }

  if (error || !maintenance) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-white mb-2">Maintenance Request Not Found</h3>
        <p className="text-white/70 mb-4">The maintenance request you're looking for doesn't exist.</p>
        <button onClick={handleBack} className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold">
          Back to Maintenance
        </button>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(maintenance.status);

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
                  Maintenance Request Details
                </h1>
                <div className="flex items-center gap-2 text-white/90 mt-1">
                  <Wrench size={16} />
                  <span>{maintenance?.title || 'Maintenance Request'} - {new Date(maintenance?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {(user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Landlord') && (
                <button
                  onClick={() => {
                    setEditData({
                      title: maintenance?.title || '',
                      description: maintenance?.description || '',
                      priority: maintenance?.priority || 'Medium',
                      status: maintenance?.status || 'Pending',
                      estimatedCost: maintenance?.estimatedCost || 0,
                      actualCost: maintenance?.actualCost || 0
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
                    title: `Maintenance Request - ${maintenance?.title}`,
                    text: `${maintenance?.description || 'Maintenance Request'}`,
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
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                  <Wrench size={32} className="text-orange-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{maintenance?.title || 'Maintenance Request'}</h2>
                  <p className="text-orange-400 font-medium">Priority: {maintenance?.priority || 'Medium'}</p>
                </div>
              </div>
              <UniversalStatusBadge 
                status={maintenance?.status || 'Pending'} 
                variant={getStatusColor(maintenance?.status)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Calendar size={20} className="text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Created Date</p>
                    <p className="font-semibold text-white">{new Date(maintenance?.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <StatusIcon size={20} className={getPriorityColor(maintenance?.status)} />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Status</p>
                    <p className="font-semibold text-white">{maintenance?.status || 'Pending'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <AlertTriangle size={20} className={getPriorityColor(maintenance?.priority)} />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Priority</p>
                    <p className="font-semibold text-white">{maintenance?.priority || 'Medium'}</p>
                  </div>
                </div>
                {maintenance?.estimatedCost && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <FileText size={20} className="text-blue-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Estimated Cost</p>
                      <p className="font-semibold text-white">${maintenance.estimatedCost.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {maintenance?.description && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <FileText size={20} className="text-orange-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/70 mb-2">Description</p>
                    <p className="text-white leading-relaxed">{maintenance.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Update Actions */}
            {maintenance?.status !== 'Completed' && (user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Landlord') && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <h4 className="text-sm font-medium text-white/70 mb-3">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {maintenance?.status !== 'In Progress' && (
                    <button
                      onClick={() => handleUpdateStatus('In Progress')}
                      className="px-4 py-2 bg-blue-500/30 hover:bg-blue-500/50 text-white rounded-lg transition-colors text-sm"
                    >
                      Mark In Progress
                    </button>
                  )}
                  <button
                    onClick={() => handleUpdateStatus('Completed')}
                    className="px-4 py-2 bg-green-500/30 hover:bg-green-500/50 text-white rounded-lg transition-colors text-sm"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            )}
          </UniversalGlassyCardSimple>

          {/* Property Information */}
          {maintenance?.propertyId && (
            <UniversalGlassyCardSimple>
              <h3 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
                <Building2 size={20} className="text-purple-300" />
                Property Information
              </h3>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                  <Building2 size={32} className="text-purple-300" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{maintenance?.propertyId?.name || 'Unknown Property'}</h4>
                  {maintenance?.propertyId?.address && (
                    <p className="text-purple-400">{maintenance.propertyId.address.formattedAddress || maintenance.propertyId.address.street || 'No address'}</p>
                  )}
                  <div className="mt-3">
                    {maintenance?.propertyId?._id && (
                      <Link href={`/dashboard/properties/${maintenance.propertyId._id}`} className="inline-flex items-center gap-1 bg-purple-500/50 hover:bg-purple-500/70 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                        <Eye size={14} />
                        View Property
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </UniversalGlassyCardSimple>
          )}

          {/* Tenant Information */}
          {maintenance?.tenantId && (
            <UniversalGlassyCardSimple>
              <h3 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
                <User size={20} className="text-blue-300" />
                Tenant Information
              </h3>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                  <User size={32} className="text-blue-300" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{maintenance?.tenantId?.name || 'Unknown Tenant'}</h4>
                  <p className="text-blue-400">{maintenance?.tenantId?.email || 'No email'}</p>
                  {maintenance?.tenantId?.phone && (
                    <p className="text-white/70">{maintenance.tenantId.phone}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {maintenance?.tenantId?._id && (
                      <Link href={`/dashboard/tenants/${maintenance.tenantId._id}`} className="inline-flex items-center gap-1 bg-blue-500/50 hover:bg-blue-500/70 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                        <Eye size={14} />
                        View Tenant
                      </Link>
                    )}
                    {maintenance?.tenantId?.phone && (
                      <a href={`tel:${maintenance.tenantId.phone}`} className="inline-flex items-center gap-1 bg-green-500/50 hover:bg-green-500/70 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                        <Phone size={14} />
                        Call
                      </a>
                    )}
                    {maintenance?.tenantId?.email && (
                      <a href={`mailto:${maintenance.tenantId.email}`} className="inline-flex items-center gap-1 bg-purple-500/50 hover:bg-purple-500/70 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                        <Mail size={14} />
                        Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </UniversalGlassyCardSimple>
          )}

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
                    <Wrench size={20} className="text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Request ID</p>
                    <p className="font-semibold text-white font-mono">{maintenance?._id || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Calendar size={20} className="text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Last Updated</p>
                    <p className="font-semibold text-white">{maintenance?.updatedAt ? new Date(maintenance.updatedAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {maintenance?.actualCost && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <FileText size={20} className="text-purple-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Actual Cost</p>
                      <p className="font-semibold text-white">${maintenance.actualCost.toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {maintenance?.completedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(34, 197, 94, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <CheckCircle size={20} className="text-green-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Completed At</p>
                      <p className="font-semibold text-white">{new Date(maintenance.completedAt).toLocaleString()}</p>
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
              <h3 className="text-lg font-bold text-gray-900">Edit Maintenance Request</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData({...editData, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({...editData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                <input
                  type="number"
                  value={editData.estimatedCost}
                  onChange={(e) => setEditData({...editData, estimatedCost: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Actual Cost</label>
                <input
                  type="number"
                  value={editData.actualCost}
                  onChange={(e) => setEditData({...editData, actualCost: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  try {
                    await apiClient.put(`/maintenance/${id}`, editData);
                    queryClient.invalidateQueries({ queryKey: ['maintenance', id] });
                    setIsEditing(false);
                    alert('Maintenance request updated successfully!');
                  } catch (error) {
                    console.error('Error updating maintenance request:', error);
                    alert('Failed to update maintenance request. Please try again.');
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

export default MaintenanceDetailsPageUniversal;