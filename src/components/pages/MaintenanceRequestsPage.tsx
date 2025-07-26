'use client';
// frontend/src/pages/MaintenanceRequestsPage.tsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api';
import LazyLoader from '@/components/common/LazyLoader';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import SwipeableCard from '@/components/mobile/SwipeableCard';
import { useBackgroundRefresh } from '@/hooks/useBackgroundRefresh';
import { useWindowSize } from '@/hooks/useWindowSize';
import SearchFilter from '@/components/common/SearchFilter';
import BulkActions from '@/components/common/BulkActions';
import ExportModal from '@/components/common/ExportModal';
import UniversalSearch, { SearchFilters } from '@/components/common/UniversalSearch';
import UniversalExport from '@/components/common/UniversalExport';
import AddMaintenanceModal from '@/components/common/AddMaintenanceModal';
import MessageButtons from '@/components/common/MessageButtons';
import { Wrench, Calendar, Home, AlertCircle, Users, Download, Plus, Eye, CheckCircle } from 'lucide-react';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';
import UniversalActionButton from '@/components/common/UniversalActionButton';
import { useCrossData } from '@/hooks/useCrossData';
import { useDataExport } from '@/hooks/useDataExport';
import { useWorkflowTriggers } from '@/hooks/useWorkflowTriggers';

const fetchRequests = async (propertyId?: string, status?: string, tenantId?: string) => {
    try {
        let url = '/maintenance';
        const params = new URLSearchParams();
        if (propertyId) params.append('propertyId', propertyId);
        if (status) params.append('status', status);
        if (tenantId) params.append('tenantId', tenantId);
        if (params.toString()) url += `?${params.toString()}`;
        
        const { data } = await apiClient.get(url); 
        return data.data || [];
    } catch (error) {
        console.error('Failed to fetch maintenance requests:', error);
        return [];
    }
};

const updateRequestStatus = async ({ id, status }: { id: string, status: string }) => {
    const { data } = await apiClient.put(`/maintenance/${id}`, { status });
    return data.data;
};

const MaintenanceRequestsPage = () => {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const propertyId = searchParams.get('propertyId');
    const statusFilter = searchParams.get('status');
    const tenantId = searchParams.get('tenantId');
    const { stats } = useCrossData();
    const { triggerMaintenanceWorkflow } = useWorkflowTriggers();
    const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<any>({});
    const [showExportModal, setShowExportModal] = useState(false);
    const [showUniversalExport, setShowUniversalExport] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        query: '',
        dateRange: 'all',
        status: '',
        sortBy: 'date',
        sortOrder: 'desc'
    });
    const { exportData } = useDataExport() || { exportData: () => {} };
    const { data: requests = [], isLoading, isError, error } = useQuery({ 
        queryKey: ['maintenanceRequests', propertyId, statusFilter, tenantId], 
        queryFn: () => fetchRequests(propertyId || undefined, statusFilter || undefined, tenantId || undefined),
        retry: 1,
        staleTime: 300000, // 5 minutes
        cacheTime: 600000, // 10 minutes
        refetchOnWindowFocus: false,
        onError: (error) => console.error('Maintenance requests error:', error)
    });
    const { width } = useWindowSize() || { width: 1024 };

    // Enhanced request data with memoized calculations
    const enhancedRequests = useMemo(() => {
        return requests.map((request: any) => {
            const createdDate = new Date(request.createdAt);
            const now = new Date();
            const ageInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            
            // Calculate priority score
            const priorityWeights = {
                'Emergency': 100,
                'Urgent': 80,
                'High': 60,
                'Medium': 40,
                'Low': 20
            };
            
            const baseScore = priorityWeights[request.priority] || 40;
            const urgencyScore = (request.urgencyLevel || 5) * 5;
            const ageScore = Math.min(ageInDays * 2, 50);
            const priorityScore = baseScore + urgencyScore + ageScore;
            
            // Check if overdue
            const isOverdue = request.dueDate && new Date() > new Date(request.dueDate) && request.status !== 'Completed';
            
            return {
                ...request,
                ageInDays,
                priorityScore,
                isOverdue,
                formattedDate: createdDate.toLocaleDateString(),
                statusColor: request.status === 'Open' ? 'red' : 
                           request.status === 'In Progress' ? 'yellow' : 
                           request.status === 'Completed' ? 'green' : 'gray'
            };
        });
    }, [requests]);
    
    const filteredRequests = useMemo(() => {
        if (!enhancedRequests) return [];
        
        return enhancedRequests.filter((request: any) => {
            const matchesSearch = !searchQuery || 
                request.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                request.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                request.requestedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                request.propertyId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                request.location?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = !filters.status || request.status === filters.status;
            const matchesUniversalSearch = !searchFilters.query || 
                request.description?.toLowerCase().includes(searchFilters.query.toLowerCase()) ||
                request.title?.toLowerCase().includes(searchFilters.query.toLowerCase());
            const matchesUniversalStatus = !searchFilters.status || request.status === searchFilters.status;
            
            return matchesSearch && matchesStatus && matchesUniversalSearch && matchesUniversalStatus;
        }).sort((a, b) => {
            // Sort by priority score (higher first), then by age
            if (a.priorityScore !== b.priorityScore) {
                return b.priorityScore - a.priorityScore;
            }
            return b.ageInDays - a.ageInDays;
        });
    }, [enhancedRequests, searchQuery, filters, searchFilters]);

    const filterOptions = [
        {
            key: 'status',
            label: 'Status',
            type: 'select' as const,
            options: [
                { value: 'Open', label: 'Open' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Resolved', label: 'Resolved' },
                { value: 'Closed', label: 'Closed' }
            ]
        }
    ];

    const bulkActions = [
        {
            key: 'export',
            label: 'Export',
            icon: Download,
            color: 'bg-blue-500 hover:bg-blue-600 text-white',
            action: async (ids: string[]) => {
                await exportData('maintenance', 'maintenance-requests', { format: 'xlsx', filters: { ids } });
            }
        },
        {
            key: 'close',
            label: 'Mark Closed',
            icon: AlertCircle,
            color: 'bg-gray-500 hover:bg-gray-600 text-white',
            action: (ids: string[]) => {
                ids.forEach(id => handleStatusChange(id, 'Closed'));
            }
        }
    ];

    const mutation = useMutation({
        mutationFn: updateRequestStatus,
        onSuccess: async (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['maintenanceRequests'] });
            
            // Trigger workflow if completed
            if (variables.status === 'Resolved' || variables.status === 'Closed') {
                const maintenanceData = requests.find(r => r._id === variables.id);
                if (maintenanceData) {
                    await triggerMaintenanceWorkflow(maintenanceData);
                }
            }
        },
        onError: (err: any) => {
            alert(`Failed to update request status: ${err.response?.data?.message || err.message}`);
        }
    });

    const handleStatusChange = (id: string, newStatus: string) => {
        mutation.mutate({ id, status: newStatus });
    };

    const handleRequestAdded = (newRequest: any) => {
        queryClient.setQueryData(['maintenanceRequests'], (old: any) => [...(old || []), newRequest]);
    };

    const getStatusBadge = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'Open': 'bg-brand-primary/20 text-brand-primary',
            'In Progress': 'bg-yellow-500/20 text-yellow-300',
            'Completed': 'bg-green-500/20 text-green-300',
            'Closed': 'bg-gray-500/20 text-gray-300'
        };
        return statusMap[status] || 'bg-gray-500/20 text-gray-300';
    };
    
    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 },
    };

    // Background refresh
    useBackgroundRefresh([['maintenanceRequests']], 60000);

    if (isLoading) return <SkeletonLoader type="card" count={6} />;
    
    if (isError) {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wrench size={32} className="text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-2">Unable to Load Maintenance Requests</h2>
                <p className="text-text-secondary mb-4">We're having trouble connecting to our servers.</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="btn-gradient px-6 py-3 rounded-2xl font-semibold"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const DesktopView = () => (
        <div className="bg-light-card rounded-3xl shadow-lg border border-border-color overflow-hidden dark:bg-dark-card dark:border-border-color-dark">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-light-bg/50 border-b border-border-color dark:bg-dark-bg/50 dark:border-border-color-dark">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Select</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Date</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Tenant</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Property</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Issue</th>
                            <th className="p-4 text-sm font-semibold text-light-text uppercase dark:text-light-text-dark">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color dark:divide-border-color-dark">
                        {filteredRequests.length > 0 ? (
                            filteredRequests.map((req: any) => (
                            <tr key={req._id} className="hover:bg-light-bg/50 transition-colors duration-150 dark:hover:bg-dark-bg/40">
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedRequests.includes(req._id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedRequests(prev => [...prev, req._id]);
                                            } else {
                                                setSelectedRequests(prev => prev.filter(id => id !== req._id));
                                            }
                                        }}
                                        className="w-4 h-4 rounded border-2"
                                    />
                                </td>
                                <td className="p-4 text-light-text dark:text-light-text-dark">{new Date(req.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 font-semibold text-dark-text dark:text-dark-text-dark">{req.requestedBy?.name || 'N/A'}</td>
                                <td className="p-4 text-light-text dark:text-light-text-dark">{req.propertyId?.name || 'N/A'}</td>
                                <td className="p-4 text-light-text dark:text-light-text-dark">{req.description}</td>
                                <td className="p-4">
                                    <select 
                                        value={req.status} 
                                        onChange={(e) => handleStatusChange(req._id, e.target.value)}
                                        className={`border-0 rounded-md py-1 px-2 text-xs font-semibold ${getStatusBadge(req.status)} bg-light-bg dark:bg-dark-card dark:text-dark-text-dark`}
                                        style={{ appearance: 'none' }}
                                        disabled={mutation.isLoading}
                                    >
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </td>
                            </tr>
                        ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-light-text dark:text-light-text-dark">No maintenance requests found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const MobileView = () => (
        <div className="universal-grid universal-grid-3">
            {filteredRequests.map((req: any, index: number) => (
                <LazyLoader key={req._id}>
                    <SwipeableCard
                        onEdit={() => console.log('Edit request', req._id)}
                        onView={() => window.open(`/dashboard/maintenance/${req._id}`, '_blank')}
                    >
                        <UniversalCard delay={index * 0.1} gradient="blue">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Wrench size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary text-lg group-hover:text-brand-blue transition-colors">
                                    {req.description}
                                </h3>
                                <UniversalStatusBadge 
                                    status={req.status}
                                    variant={
                                        req.status === 'Open' ? 'warning' :
                                        req.status === 'In Progress' ? 'info' :
                                        req.status === 'Resolved' ? 'success' : 'default'
                                    }
                                    icon={req.status === 'Resolved' ? CheckCircle : undefined}
                                />
                            </div>
                        </div>
                    </div>
                    <p className="text-light-text text-sm flex items-center gap-2 mb-1"><Home size={14}/> Property: {req.propertyId?.name || 'N/A'}</p>
                    <p className="text-light-text text-sm flex items-center gap-2 mb-2"><Calendar size={14}/> Date: {new Date(req.createdAt).toLocaleDateString()}</p>
                    <p className="text-light-text text-sm flex items-center gap-2 mb-2"><Users size={14}/> Requested By: {req.requestedBy?.name || 'N/A'}</p>
                    
                    <div className="space-y-3">
                        <Link
                            to={`/dashboard/maintenance/${req._id}`}
                            className="w-full gradient-dark-orange-blue text-white py-3 px-4 rounded-2xl text-sm font-semibold transition-all hover:shadow-xl text-center block group-hover:scale-105 transform"
                        >
                            View Details
                        </Link>
                        <div>
                            <label htmlFor={`status-${req._id}`} className="block text-sm font-medium text-light-text mb-1">Update Status:</label>
                            <select 
                                id={`status-${req._id}`}
                                value={req.status} 
                                onChange={(e) => handleStatusChange(req._id, e.target.value)}
                                className="block w-full border border-border-color rounded-md py-2 px-3 text-dark-text bg-light-bg focus:ring-brand-primary focus:border-brand-primary"
                                disabled={mutation.isLoading}
                            >
                                <option value="Open">Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </div>
                        </UniversalCard>
                    </SwipeableCard>
                </LazyLoader>
            ))}
        </div>
    );

    return (
        <div className="text-dark-text dark:text-dark-text-dark space-y-8">
            <UniversalHeader
                title="Maintenance Requests"
                subtitle={
                    propertyId ? `Requests for selected property (${requests.length} requests)` :
                    tenantId ? `Requests for selected tenant (${requests.length} requests)` :
                    `Manage property maintenance requests (${requests.length} total)`
                }
                icon={Wrench}
                stats={[
                    { label: 'Total', value: requests.length, color: 'blue' },
                    { label: 'Open', value: stats?.openMaintenance || 0, color: 'red' },
                    { label: 'In Progress', value: requests.filter(r => r.status === 'In Progress').length, color: 'yellow' },
                    { label: 'Closed', value: requests.filter(r => r.status === 'Closed').length, color: 'green' }
                ]}
                actions={
                    <>
                        <UniversalActionButton
                            variant="success"
                            size="sm"
                            icon={Download}
                            onClick={() => setShowUniversalExport(true)}
                        >
                            Export
                        </UniversalActionButton>
                        <UniversalActionButton
                            variant="primary"
                            icon={Plus}
                            onClick={() => setShowAddModal(true)}
                        >
                            Add Request
                        </UniversalActionButton>
                    </>
                }
            />

            <UniversalSearch
                onSearch={setSearchFilters}
                placeholder="Search maintenance requests..."
                showStatusFilter={true}
                statusOptions={[
                    { value: 'Open', label: 'Open' },
                    { value: 'In Progress', label: 'In Progress' },
                    { value: 'Resolved', label: 'Resolved' },
                    { value: 'Closed', label: 'Closed' }
                ]}
            />
            {requests.length > 0 ? (
                width < 768 ? <MobileView /> : <DesktopView />
            ) : (
                <div className="text-center py-16 bg-light-card rounded-3xl border border-dashed border-border-color dark:bg-dark-card dark:border-border-color-dark">
                    <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark">No Maintenance Requests Found</h3>
                    <p className="text-light-text mt-2 mb-4 dark:text-light-text-dark">You can submit requests from your tenant portal or properties page.</p>
                </div>
            )}

            <BulkActions
                selectedItems={selectedRequests}
                totalItems={filteredRequests?.length || 0}
                onSelectAll={() => setSelectedRequests(filteredRequests?.map((r: any) => r._id) || [])}
                onClearSelection={() => setSelectedRequests([])}
                actions={bulkActions}
            />

            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                section="maintenance"
                title="Maintenance Requests"
            />
            
            <UniversalExport
                isOpen={showUniversalExport}
                onClose={() => setShowUniversalExport(false)}
                data={filteredRequests}
                filename="maintenance-requests"
                filters={searchFilters}
                title="Export Maintenance Requests"
            />

            <AddMaintenanceModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onRequestAdded={handleRequestAdded}
            />
        </div>
    );
};

export default MaintenanceRequestsPage;
