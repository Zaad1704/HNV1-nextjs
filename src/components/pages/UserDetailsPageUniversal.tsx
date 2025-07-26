'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Edit, 
  ArrowLeft,
  Share2,
  Save,
  X,
  Shield,
  Building2,
  Eye
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import UniversalGlassyCardSimple from '@/components/common/UniversalGlassyCardSimple';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';

const fetchUserDetails = async (id: string) => {
  const { data } = await apiClient.get(`/users/${id}`);
  return data.data;
};

const UserDetailsPageUniversal = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const { data: userDetails, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUserDetails(id!),
    enabled: Boolean(id)
  });

  const handleBack = () => {
    router.push('/dashboard/users-universal');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'error';
      case 'Admin':
        return 'warning';
      case 'Manager':
        return 'info';
      case 'Landlord':
        return 'success';
      case 'Agent':
        return 'info';
      case 'Tenant':
        return 'success';
      default:
        return 'info';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full animate-pulse"></div>
        <span className="ml-3 text-white/70">Loading user details...</span>
      </div>
    );
  }

  if (error || !userDetails) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-white mb-2">User Not Found</h3>
        <p className="text-white/70 mb-4">The user you're looking for doesn't exist.</p>
        <button onClick={handleBack} className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold">
          Back to Users
        </button>
      </div>
    );
  }

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
                  User Profile - {userDetails?.name || 'Unknown User'}
                </h1>
                <div className="flex items-center gap-2 text-white/90 mt-1">
                  <User size={16} />
                  <span>{userDetails?.role || 'User'} - {userDetails?.email || 'No email'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {(user?.role === 'Super Admin' || user?.role === 'Admin') && (
                <button
                  onClick={() => {
                    setEditData({
                      name: userDetails?.name || '',
                      email: userDetails?.email || '',
                      phone: userDetails?.phone || '',
                      role: userDetails?.role || 'Tenant',
                      isActive: userDetails?.isActive !== false
                    });
                    setIsEditing(true);
                  }}
                  className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                  style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
                  title="Edit User"
                >
                  <Edit size={20} className="text-white" />
                </button>
              )}
              <button
                onClick={() => {
                  const shareData = {
                    title: `User Profile - ${userDetails?.name}`,
                    text: `${userDetails?.role} - ${userDetails?.email}`,
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
                title="Share Profile"
              >
                <Share2 size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          {/* User Overview */}
          <UniversalGlassyCardSimple>
            <h3 className="text-lg font-bold mb-4 text-white/90">User Overview</h3>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-white/20 shadow-lg overflow-hidden" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                  {userDetails?.profileImage || userDetails?.avatar ? (
                    <img 
                      src={userDetails.profileImage || userDetails.avatar} 
                      alt={userDetails.name || 'User'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center ${userDetails?.profileImage || userDetails?.avatar ? 'hidden' : ''}`}>
                    {userDetails?.name?.charAt(0) || 'U'}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{userDetails?.name || 'Unknown User'}</h2>
                  <p className="text-blue-400 font-medium">{userDetails?.email || 'No email'}</p>
                  {userDetails?.phone && (
                    <p className="text-white/70">{userDetails.phone}</p>
                  )}
                </div>
              </div>
              <UniversalStatusBadge 
                status={userDetails?.role || 'User'} 
                variant={getRoleColor(userDetails?.role)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Mail size={20} className="text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Email</p>
                    <p className="font-semibold text-white">{userDetails?.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Phone size={20} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Phone</p>
                    <p className="font-semibold text-white">{userDetails?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Shield size={20} className="text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Role</p>
                    <p className="font-semibold text-white">{userDetails?.role || 'User'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Calendar size={20} className="text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Status</p>
                    <p className="font-semibold text-white">{userDetails?.isActive !== false ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
            </div>

            {userDetails?.address && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <MapPin size={20} className="text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Address</p>
                    <p className="font-semibold text-white">{userDetails.address}</p>
                  </div>
                </div>
              </div>
            )}
          </UniversalGlassyCardSimple>

          {/* Organization Information */}
          {userDetails?.organizationId && (
            <UniversalGlassyCardSimple>
              <h3 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
                <Building2 size={20} className="text-purple-300" />
                Organization Information
              </h3>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                  <Building2 size={32} className="text-purple-300" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{userDetails?.organizationId?.name || 'Unknown Organization'}</h4>
                  {userDetails?.organizationId?.type && (
                    <p className="text-purple-400">{userDetails.organizationId.type}</p>
                  )}
                </div>
              </div>
            </UniversalGlassyCardSimple>
          )}

          {/* Account Details */}
          <UniversalGlassyCardSimple>
            <h3 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
              <FileText size={20} className="text-yellow-300" />
              Account Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <User size={20} className="text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">User ID</p>
                    <p className="font-semibold text-white font-mono">{userDetails?._id || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Calendar size={20} className="text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Created At</p>
                    <p className="font-semibold text-white">{userDetails?.createdAt ? new Date(userDetails.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Calendar size={20} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Last Updated</p>
                    <p className="font-semibold text-white">{userDetails?.updatedAt ? new Date(userDetails.updatedAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
                {userDetails?.lastLogin && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <Eye size={20} className="text-blue-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Last Login</p>
                      <p className="font-semibold text-white">{new Date(userDetails.lastLogin).toLocaleString()}</p>
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
              <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editData.role}
                  onChange={(e) => setEditData({...editData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Tenant">Tenant</option>
                  <option value="Agent">Agent</option>
                  <option value="Landlord">Landlord</option>
                  <option value="Manager">Manager</option>
                  {user?.role === 'Super Admin' && (
                    <>
                      <option value="Admin">Admin</option>
                      <option value="Super Admin">Super Admin</option>
                    </>
                  )}
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editData.isActive}
                  onChange={(e) => setEditData({...editData, isActive: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active user</label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  try {
                    await apiClient.put(`/users/${id}`, editData);
                    queryClient.invalidateQueries({ queryKey: ['user', id] });
                    setIsEditing(false);
                    alert('User updated successfully!');
                  } catch (error) {
                    console.error('Error updating user:', error);
                    alert('Failed to update user. Please try again.');
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

export default UserDetailsPageUniversal;