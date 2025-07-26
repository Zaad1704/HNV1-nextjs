'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Mail, Shield, Calendar, MoreVertical, Download, Eye, Archive, Building2, UserCheck, UserX, Settings } from 'lucide-react';
import apiClient from '@/lib/api';
import MessageButtons from '@/components/common/MessageButtons';
import OrganizationCode from '@/components/common/OrganizationCode';
import UniversalSearch, { SearchFilters } from '@/components/common/UniversalSearch';
import UniversalExport from '@/components/common/UniversalExport';
import UserManagementModal from '@/components/common/UserManagementModal';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalActionButton from '@/components/common/UniversalActionButton';
import { useCrossData } from '@/hooks/useCrossData';
import { useAuthStore } from '@/store/authStore';

const fetchUsers = async () => {
  try {
    const { data } = await apiClient.get('/users');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
};

const fetchInvites = async () => {
  try {
    const { data } = await apiClient.get('/invitations');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch invites:', error);
    return [];
  }
};

const sendInvite = async (email: string, role: string) => {
  const { data } = await apiClient.post('/invitations', { email, role });
  return data.data;
};

const UsersPage = () => {
  const { user } = useAuthStore();
  const { stats } = useCrossData();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Agent');
  const [showExport, setShowExport] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const queryClient = useQueryClient();
  
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    retry: 1
  });

  const { data: invites = [], isLoading: invitesLoading } = useQuery({
    queryKey: ['invites'],
    queryFn: fetchInvites,
    retry: 1
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) => sendInvite(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      setShowInviteModal(false);
      setInviteEmail('');
    }
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail) {
      inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
    }
  };

  if (usersLoading || invitesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <UniversalHeader
        title="Users & Invites"
        subtitle={`Manage team members and invitations (${users.length} users, ${invites.length} pending)`}
        icon={Users}
        stats={[
          { label: 'Total Users', value: users.length, color: 'blue' },
          { label: 'Active', value: users.filter(u => u.status === 'active').length, color: 'green' },
          { label: 'Pending Invites', value: invites.length, color: 'yellow' },
          { label: 'Agents', value: users.filter(u => u.role === 'Agent').length, color: 'purple' }
        ]}
        actions={
          <>
            <UniversalActionButton variant="success" size="sm" icon={Download} onClick={() => setShowExport(true)}>Export</UniversalActionButton>
            <UniversalActionButton variant="primary" icon={Plus} onClick={() => setShowInviteModal(true)}>Invite User</UniversalActionButton>
          </>
        }
      />

      {/* Organization Code */}
      {user?.organizationId && (
        <OrganizationCode
          organizationId={user.organizationId._id || user.organizationId}
          organizationName={user.organizationId.name || 'Your Organization'}
        />
      )}
      
      <UniversalSearch
        onSearch={setSearchFilters}
        placeholder="Search users and invites..."
        showStatusFilter={true}
        statusOptions={[
          { value: 'active', label: 'Active' },
          { value: 'pending', label: 'Pending' },
          { value: 'inactive', label: 'Inactive' }
        ]}
      />

      {/* Active Users */}
      <div className="app-surface rounded-3xl p-8 border border-app-border">
        <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
          <Users size={24} className="text-brand-blue" />
          Team Members
        </h2>
        {users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map((user: any, index: number) => (
              <UniversalCard key={user._id} delay={index * 0.1} gradient="blue">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-purple-500/5 to-brand-orange/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative z-10 flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 gradient-dark-orange-blue rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-text-primary group-hover:text-brand-blue transition-colors">
                      {user.name}
                    </h3>
                    <p className="text-sm text-text-secondary truncate">{user.email}</p>
                  </div>
                </div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${
                      user.role === 'Landlord' ? 'bg-blue-100/90 text-blue-800' :
                      user.role === 'Agent' ? 'bg-green-100/90 text-green-800' :
                      user.role === 'Tenant' ? 'bg-purple-100/90 text-purple-800' :
                      'bg-gray-100/90 text-gray-800'
                    }`}>
                      {user.role === 'Landlord' && <Shield size={10} className="inline mr-1" />}
                      {user.role === 'Agent' && <UserCheck size={10} className="inline mr-1" />}
                      {user.role}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm ${
                      user.status === 'active' ? 'bg-green-100/90 text-green-800' : 'bg-yellow-100/90 text-yellow-800'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </div>
                  
                  {user.role === 'Agent' && (
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-blue-800">
                        <Building2 size={14} />
                        <span className="text-xs font-medium">
                          {user.managedProperties || 0} Properties Assigned
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-brand-blue to-brand-orange text-white py-2 px-4 rounded-xl text-sm font-semibold transition-all hover:shadow-lg group-hover:scale-105 transform"
                  >
                    <Settings size={14} className="inline mr-2" />
                    Manage User
                  </button>
                </div>
              </UniversalCard>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-8">No team members yet.</p>
        )}
      </div>

      {/* Pending Invites */}
      <div className="app-surface rounded-3xl p-6 border border-app-border">
        <h2 className="text-xl font-bold text-text-primary mb-4">Pending Invitations</h2>
        {invites.length > 0 ? (
          <div className="space-y-3">
            {invites.map((invite: any, index: number) => (
              <div
                key={invite._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-app-bg rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Mail size={20} className="text-text-secondary" />
                  <div>
                    <p className="font-medium text-text-primary">{invite.email}</p>
                    <p className="text-sm text-text-secondary">Role: {invite.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Pending
                  </span>
                  <p className="text-xs text-text-secondary mt-1">
                    {invite.createdAt ? new Date(invite.createdAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
                <MessageButtons
                  email={invite.email}
                  name={invite.email.split('@')[0]}
                  messageType="teamInvite"
                  additionalData={{
                    role: invite.role,
                    companyName: 'Property Management'
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-secondary text-center py-8">No pending invitations.</p>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 gradient-dark-orange-blue rounded-2xl flex items-center justify-center">
                <Mail size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Invite Team Member</h3>
                <p className="text-gray-600">Send an invitation to join your organization</p>
              </div>
            </div>
            <form onSubmit={handleInvite} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                >
                  <option value="Agent">Agent - Limited property access</option>
                  <option value="Landlord">Landlord - Full system access</option>
                  <option value="Tenant">Tenant - Personal portal access</option>
                </select>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> The invited user will receive an email with instructions to join your organization.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="flex-1 btn-gradient py-3 rounded-xl font-bold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
                >
                  {inviteMutation.isPending ? 'Sending Invite...' : 'Send Invitation'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <UniversalExport
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={[...users, ...invites]}
        filename="users-and-invites"
        filters={searchFilters}
        title="Export Users & Invites"
      />
      
      <UserManagementModal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
      
      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <button
          onClick={() => setShowInviteModal(true)}
          className="w-16 h-16 gradient-dark-orange-blue rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 group"
        >
          <Plus size={24} className="text-white group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
      
      {/* Modern Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-blue/5 to-brand-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-brand-orange/5 to-brand-blue/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default UsersPage;