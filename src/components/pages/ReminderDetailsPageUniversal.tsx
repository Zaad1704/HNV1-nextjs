'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Bell, 
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
  Clock,
  AlertTriangle
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import UniversalGlassyCardSimple from '@/components/common/UniversalGlassyCardSimple';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';

const fetchReminderDetails = async (id: string) => {
  const { data } = await apiClient.get(`/reminders/${id}`);
  return data.data;
};

const ReminderDetailsPageUniversal = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const { data: reminder, isLoading, error } = useQuery({
    queryKey: ['reminder', id],
    queryFn: () => fetchReminderDetails(id!),
    enabled: Boolean(id)
  });

  const handleBack = () => {
    router.push('/dashboard/reminders-universal');
  };

  const handleMarkComplete = async () => {
    try {
      await apiClient.put(`/reminders/${id}`, { completed: true });
      queryClient.invalidateQueries({ queryKey: ['reminder', id] });
      alert('Reminder marked as completed!');
    } catch (error) {
      console.error('Error marking reminder as complete:', error);
      alert('Failed to mark reminder as complete. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full animate-pulse"></div>
        <span className="ml-3 text-white/70">Loading reminder details...</span>
      </div>
    );
  }

  if (error || !reminder) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-white mb-2">Reminder Not Found</h3>
        <p className="text-white/70 mb-4">The reminder you're looking for doesn't exist.</p>
        <button onClick={handleBack} className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold">
          Back to Reminders
        </button>
      </div>
    );
  }

  const isPast = new Date(reminder.dueDate) < new Date();
  const isToday = new Date(reminder.dueDate).toDateString() === new Date().toDateString();
  const status = reminder.completed ? 'Completed' : isPast ? 'Overdue' : isToday ? 'Today' : 'Upcoming';

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
                  Reminder Details
                </h1>
                <div className="flex items-center gap-2 text-white/90 mt-1">
                  <Bell size={16} />
                  <span>{reminder?.title || 'Reminder'} - Due {new Date(reminder?.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {(user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Landlord') && (
                <button
                  onClick={() => {
                    setEditData({
                      title: reminder?.title || '',
                      description: reminder?.description || '',
                      dueDate: reminder?.dueDate ? new Date(reminder.dueDate).toISOString().split('T')[0] : '',
                      priority: reminder?.priority || 'Normal',
                      completed: reminder?.completed || false
                    });
                    setIsEditing(true);
                  }}
                  className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                  style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
                  title="Edit Reminder"
                >
                  <Edit size={20} className="text-white" />
                </button>
              )}
              <button
                onClick={() => {
                  const shareData = {
                    title: `Reminder - ${reminder?.title}`,
                    text: `${reminder?.description || 'Reminder'}`,
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
                title="Share Reminder"
              >
                <Share2 size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          {/* Reminder Overview */}
          <UniversalGlassyCardSimple>
            <h3 className="text-lg font-bold mb-4 text-white/90">Reminder Overview</h3>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                  <Bell size={32} className="text-blue-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{reminder?.title || 'Reminder'}</h2>
                  <p className="text-blue-400 font-medium">Priority: {reminder?.priority || 'Normal'}</p>
                </div>
              </div>
              <UniversalStatusBadge 
                status={status} 
                variant={reminder?.completed ? 'success' : isPast ? 'error' : isToday ? 'warning' : 'info'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Calendar size={20} className="text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Due Date</p>
                    <p className={`font-semibold ${isPast && !reminder?.completed ? 'text-red-300' : isToday ? 'text-yellow-300' : 'text-white'}`}>
                      {new Date(reminder?.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    {reminder?.completed ? <CheckCircle size={20} className="text-green-300" /> : <Clock size={20} className="text-yellow-300" />}
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Status</p>
                    <p className="font-semibold text-white">{status}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <AlertTriangle size={20} className={reminder?.priority === 'High' ? 'text-red-300' : 'text-yellow-300'} />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Priority</p>
                    <p className="font-semibold text-white">{reminder?.priority || 'Normal'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Calendar size={20} className="text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Created</p>
                    <p className="font-semibold text-white">{reminder?.createdAt ? new Date(reminder.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {reminder?.description && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <FileText size={20} className="text-orange-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/70 mb-2">Description</p>
                    <p className="text-white leading-relaxed">{reminder.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Complete Action */}
            {!reminder?.completed && (user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Landlord') && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <button
                  onClick={handleMarkComplete}
                  className="px-4 py-2 bg-green-500/30 hover:bg-green-500/50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Mark as Completed
                </button>
              </div>
            )}
          </UniversalGlassyCardSimple>

          {/* Related Information */}
          {(reminder?.tenantName || reminder?.propertyName) && (
            <UniversalGlassyCardSimple>
              <h3 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
                <FileText size={20} className="text-yellow-300" />
                Related Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reminder?.tenantName && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <User size={20} className="text-blue-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Tenant</p>
                      <p className="font-semibold text-white">{reminder.tenantName}</p>
                    </div>
                  </div>
                )}
                {reminder?.propertyName && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <Building2 size={20} className="text-purple-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Property</p>
                      <p className="font-semibold text-white">{reminder.propertyName}</p>
                    </div>
                  </div>
                )}
              </div>
            </UniversalGlassyCardSimple>
          )}
        </div>
      </div>
      
      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Reminder</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={editData.dueDate}
                  onChange={(e) => setEditData({...editData, dueDate: e.target.value})}
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
                  <option value="Normal">Normal</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="completed"
                  checked={editData.completed}
                  onChange={(e) => setEditData({...editData, completed: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="completed" className="text-sm font-medium text-gray-700">Mark as completed</label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  try {
                    await apiClient.put(`/reminders/${id}`, editData);
                    queryClient.invalidateQueries({ queryKey: ['reminder', id] });
                    setIsEditing(false);
                    alert('Reminder updated successfully!');
                  } catch (error) {
                    console.error('Error updating reminder:', error);
                    alert('Failed to update reminder. Please try again.');
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

export default ReminderDetailsPageUniversal;