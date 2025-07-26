'use client';
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Plus, Mail, Phone, Download, Building2, Shield, UserPlus } from 'lucide-react';
import apiClient from '@/lib/api';
import LazyLoader from '@/components/common/LazyLoader';

// Import universal components
import UniversalSectionPage from '@/components/common/UniversalSectionPage';
import UniversalFloatingActionMenu from '@/components/common/UniversalFloatingActionMenu';
import UniversalRadialActionWheel from '@/components/common/UniversalRadialActionWheel';
import UniversalGlassyCard from '@/components/common/UniversalGlassyCard';
import UniversalSearchModal from '@/components/common/UniversalSearchModal';
import UniversalAnalyticsModal from '@/components/common/UniversalAnalyticsModal';
import InviteUserModal from '@/components/common/InviteUserModal';

const fetchUsers = async () => {
  try {
    const { data } = await apiClient.get('/users');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
};

const UsersPageUniversal = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });

  const handleUserSelect = (userId: string, selected: boolean) => {
    if (selected) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  // Calculate stats
  const activeUsers = useMemo(() => {
    return users.filter((u: any) => u.status === 'Active');
  }, [users]);

  const pendingInvites = useMemo(() => {
    return users.filter((u: any) => u.status === 'Pending');
  }, [users]);

  const agentCount = useMemo(() => {
    return users.filter((u: any) => u.role === 'Agent').length;
  }, [users]);

  return (
    <>
    <UniversalSectionPage
      title="Users & Invites"
      subtitle={`Manage users and invitations (${users.length} users)`}
      icon={Users}
      stats={[
        { label: 'Total', value: users.length },
        { label: 'Active', value: activeUsers.length },
        { label: 'Pending', value: pendingInvites.length }
      ]}
      actionWheel={
        <UniversalRadialActionWheel
          actions={[
            { id: 'invite', icon: UserPlus, label: 'Invite User', onClick: () => setShowInviteModal(true), angle: -60 },
            { id: 'export', icon: Download, label: 'Export Data', onClick: () => setShowExport(true), angle: 0 },
            { id: 'add', icon: Plus, label: 'Add User', onClick: () => setShowAddModal(true), angle: 60 }
          ]}
        />
      }
      addButton={
        <button 
          onClick={() => setShowInviteModal(true)}
          className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <UserPlus size={18} />
          Invite User
        </button>
      }
      floatingActionMenu={
        <UniversalFloatingActionMenu
          sectionName="User"
          onAddItem={() => setShowAddModal(true)}
          onBulkAction={() => setShowInviteModal(true)}
          onExport={() => setShowExport(true)}
          onSearch={() => setShowSearch(true)}
          onAnalytics={() => setShowAnalytics(true)}
          onInviteUser={() => setShowInviteModal(true)}
        />
      }
      aiInsightsData={{
        properties: [],
        tenants: []
      }}
      smartSuggestionsData={{
        properties: [],
        tenants: []
      }}
      isLoading={isLoading}
      error={error}
    >
      {users.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {users.map((user: any, index: number) => {
            const isPending = user.status === 'Pending';
            const isActive = user.status === 'Active';
            
            return (
              <LazyLoader key={user._id}>
                <UniversalGlassyCard
                  item={user}
                  index={index}
                  icon={Users}
                  title={user.name || `User #${user._id.substring(0, 8)}`}
                  subtitle={`${user.email || 'No email'} - ${user.role || 'No role'}`}
                  status={user.status || 'Active'}
                  stats={[
                    { 
                      label: 'Role', 
                      value: user.role || 'User', 
                      icon: Shield,
                      color: user.role === 'Admin' ? 'text-purple-300' : 
                             user.role === 'Agent' ? 'text-blue-300' : 'text-green-300'
                    },
                    ...(user.email ? [{ 
                      label: 'Email', 
                      value: user.email, 
                      icon: Mail,
                      color: 'text-blue-300'
                    }] : []),
                    ...(user.phone ? [{ 
                      label: 'Phone', 
                      value: user.phone, 
                      icon: Phone,
                      color: 'text-green-300'
                    }] : []),
                    ...(user.organization ? [{ 
                      label: 'Organization', 
                      value: user.organization, 
                      icon: Building2,
                      color: 'text-orange-300'
                    }] : [])
                  ]}
                  badges={[
                    { 
                      label: user.role || 'User', 
                      value: '', 
                      color: user.role === 'Admin' ? 'bg-purple-500' : 
                             user.role === 'Agent' ? 'bg-blue-500' : 'bg-green-500'
                    },
                    ...(isPending ? [{ label: 'Pending', value: '', color: 'bg-yellow-500' }] : [])
                  ]}
                  detailsPath={`/dashboard/users-universal/${user._id}`}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  secondaryActions={[
                    ...(isPending ? [{ 
                      icon: Mail, 
                      label: 'Resend', 
                      onClick: () => {}, 
                      color: 'bg-gradient-to-r from-blue-400 to-blue-500'
                    }] : [])
                  ]}
                  showCheckbox={false}
                  isSelected={selectedUsers.includes(user._id)}
                  onSelect={handleUserSelect}
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
              <Users size={64} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-4">
              No Users Yet
            </h3>
            <p className="text-gray-300 mb-10 text-lg">
              Invite team members to collaborate on your property management.
            </p>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium"
            >
              <UserPlus size={18} className="inline mr-2" />
              Invite User
            </button>
          </div>
        </div>
      )}
    </UniversalSectionPage>
    
    {/* Modals */}
    <UniversalSearchModal
      isOpen={showSearch}
      onClose={() => setShowSearch(false)}
      sectionName="User"
      onSearch={(query, filters) => {
        console.log('Search users:', query, filters);
        // Implement search logic here
      }}
      data={users}
    />
    
    <UniversalAnalyticsModal
      isOpen={showAnalytics}
      onClose={() => setShowAnalytics(false)}
      sectionName="User"
      data={users}
    />
    
    <InviteUserModal
      isOpen={showInviteModal}
      onClose={() => setShowInviteModal(false)}
      onInvite={async (data) => {
        console.log('Invite user:', data);
        alert('User invitation sent successfully!');
      }}
    />
  </>
  );
};

export default UsersPageUniversal;