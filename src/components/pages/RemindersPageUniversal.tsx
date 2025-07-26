'use client';
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Plus, Calendar, User, Download, Building2, Clock, CheckCircle } from 'lucide-react';
import apiClient from '@/lib/api';
import LazyLoader from '@/components/common/LazyLoader';

// Import universal components
import UniversalSectionPage from '@/components/common/UniversalSectionPage';
import UniversalFloatingActionMenu from '@/components/common/UniversalFloatingActionMenu';
import UniversalRadialActionWheel from '@/components/common/UniversalRadialActionWheel';
import UniversalGlassyCard from '@/components/common/UniversalGlassyCard';
import UniversalSearchModal from '@/components/common/UniversalSearchModal';
import UniversalAnalyticsModal from '@/components/common/UniversalAnalyticsModal';

const fetchReminders = async () => {
  try {
    const { data } = await apiClient.get('/reminders');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch reminders:', error);
    return [];
  }
};

const RemindersPageUniversal = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedReminders, setSelectedReminders] = useState<string[]>([]);
  
  const { data: reminders = [], isLoading, error } = useQuery({
    queryKey: ['reminders'],
    queryFn: fetchReminders
  });

  const handleReminderSelect = (reminderId: string, selected: boolean) => {
    if (selected) {
      setSelectedReminders(prev => [...prev, reminderId]);
    } else {
      setSelectedReminders(prev => prev.filter(id => id !== reminderId));
    }
  };

  // Calculate stats
  const pendingReminders = useMemo(() => {
    return reminders.filter((r: any) => !r.completed);
  }, [reminders]);

  const upcomingReminders = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    return reminders.filter((r: any) => {
      if (r.completed) return false;
      const reminderDate = new Date(r.dueDate);
      return reminderDate >= now && reminderDate <= nextWeek;
    });
  }, [reminders]);

  const handleMarkComplete = async (reminderId: string) => {
    try {
      await apiClient.put(`/reminders/${reminderId}`, { completed: true });
      // Refetch reminders
      // You would typically use queryClient.invalidateQueries(['reminders']) here
    } catch (error) {
      console.error('Failed to mark reminder as complete:', error);
    }
  };

  return (
    <>
    <UniversalSectionPage
      title="Reminders"
      subtitle={`Track and manage your reminders (${reminders.length} reminders)`}
      icon={Bell}
      stats={[
        { label: 'Total', value: reminders.length },
        { label: 'Pending', value: pendingReminders.length },
        { label: 'Upcoming', value: upcomingReminders.length }
      ]}
      actionWheel={
        <UniversalRadialActionWheel
          actions={[
            { id: 'bulk', icon: Building2, label: 'Bulk Action', onClick: () => setShowBulkAction(true), angle: -60 },
            { id: 'export', icon: Download, label: 'Export Data', onClick: () => setShowExport(true), angle: 0 },
            { id: 'add', icon: Plus, label: 'Add Reminder', onClick: () => setShowAddModal(true), angle: 60 }
          ]}
        />
      }
      addButton={
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Add Reminder
        </button>
      }
      floatingActionMenu={
        <UniversalFloatingActionMenu
          sectionName="Reminder"
          onAddItem={() => setShowAddModal(true)}
          onBulkAction={() => setShowBulkAction(true)}
          onExport={() => setShowExport(true)}
          onSearch={() => setShowSearch(true)}
          onAnalytics={() => setShowAnalytics(true)}
        />
      }
      aiInsightsData={{
        properties: reminders.map((r: any) => r.propertyId).filter(Boolean),
        tenants: reminders.map((r: any) => r.tenantId).filter(Boolean)
      }}
      smartSuggestionsData={{
        properties: reminders.map((r: any) => r.propertyId).filter(Boolean),
        tenants: reminders.map((r: any) => r.tenantId).filter(Boolean)
      }}
      isLoading={isLoading}
      error={error}
    >
      {reminders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reminders.map((reminder: any, index: number) => {
            const isPast = new Date(reminder.dueDate) < new Date();
            const isToday = new Date(reminder.dueDate).toDateString() === new Date().toDateString();
            
            return (
              <LazyLoader key={reminder._id}>
                <UniversalGlassyCard
                  item={reminder}
                  index={index}
                  icon={Bell}
                  title={reminder.title || `Reminder #${reminder._id.substring(0, 8)}`}
                  subtitle={`${reminder.description || 'No description'}`}
                  status={reminder.completed ? 'Completed' : isPast ? 'Overdue' : isToday ? 'Today' : 'Upcoming'}
                  stats={[
                    { 
                      label: 'Due Date', 
                      value: new Date(reminder.dueDate).toLocaleDateString(), 
                      icon: Calendar,
                      color: isPast && !reminder.completed ? 'text-red-300' : isToday ? 'text-yellow-300' : 'text-blue-300'
                    },
                    { 
                      label: 'Status', 
                      value: reminder.completed ? 'Completed' : 'Pending', 
                      icon: reminder.completed ? CheckCircle : Clock,
                      color: reminder.completed ? 'text-green-300' : 'text-yellow-300'
                    },
                    ...(reminder.tenantName ? [{ 
                      label: 'Tenant', 
                      value: reminder.tenantName, 
                      icon: User,
                      color: 'text-purple-300'
                    }] : []),
                    ...(reminder.propertyName ? [{ 
                      label: 'Property', 
                      value: reminder.propertyName, 
                      icon: Building2,
                      color: 'text-orange-300'
                    }] : [])
                  ]}
                  badges={[
                    { 
                      label: reminder.priority || 'Normal', 
                      value: '', 
                      color: reminder.priority === 'High' ? 'bg-red-500' : 
                             reminder.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }
                  ]}
                  detailsPath={`/dashboard/reminders-universal/${reminder._id}`}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  secondaryActions={[
                    ...(reminder.completed ? [] : [{ 
                      icon: CheckCircle, 
                      label: 'Complete', 
                      onClick: () => handleMarkComplete(reminder._id), 
                      color: 'bg-gradient-to-r from-green-400 to-green-500'
                    }])
                  ]}
                  showCheckbox={false}
                  isSelected={selectedReminders.includes(reminder._id)}
                  onSelect={handleReminderSelect}
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
              <Bell size={64} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-4">
              No Reminders Yet
            </h3>
            <p className="text-gray-300 mb-10 text-lg">
              Create reminders to stay on top of important tasks and deadlines.
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium"
            >
              <Plus size={18} className="inline mr-2" />
              Add Reminder
            </button>
          </div>
        </div>
      )}
    </UniversalSectionPage>
    
    {/* Modals */}
    <UniversalSearchModal
      isOpen={showSearch}
      onClose={() => setShowSearch(false)}
      sectionName="Reminder"
      onSearch={(query, filters) => {
        console.log('Search reminders:', query, filters);
      }}
      data={reminders}
    />
    
    <UniversalAnalyticsModal
      isOpen={showAnalytics}
      onClose={() => setShowAnalytics(false)}
      sectionName="Reminder"
      data={reminders}
    />
  </>
  );
};

export default RemindersPageUniversal;