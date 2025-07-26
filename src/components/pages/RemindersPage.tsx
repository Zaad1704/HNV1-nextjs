'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Plus, Calendar, User, Clock, Download } from 'lucide-react';
import apiClient from '@/lib/api';
import LazyLoader from '@/components/common/LazyLoader';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import SwipeableCard from '@/components/mobile/SwipeableCard';
import { useBackgroundRefresh } from '@/hooks/useBackgroundRefresh';
import UniversalSearch, { SearchFilters } from '@/components/common/UniversalSearch';
import UniversalExport from '@/components/common/UniversalExport';
import CreateReminderModal from '@/components/common/CreateReminderModal';
import MessageButtons from '@/components/common/MessageButtons';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';
import UniversalActionButton from '@/components/common/UniversalActionButton';
import { useCrossData } from '@/hooks/useCrossData';
import { useQueryClient } from '@tanstack/react-query';

const fetchReminders = async () => {
  try {
    const { data } = await apiClient.get('/reminders');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch reminders:', error);
    return [];
  }
};

const RemindersPage = () => {
  const queryClient = useQueryClient();
  const { stats } = useCrossData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: fetchReminders,
    retry: 1
  });

  const handleReminderAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['reminders'] });
  };

  // Background refresh
  useBackgroundRefresh([['reminders']], 60000);

  if (isLoading) {
    return <SkeletonLoader type="card" count={6} />;
  }

  return (
    <div className="space-y-8">
      <UniversalHeader
        title="Reminders"
        subtitle={`Manage automated reminders (${reminders.length} active)`}
        icon={Bell}
        stats={[
          { label: 'Total', value: reminders.length, color: 'blue' },
          { label: 'Active', value: reminders.filter(r => r.status === 'active').length, color: 'green' },
          { label: 'Paused', value: reminders.filter(r => r.status === 'paused').length, color: 'yellow' }
        ]}
        actions={
          <>
            <UniversalActionButton variant="success" size="sm" icon={Download} onClick={() => setShowExport(true)}>Export</UniversalActionButton>
            <UniversalActionButton variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>Create Reminder</UniversalActionButton>
          </>
        }
      />

      <UniversalSearch
        onSearch={setSearchFilters}
        placeholder="Search reminders..."
        showStatusFilter={true}
        statusOptions={[
          { value: 'Active', label: 'Active' },
          { value: 'Paused', label: 'Paused' },
          { value: 'Completed', label: 'Completed' }
        ]}
      />

      {reminders.length > 0 ? (
        <div className="universal-grid universal-grid-3">
          {reminders.map((reminder: any, index: number) => (
            <LazyLoader key={reminder._id}>
              <div className="md:hidden">
                <SwipeableCard
                  onEdit={() => console.log('Edit reminder', reminder._id)}
                  onView={() => console.log('View reminder', reminder._id)}
                >
                  <UniversalCard delay={index * 0.1} gradient="purple">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 app-gradient rounded-xl flex items-center justify-center">
                  <Bell size={24} className="text-white" />
                </div>
                <UniversalStatusBadge 
                  status={reminder.status || 'Active'}
                  variant={reminder.status === 'Active' ? 'success' : 'default'}
                />
              </div>
              
              <h3 className="text-lg font-bold text-text-primary mb-2">
                {reminder.title || 'Rent Reminder'}
              </h3>
              
              <p className="text-text-secondary mb-4">
                {reminder.message || 'Automated rent payment reminder'}
              </p>
              
              <div className="bg-app-bg/50 rounded-2xl p-4 space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User size={14} className="text-blue-600" />
                  </div>
                  <span className="text-sm text-text-primary font-medium">
                    {reminder.scope === 'all' ? 'All Tenants' : reminder.tenantId?.name || 'Specific Tenant'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock size={14} className="text-green-600" />
                  </div>
                  <span className="text-sm text-text-primary font-medium">
                    {reminder.frequency || 'Monthly'} • {reminder.deliveryMethod || 'Email'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar size={14} className="text-purple-600" />
                  </div>
                  <span className="text-sm text-text-primary font-medium">
                    Next: {reminder.nextSend ? new Date(reminder.nextSend).toLocaleDateString() : 'Not scheduled'}
                  </span>
                </div>
                {reminder.responseRate && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Bell size={14} className="text-yellow-600" />
                    </div>
                    <span className="text-sm text-text-primary font-medium">
                      Response Rate: {reminder.responseRate}%
                    </span>
                  </div>
                )}
              </div>
              
              {/* Automation Rules */}
              {reminder.automationRules && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-3 mb-4">
                  <h4 className="text-xs font-semibold text-purple-800 mb-2">Automation Rules</h4>
                  <div className="space-y-1 text-xs text-purple-700">
                    {reminder.automationRules.triggerConditions?.map((condition: string, i: number) => (
                      <div key={i}>• Trigger: {condition}</div>
                    ))}
                    {reminder.automationRules.escalationRules?.length > 0 && (
                      <div>• Escalates after {reminder.automationRules.escalationRules.length} attempts</div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <MessageButtons
                  phone={reminder.tenantId?.phone}
                  email={reminder.tenantId?.email}
                  name={reminder.tenantId?.name || 'All Tenants'}
                  customMessage={reminder.message || 'Automated reminder notification'}
                />
              </div>
                  </UniversalCard>
                </SwipeableCard>
              </div>
              <div className="hidden md:block">
                <UniversalCard delay={index * 0.1} gradient="purple">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 app-gradient rounded-xl flex items-center justify-center">
                      <Bell size={24} className="text-white" />
                    </div>
                    <UniversalStatusBadge status={reminder.status || 'Active'} variant={reminder.status === 'Active' ? 'success' : 'default'} />
                  </div>
                </UniversalCard>
              </div>
            </LazyLoader>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 app-gradient rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Bell size={48} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-2">No Reminders Set</h3>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Set up automated reminders to keep tenants informed about rent payments and important dates.
          </p>
          <UniversalActionButton 
            variant="primary"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Create First Reminder
          </UniversalActionButton>
        </div>
      )}
      <UniversalExport
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={reminders}
        filename="reminders"
        filters={searchFilters}
        title="Export Reminders"
      />
      
      <CreateReminderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onReminderCreated={handleReminderAdded}
      />
    </div>
  );
};

export default RemindersPage;