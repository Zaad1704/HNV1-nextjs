'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, User, Calendar, Activity, Filter, Search, Download, Shield, Eye, Archive, Clock, AlertTriangle } from 'lucide-react';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';
import UniversalActionButton from '@/components/common/UniversalActionButton';
import { useCrossData } from '@/hooks/useCrossData';
import apiClient from '@/lib/api';
import UniversalSearch, { SearchFilters } from '@/components/common/UniversalSearch';
import UniversalExport from '@/components/common/UniversalExport';
import { useAuthStore } from '@/store/authStore';

const fetchAuditLogs = async () => {
  try {
    const { data } = await apiClient.get('/audit-logs');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
};

const AuditLogPage = () => {
  const { user } = useAuthStore();
  const { stats } = useCrossData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: fetchAuditLogs,
    retry: 1,
    enabled: true // Will be handled by API role check
  });

  const filteredLogs = logs.filter((log: any) => {
    const matchesSearch = !searchQuery || 
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || log.type === filterType;
    return matchesSearch && matchesType;
  });

  const getActionIcon = (action: string) => {
    if (action?.includes('create')) return '+';
    if (action?.includes('update')) return '✏️';
    if (action?.includes('delete')) return '🗑️';
    if (action?.includes('login')) return '🔐';
    return '📝';
  };

  const getActionColor = (action: string) => {
    if (action?.includes('create')) return 'bg-green-100 text-green-800';
    if (action?.includes('update')) return 'bg-blue-100 text-blue-800';
    if (action?.includes('delete')) return 'bg-red-100 text-red-800';
    if (action?.includes('login')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading audit logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <UniversalHeader
        title="Audit Log"
        subtitle={`View system activity and changes (${filteredLogs.length} entries)`}
        icon={FileText}
        stats={[
          { label: 'Total Logs', value: logs.length, color: 'blue' },
          { label: 'Today', value: logs.filter((l: any) => new Date(l.timestamp).toDateString() === new Date().toDateString()).length, color: 'green' },
          { label: 'High Risk', value: logs.filter((l: any) => l.severity === 'high').length, color: 'red' },
          { label: 'Security Active', value: '✓', color: 'purple' }
        ]}
        actions={
          <UniversalActionButton variant="primary" icon={Download} onClick={() => setShowExport(true)}>Export Logs</UniversalActionButton>
        }
      />

      <UniversalSearch
        onSearch={setSearchFilters}
        placeholder="Search audit logs..."
        showStatusFilter={true}
        statusOptions={[
          { value: 'user', label: 'User Actions' },
          { value: 'property', label: 'Property Changes' },
          { value: 'payment', label: 'Payment Activities' },
          { value: 'system', label: 'System Events' }
        ]}
      />

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-app-border rounded-xl"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 border border-app-border rounded-xl"
        >
          <option value="">All Activities</option>
          <option value="user">User Actions</option>
          <option value="property">Property Changes</option>
          <option value="payment">Payment Activities</option>
          <option value="system">System Events</option>
        </select>
      </div>

      {/* Activity Timeline */}
      <div className="app-surface rounded-3xl p-8 border border-app-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 gradient-dark-orange-blue rounded-2xl flex items-center justify-center shadow-lg">
            <Activity size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Activity Timeline</h2>
            <p className="text-text-secondary">Real-time system and user activity tracking</p>
          </div>
        </div>
        
        {/* Role-based Access Notice */}
        {user?.role === 'Agent' && (
          <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={24} className="text-yellow-600" />
              <h3 className="text-lg font-bold text-yellow-800">Limited Access</h3>
            </div>
            <p className="text-yellow-700">
              As an agent, you can only view audit logs related to your assigned properties and your own actions.
            </p>
          </div>
        )}
        
        {user?.role === 'Tenant' && (
          <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <User size={24} className="text-blue-600" />
              <h3 className="text-lg font-bold text-blue-800">Tenant Access</h3>
            </div>
            <p className="text-blue-700">
              You can view audit logs related to your tenant account and property interactions.
            </p>
          </div>
        )}
        
        {filteredLogs.length > 0 ? (
          <div className="space-y-6">
            {filteredLogs.map((log: any, index: number) => (
              <UniversalCard key={log._id} delay={index * 0.05} gradient="purple">
                <div className="relative z-10 w-14 h-14 gradient-dark-orange-blue rounded-2xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  {getActionIcon(log.action)}
                </div>
                
                <div className="relative z-10 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <UniversalStatusBadge 
                        status={log.action || 'Unknown Action'}
                        variant={
                          log.action?.includes('create') ? 'success' :
                          log.action?.includes('update') ? 'info' :
                          log.action?.includes('delete') ? 'error' : 'default'
                        }
                      />
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <Clock size={12} />
                        <span>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'No timestamp'}</span>
                      </div>
                    </div>
                    {log.severity === 'high' && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        <AlertTriangle size={10} />
                        High Risk
                      </div>
                    )}
                  </div>
                  
                  <p className="text-text-primary font-bold text-lg mb-2 group-hover:text-brand-blue transition-colors">
                    {log.description || `${log.action} performed`}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-text-secondary mb-4">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-blue-500" />
                      <span className="font-medium">{log.user?.name || 'System'}</span>
                    </div>
                    {log.ipAddress && (
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-green-500" />
                        <span className="font-mono text-xs">{log.ipAddress}</span>
                      </div>
                    )}
                    {log.resource && (
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-purple-500" />
                        <span className="font-medium">{log.resource}</span>
                      </div>
                    )}
                  </div>
                  
                  {log.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-text-secondary cursor-pointer hover:text-text-primary">
                        View Details
                      </summary>
                      <pre className="text-xs text-text-secondary mt-1 p-2 bg-app-surface rounded border overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </UniversalCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-32 h-32 gradient-dark-orange-blue rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <FileText size={64} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent mb-4">
              No Activity Logs
            </h3>
            <p className="text-text-secondary mb-8 max-w-lg mx-auto text-lg leading-relaxed">
              System activities and user actions will appear here as they occur. All security events are automatically tracked and logged.
            </p>
            <div className="bg-blue-50 p-6 rounded-2xl max-w-md mx-auto">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <Shield size={16} />
                <span className="text-sm font-medium">Security Features:</span>
              </div>
              <ul className="text-xs text-blue-700 space-y-1 text-left">
                <li>• User login/logout tracking</li>
                <li>• Property and tenant changes</li>
                <li>• Payment modifications</li>
                <li>• System configuration updates</li>
                <li>• Failed access attempts</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      <UniversalExport
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={filteredLogs}
        filename="audit-logs"
        filters={searchFilters}
        title="Export Audit Logs"
      />
    </div>
  );
};

export default AuditLogPage;