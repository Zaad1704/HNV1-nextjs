'use client';
import React, { useState } from 'react';
import apiClient from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldOff, CheckCircle, XCircle, Settings, Trash2, Crown, CrownIcon, Shield, AlertTriangle } from 'lucide-react';

interface IOrganization { _id: string; name: string; owner: { name: string; email: string; }; status: 'active' | 'inactive' | 'pending_deletion'; subscription?: { _id: string; planId?: { name: string; _id: string; price: number; duration: string; }; status: 'trialing' | 'active' | 'inactive' | 'canceled' | 'past_due'; isLifetime: boolean; currentPeriodEndsAt?: string; }; allowSelfDeletion?: boolean; }
interface IPlan { _id: string; name: string; price: number; duration: 'daily' | 'weekly' | 'monthly' | 'yearly'; }

const fetchOrganizations = async (): Promise<IOrganization[]> => {
    try {
        const { data } = await apiClient.get('/super-admin/organizations');
        return data.data || [];
    } catch (error) {
        console.error('Failed to fetch organizations:', error);
        throw error;
    }
};

const fetchPlans = async (): Promise<IPlan[]> => {
    const { data } = await apiClient.get('/super-admin/plans');
    return data.data;
};

const AdminOrganizationsPage = () => {
    const queryClient = useQueryClient();
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<IOrganization | null>(null);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [subscriptionData, setSubscriptionData] = useState({
        status: 'trialing',
        isLifetime: false,
        trialExpiresAt: '',
        currentPeriodEndsAt: '',
        currentPeriodStartsAt: '',
        nextBillingDate: '',
        cancelAtPeriodEnd: false,
        canceledAt: '',
        currency: 'USD',
        billingCycle: 'monthly',
        paymentMethod: '',
        amount: '',
        lastPaymentDate: '',
        failedPaymentAttempts: 0,
        externalId: '',
        notes: '',
        maxProperties: -1,
        maxTenants: -1,
        maxAgents: -1,
        maxUsers: -1
    });
    const { data: organizations = [], isLoading, isError, error } = useQuery<IOrganization[], Error>({ 
        queryKey:['allOrganizations'], 
        queryFn: fetchOrganizations,
        retry: 3,
        retryDelay: 1000
    });
    const { data: availablePlans = [] } = useQuery<IPlan[], Error>({ queryKey:['availablePlans'], queryFn: fetchPlans });

    const deleteOrgMutation = useMutation({
        mutationFn: (orgId: string) => apiClient.delete(`/super-admin/organizations/${orgId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allOrganizations'] }),
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to delete organization.'),
    });

    const toggleStatusMutation = useMutation({
        mutationFn: ({ orgId, action }: { orgId: string; action: 'activate' | 'deactivate' }) => 
            apiClient.patch(`/super-admin/organizations/${orgId}/${action}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allOrganizations'] }),
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to update organization status.'),
    });

    const lifetimeMutation = useMutation({
        mutationFn: ({ orgId, action }: { orgId: string; action: 'grant-lifetime' | 'revoke-lifetime' }) => 
            apiClient.patch(`/super-admin/organizations/${orgId}/${action}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allOrganizations'] }),
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to update lifetime access.'),
    });

    const updateSubscriptionMutation = useMutation({
        mutationFn: ({ orgId, planId, ...data }: { orgId: string; planId: string; [key: string]: any }) => 
            apiClient.put(`/super-admin/organizations/${orgId}/subscription`, { planId, ...data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allOrganizations'] });
            setShowSubscriptionModal(false);
            alert('Subscription updated successfully!');
        },
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to update subscription.'),
    });

    const handleDeleteOrg = (orgId: string, orgName: string) => {
        if (window.confirm(`Are you sure you want to PERMANENTLY DELETE the organization "${orgName}"? This will delete all associated users, properties, tenants, and billing data. This action cannot be undone.`)) {
            deleteOrgMutation.mutate(orgId);
        }
    };

    if (isLoading) return <div className="text-center p-8 text-text-secondary">Loading organizations...</div>;
    if (isError) return (
        <div className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Failed to Load Organizations</h2>
            <p className="text-text-secondary mb-4">Error: {error?.message || 'Unknown error'}</p>
            <button 
                onClick={() => window.location.reload()}
                className="btn-gradient px-6 py-3 rounded-2xl font-semibold"
            >
                Retry
            </button>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Organizations</h1>
                    <p className="text-text-secondary mt-1">Manage all platform organizations</p>
                </div>
                <div className="text-sm text-text-secondary">
                    Total: {organizations.length} organizations
                </div>
            </div>
            <div className="app-surface rounded-3xl border border-app-border overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-app-bg border-b border-app-border">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-text-secondary">Organization</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary">Plan</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary">Usage</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary">Status</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-app-border">
                        {organizations.map((org) => (
                            <tr key={org._id} className="hover:bg-app-bg transition-colors duration-150">
                                <td className="p-4">
                                    <p className="font-bold text-text-primary">{org.name}</p>
                                    <p className="text-sm text-text-secondary">{org.owner?.email}</p>
                                </td>
                                <td className="p-4">
                                    {org.subscription?.isLifetime 
                                        ? <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800"><ShieldCheck size={14}/> Lifetime</span>
                                        : <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{org.subscription?.planId?.name || 'Free Trial'}</span>
                                    }
                                </td>
                                <td className="p-4">
                                    <div className="text-xs text-text-secondary space-y-1">
                                        <div>Props: {org.subscription?.currentProperties || 0}/{org.subscription?.maxProperties === -1 ? '∞' : org.subscription?.maxProperties || 0}</div>
                                        <div>Users: {org.subscription?.currentUsers || 0}/{org.subscription?.maxUsers === -1 ? '∞' : org.subscription?.maxUsers || 0}</div>
                                    </div>
                                </td>
                                <td className="p-4">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${org.subscription?.status === 'active' || org.subscription?.status === 'trialing' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {org.subscription?.status || 'inactive'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {org.subscription?.status === 'active' ? (
                                            <button 
                                                onClick={() => toggleStatusMutation.mutate({ orgId: org._id, action: 'deactivate' })}
                                                className="p-2 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" 
                                                title="Deactivate"
                                            >
                                                <XCircle size={16}/>
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => toggleStatusMutation.mutate({ orgId: org._id, action: 'activate' })}
                                                className="p-2 rounded-md text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" 
                                                title="Activate"
                                            >
                                                <CheckCircle size={16}/>
                                            </button>
                                        )}
                                        {org.subscription?.isLifetime ? (
                                            <button 
                                                onClick={() => lifetimeMutation.mutate({ orgId: org._id, action: 'revoke-lifetime' })}
                                                className="p-2 rounded-md text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors" 
                                                title="Revoke Lifetime"
                                            >
                                                <ShieldOff size={16}/>
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => lifetimeMutation.mutate({ orgId: org._id, action: 'grant-lifetime' })}
                                                className="p-2 rounded-md text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors" 
                                                title="Grant Lifetime"
                                            >
                                                <Crown size={16}/>
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => {
                                                setSelectedOrg(org);
                                                setShowSubscriptionModal(true);
                                            }}
                                            className="p-2 rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" 
                                            title="Manage Subscription"
                                        >
                                            <Settings size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteOrg(org._id, org.name)} 
                                            className="p-2 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" 
                                            title="Delete Organization Permanently"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Subscription Management Modal */}
            {showSubscriptionModal && selectedOrg && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
                    <div className="app-surface rounded-3xl shadow-app-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-app-border">
                        <div className="flex justify-between items-center p-6 border-b border-app-border">
                            <h2 className="text-xl font-bold text-text-primary">Manage Subscription</h2>
                            <button 
                                onClick={() => setShowSubscriptionModal(false)} 
                                className="text-text-secondary hover:text-text-primary"
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="font-semibold text-text-primary mb-2">{selectedOrg.name}</h3>
                                <p className="text-sm text-text-secondary mb-4">Current Plan: {selectedOrg.subscription?.planId?.name || 'No Plan'}</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Change Plan</label>
                                <select 
                                    value={selectedPlan}
                                    onChange={(e) => setSelectedPlan(e.target.value)}
                                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                >
                                    <option value="">Select a plan</option>
                                    {availablePlans.map(plan => (
                                        <option key={plan._id} value={plan._id}>
                                            {plan.name} - ${plan.price/100}/{plan.duration}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
                                    <select 
                                        value={subscriptionData.status}
                                        onChange={(e) => setSubscriptionData({...subscriptionData, status: e.target.value})}
                                        className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                    >
                                        <option value="trialing">Trialing</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="canceled">Canceled</option>
                                        <option value="past_due">Past Due</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Billing Cycle</label>
                                    <select 
                                        value={subscriptionData.billingCycle}
                                        onChange={(e) => setSubscriptionData({...subscriptionData, billingCycle: e.target.value})}
                                        className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="daily">Daily</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Trial Expires</label>
                                    <input 
                                        type="date"
                                        value={subscriptionData.trialExpiresAt}
                                        onChange={(e) => setSubscriptionData({...subscriptionData, trialExpiresAt: e.target.value})}
                                        className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Next Billing</label>
                                    <input 
                                        type="date"
                                        value={subscriptionData.nextBillingDate}
                                        onChange={(e) => setSubscriptionData({...subscriptionData, nextBillingDate: e.target.value})}
                                        className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Payment Method</label>
                                <input 
                                    type="text"
                                    value={subscriptionData.paymentMethod}
                                    onChange={(e) => setSubscriptionData({...subscriptionData, paymentMethod: e.target.value})}
                                    placeholder="e.g., Stripe, PayPal, Credit Card"
                                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Custom Amount ($)</label>
                                    <input 
                                        type="number"
                                        value={subscriptionData.amount}
                                        onChange={(e) => setSubscriptionData({...subscriptionData, amount: e.target.value})}
                                        placeholder="Leave empty to use plan price"
                                        className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Currency</label>
                                    <select 
                                        value={subscriptionData.currency}
                                        onChange={(e) => setSubscriptionData({...subscriptionData, currency: e.target.value})}
                                        className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                        <option value="CAD">CAD</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Period Start</label>
                                    <input 
                                        type="date"
                                        value={subscriptionData.currentPeriodStartsAt}
                                        onChange={(e) => setSubscriptionData({...subscriptionData, currentPeriodStartsAt: e.target.value})}
                                        className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Period End</label>
                                    <input 
                                        type="date"
                                        value={subscriptionData.currentPeriodEndsAt}
                                        onChange={(e) => setSubscriptionData({...subscriptionData, currentPeriodEndsAt: e.target.value})}
                                        className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Last Payment</label>
                                    <input 
                                        type="date"
                                        value={subscriptionData.lastPaymentDate}
                                        onChange={(e) => setSubscriptionData({...subscriptionData, lastPaymentDate: e.target.value})}
                                        className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Failed Attempts</label>
                                    <input 
                                        type="number"
                                        value={subscriptionData.failedPaymentAttempts}
                                        onChange={(e) => setSubscriptionData({...subscriptionData, failedPaymentAttempts: parseInt(e.target.value) || 0})}
                                        className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">External ID (Stripe, PayPal, etc.)</label>
                                <input 
                                    type="text"
                                    value={subscriptionData.externalId}
                                    onChange={(e) => setSubscriptionData({...subscriptionData, externalId: e.target.value})}
                                    placeholder="External subscription ID"
                                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                />
                            </div>
                            
                            <div className="border-t border-app-border pt-4">
                                <h4 className="font-semibold text-text-primary mb-4">Usage Limits (-1 = Unlimited)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Max Properties</label>
                                        <input 
                                            type="number"
                                            value={subscriptionData.maxProperties}
                                            onChange={(e) => setSubscriptionData({...subscriptionData, maxProperties: parseInt(e.target.value) || -1})}
                                            className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Max Tenants</label>
                                        <input 
                                            type="number"
                                            value={subscriptionData.maxTenants}
                                            onChange={(e) => setSubscriptionData({...subscriptionData, maxTenants: parseInt(e.target.value) || -1})}
                                            className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Max Agents</label>
                                        <input 
                                            type="number"
                                            value={subscriptionData.maxAgents}
                                            onChange={(e) => setSubscriptionData({...subscriptionData, maxAgents: parseInt(e.target.value) || -1})}
                                            className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2">Max Users</label>
                                        <input 
                                            type="number"
                                            value={subscriptionData.maxUsers}
                                            onChange={(e) => setSubscriptionData({...subscriptionData, maxUsers: parseInt(e.target.value) || -1})}
                                            className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Notes</label>
                                <textarea 
                                    value={subscriptionData.notes}
                                    onChange={(e) => setSubscriptionData({...subscriptionData, notes: e.target.value})}
                                    placeholder="Internal notes about this subscription"
                                    rows={3}
                                    className="w-full p-3 border border-app-border rounded-2xl bg-app-surface"
                                />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <label className="flex items-center gap-2">
                                    <input 
                                        type="checkbox"
                                        checked={subscriptionData.isLifetime}
                                        onChange={(e) => setSubscriptionData({...subscriptionData, isLifetime: e.target.checked})}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm">Lifetime Access</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input 
                                        type="checkbox"
                                        checked={subscriptionData.cancelAtPeriodEnd}
                                        onChange={(e) => setSubscriptionData({...subscriptionData, cancelAtPeriodEnd: e.target.checked})}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span className="text-sm">Cancel at Period End</span>
                                </label>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Canceled Date</label>
                                    <input 
                                        type="date"
                                        value={subscriptionData.canceledAt}
                                        onChange={(e) => setSubscriptionData({...subscriptionData, canceledAt: e.target.value})}
                                        className="w-full p-2 border border-app-border rounded-xl bg-app-surface text-sm"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    onClick={() => setShowSubscriptionModal(false)}
                                    className="px-6 py-3 rounded-2xl border border-app-border text-text-secondary hover:text-text-primary"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        if (selectedPlan) {
                                            updateSubscriptionMutation.mutate({
                                                orgId: selectedOrg._id,
                                                planId: selectedPlan,
                                                ...subscriptionData
                                            });
                                        } else {
                                            alert('Please select a plan');
                                        }
                                    }}
                                    disabled={updateSubscriptionMutation.isPending}
                                    className="btn-gradient px-6 py-3 rounded-2xl disabled:opacity-50"
                                >
                                    {updateSubscriptionMutation.isPending ? 'Updating...' : 'Update Subscription'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrganizationsPage;
