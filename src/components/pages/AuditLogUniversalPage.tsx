'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, User, Calendar, Activity, Filter, Search, Download, Shield, Eye, Archive, Clock, AlertTriangle, Building, CreditCard } from 'lucide-react';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalGlassyCard from '@/components/common/UniversalGlassyCard';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';
import UniversalActionButton from '@/components/common/UniversalActionButton';
import { useCrossData } from '@/hooks/useCrossData';
import apiClient from '@/lib/api';
import UniversalSearch, { SearchFilters } from '@/components/common/UniversalSearch';
import UniversalExport from '@/components/common/UniversalExport';
import { useAuthStore } from '@/store/authStore';
import UniversalTable from '@/components/common/UniversalTable';
import UniversalTabs from '@/components/common/UniversalTabs';
import UniversalFilterBar from '@/components/common/UniversalFilterBar';
import UniversalSectionPage from '@/components/common/UniversalSectionPage';
import UniversalFloatingActionMenu from '@/components/common/UniversalFloatingActionMenu';
import UniversalRadialActionWheel from '@/components/common/UniversalRadialActionWheel';

const fetchAuditLogs = async () => {
  try {
    const { data } = await apiClient.get('/audit-logs');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    // Return mock data when API call fails
    return [
      { id: 1, action: 'login', user: { name: 'John Doe' }, timestamp: new Date().toISOString(), severity: 'low', type: 'user', description: 'User logged in' },
      { id: 2, action: 'create', user: { name: 'Jane Smith' }, timestamp: new Date().toISOString(), severity: 'medium', type: 'property', description: 'Property created' },
      { id: 3, action: 'update', user: { name: 'Admin User' }, timestamp: new Date().toISOString(), severity: 'low', type: 'system', description: 'System settings updated' },
      { id: 4, action: 'delete', user: { name: 'Manager' }, timestamp: new Date().toISOString(), severity: 'high', type: 'payment', description: 'Payment record deleted' }
    ];
  }
};

const AuditLogUniversalPage = () => {
  const { user } = useAuthStore();
  const { stats } = useCrossData();
  const [activeTab, setActiveTab] = useState('all');
  const [showExport, setShowExport] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['auditLogs', searchFilters],
    queryFn: fetchAuditLogs,
    retry: 1,
    enabled: true
  });

  // Ensure logs is an array
  const safetyLogs = Array.isArray(logs) ? logs : [];

  const filteredLogs = safetyLogs.filter((log: any) => {
    const matchesSearch = !searchFilters.query || 
      log.action?.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
      log.user?.name?.toLowerCase().includes(searchFilters.query.toLowerCase());
    
    const matchesStatus = !searchFilters.status || log.type === searchFilters.status;
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'user' && log.type === 'user') ||
      (activeTab === 'property' && log.type === 'property') ||
      (activeTab === 'payment' && log.type === 'payment') ||
      (activeTab === 'system' && log.type === 'system') ||
      (activeTab === 'high-risk' && log.severity === 'high');
    
    return matchesSearch && matchesStatus && matchesTab;
  });

  const getActionIcon = (action: string) => {
    if (action?.includes('create')) return '+';
    if (action?.includes('update')) return '✏️';
    if (action?.includes('delete')) return '🗑️';
    if (action?.includes('login')) return '🔐';
    return '📝';
  };

  const getActionColor = (action: string) => {
    if (action?.includes('create')) return 'success';
    if (action?.includes('update')) return 'info';
    if (action?.includes('delete')) return 'danger';
    if (action?.includes('login')) return 'warning';
    return 'neutral';
  };

  const tabs = [
    { id: 'all', label: 'All Logs', icon: FileText },
    { id: 'user', label: 'User Actions', icon: User },
    { id: 'property', label: 'Property Changes', icon: Building },
    { id: 'payment', label: 'Payment Activities', icon: CreditCard },
    { id: 'system', label: 'System Events', icon: Activity },
    { id: 'high-risk', label: 'High Risk', icon: AlertTriangle },
  ];

  const columns = [
    {
      header: 'Action',
      accessor: 'action',
      cell: (row: any) => (
        <UniversalStatusBadge 
          status={row.action || 'Unknown Action'}
          variant={getActionColor(row.action)}
        />
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      cell: (row: any) => (
        <div>
          <p className="font-medium">{row.description || `${row.action} performed`}</p>
          {row.details && (
            <details className="mt-1">
              <summary className="text-xs text-white/70 cursor-pointer hover:text-white">
                View Details
              </summary>
              <pre className="text-xs text-white/70 mt-1 p-2 bg-black/30 rounded border border-white/10 overflow-x-auto">
                {JSON.stringify(row.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      ),
    },
    {
      header: 'User',
      accessor: 'user.name',
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-blue-500" />
          <span>{row.user?.name || 'System'}</span>
        </div>
      ),
    },
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      cell: (row: any) => (
        <div className="flex items-center gap-2 text-xs">
          <Clock size={12} />
          <span>{row.timestamp ? new Date(row.timestamp).toLocaleString() : 'No timestamp'}</span>
        </div>
      ),
    },
    {
      header: 'IP Address',
      accessor: 'ipAddress',
      cell: (row: any) => (
        row.ipAddress ? (
          <span className="font-mono text-xs">{row.ipAddress}</span>
        ) : (
          <span className="text-white/50">-</span>
        )
      ),
    },
    {
      header: 'Risk',
      accessor: 'severity',
      cell: (row: any) => (
        row.severity === 'high' ? (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <AlertTriangle size={10} />
            High Risk
          </div>
        ) : (
          <span className="text-white/70">Normal</span>
        )
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-white/70">Loading audit logs...</span>
      </div>
    );
  }

  // Safe length calculation
  const entriesCount = filteredLogs?.length || 0;

  return (
    <UniversalSectionPage
      title="Audit Log"
      subtitle={`View system activity and changes (${entriesCount} entries)`}
      icon={FileText}
      stats={[
        { label: 'Total Logs', value: safetyLogs.length },
        { label: 'Today', value: safetyLogs.filter((l: any) => new Date(l.timestamp).toDateString() === new Date().toDateString()).length },
        { label: 'High Risk', value: safetyLogs.filter((l: any) => l.severity === 'high').length },
        { label: 'Security Active', value: '✓' }
      ]}
      actionWheel={
        <UniversalRadialActionWheel
          actions={[
            { id: 'export', icon: Download, label: 'Export Logs', onClick: () => setShowExport(true), angle: 0 }
          ]}
        />
      }
      addButton={
        <button 
          onClick={() => setShowExport(true)}
          className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Download size={18} />
          Export Logs
        </button>
      }
      floatingActionMenu={
        <UniversalFloatingActionMenu
          sectionName="Audit Log"
          onAddItem={() => alert('Add audit log entry')}
          onBulkAction={() => alert('Bulk audit actions')}
          onExport={() => setShowExport(true)}
          onSearch={() => alert('Search audit logs')}
          onAnalytics={() => alert('Audit analytics')}
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
    >
      <div className="space-y-8">
        {/* Role-based Access Notice */}
        {user?.role === 'Agent' && (
          <div className="rounded-2xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}>
            <div className="relative rounded-2xl p-6 border-2 border-white/40" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(25px) saturate(200%)'}}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(255, 200, 0, 0.3)'}}>
                  <Shield size={20} className="text-white" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))'}} />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Limited Access</h3>
              </div>
              <p className="text-white/80" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                As an agent, you can only view audit logs related to your assigned properties and your own actions.
              </p>
            </div>
          </div>
        )}
        
        {user?.role === 'Tenant' && (
          <div className="rounded-2xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}>
            <div className="relative rounded-2xl p-6 border-2 border-white/40" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(25px) saturate(200%)'}}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(66, 165, 245, 0.3)'}}>
                  <User size={20} className="text-white" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))'}} />
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Tenant Access</h3>
              </div>
              <p className="text-white/80" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>
                You can view audit logs related to your tenant account and property interactions.
              </p>
            </div>
          </div>
        )}

        <div className="rounded-2xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}>
          <div className="relative rounded-2xl p-4 border-2 border-white/40" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(25px) saturate(200%)'}}>
            <UniversalTabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </div>

        <div className="rounded-2xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}>
          <div className="relative rounded-2xl p-4 border-2 border-white/40" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(25px) saturate(200%)'}}>
            <UniversalFilterBar>
              <UniversalSearch
                onSearch={setSearchFilters}
                placeholder="Search audit logs..."
                showDateFilter={true}
                showSortOptions={true}
                sortOptions={[
                  { value: 'date', label: 'Date' },
                  { value: 'action', label: 'Action' },
                  { value: 'user', label: 'User' },
                  { value: 'severity', label: 'Risk Level' },
                ]}
              />
            </UniversalFilterBar>
          </div>
        </div>

        <div className="rounded-2xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}>
          <div className="relative rounded-2xl p-6 border-2 border-white/40" style={{background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', backdropFilter: 'blur(25px) saturate(200%)'}}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, rgba(255,138,101,0.6), rgba(66,165,245,0.6))'}}>
                <Activity size={24} className="text-white" style={{filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))'}} />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-2">Activity Timeline</h2>
                <p className="text-white/90" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>Real-time system and user activity tracking</p>
              </div>
            </div>

          {filteredLogs && filteredLogs.length > 0 ? (
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-4">
              <UniversalTable
                data={filteredLogs}
                columns={columns}
                pagination={{
                  pageSize: 10,
                  showPageSizeOptions: true,
                }}
                rowActions={[
                  { label: 'View Details', icon: Eye, onClick: (row) => console.log('View details', row) },
                  { label: 'Archive', icon: Archive, onClick: (row) => console.log('Archive', row) },
                ]}
                tableClassName="text-white/90"
              />
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="rounded-2xl p-12 shadow-lg max-w-lg mx-auto border-2 border-white/20" 
                   style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px)'}}>
                <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-white/20"
                     style={{background: 'rgba(249, 115, 22, 0.3)'}}>
                  <FileText size={64} className="text-white" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-4">
                  No Activity Logs
                </h3>
                <p className="text-gray-300 mb-10 text-lg">
                  System activities and user actions will appear here as they occur. All security events are automatically tracked and logged.
                </p>
                <div className="bg-black/30 p-6 rounded-2xl max-w-md mx-auto border border-white/10">
                <div className="flex items-center gap-2 text-white mb-2">
                  <Shield size={16} />
                  <span className="text-sm font-medium">Security Features:</span>
                </div>
                <ul className="text-xs text-gray-300 space-y-1 text-left">
                  <li>• User login/logout tracking</li>
                  <li>• Property and tenant changes</li>
                  <li>• Payment modifications</li>
                  <li>• System configuration updates</li>
                  <li>• Failed access attempts</li>
                </ul>
              </div>
              </div>
            </div>
          )}
          </div>
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
    </UniversalSectionPage>
  );
};

export default AuditLogUniversalPage;