'use client';
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, DollarSign, Calendar, MapPin, Phone, Mail, FileText, Wrench, AlertTriangle, Download, Edit, Trash2, Archive, ArchiveRestore, User } from 'lucide-react';
import PropertyStyleBackground from '@/components/common/PropertyStyleBackground';
import PropertyStyleCard from '@/components/common/PropertyStyleCard';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';
import UniversalActionButton from '@/components/common/UniversalActionButton';

import TenantAnalyticsDashboard from '@/components/tenant/TenantAnalyticsDashboard';
import EditTenantModal from '@/components/common/EditTenantModal';
import QuickPaymentModal from '@/components/common/QuickPaymentModal';
import EnhancedTenantQuickActions from '@/components/tenant/EnhancedTenantQuickActions';

const TenantDetailsPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQuickPayment, setShowQuickPayment] = useState(false);
  const [paymentType, setPaymentType] = useState<'normal' | 'overdue'>('normal');

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/tenants/${tenantId}`);
      return data.data;
    },
    enabled: !!tenantId
  });

  const { data: relatedData } = useQuery({
    queryKey: ['tenantRelatedData', tenantId],
    queryFn: async () => {
      const [payments, expenses, maintenance, approvals, receipts, cashFlow, reminders, auditLogs] = await Promise.all([
        apiClient.get(`/payments?tenantId=${tenantId}`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/expenses?tenantId=${tenantId}`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/maintenance?tenantId=${tenantId}`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/approvals?tenantId=${tenantId}`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/receipts?tenantId=${tenantId}`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/cashflow?tenantId=${tenantId}`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/reminders?tenantId=${tenantId}&status=active`).catch(() => ({ data: { data: [] } })),
        apiClient.get(`/audit?resourceId=${tenantId}&limit=10`).catch(() => ({ data: { data: [] } }))
      ]);

      return {
        payments: payments.data.data || [],
        expenses: expenses.data.data || [],
        maintenance: maintenance.data.data || [],
        approvals: approvals.data.data || [],
        receipts: receipts.data.data || [],
        cashFlow: cashFlow.data.data || [],
        reminders: reminders.data.data || [],
        auditLogs: auditLogs.data.data || []
      };
    },
    enabled: !!tenantId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading tenant details...</span>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-text-primary mb-2">Tenant Not Found</h3>
        <Link to="/dashboard/tenants" className="btn-gradient px-6 py-3 rounded-2xl font-semibold">
          Back to Tenants
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'payments', label: 'Payment History', icon: DollarSign },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'analytics', label: 'Analytics', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'personal', label: 'Personal Details', icon: User }
  ];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const payments = relatedData?.payments || [];
  const totalPaid = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const currentMonthPayment = payments.find((p: any) => {
    const paymentDate = new Date(p.paymentDate);
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
  });
  const outstandingAmount = currentMonthPayment ? 0 : (tenant.rentAmount || 0);
  const monthsPaid = payments.length;
  const leaseStartDate = tenant.createdAt ? new Date(tenant.createdAt) : null;
  const monthsSinceStart = leaseStartDate ? 
    (currentYear - leaseStartDate.getFullYear()) * 12 + (currentMonth - leaseStartDate.getMonth()) + 1 : 0;
  
  // Calculate overdue payments
  const monthsOverdue = Math.max(0, monthsSinceStart - monthsPaid);
  const overdueAmount = monthsOverdue * (tenant.rentAmount || 0);
  const hasOverdue = monthsOverdue > 0;

  return (
    <PropertyStyleBackground>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 p-6">
      {/* Header - Styled like Property Details Page */}
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
              <Link 
                to="/dashboard/tenants"
                className="p-2 rounded-xl icon-button scrim-button" 
              >
                <ArrowLeft size={20} className="text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">{tenant.name}</h1>
                <div className="flex items-center gap-2 text-white/90 mt-1">
                  <User size={16} />
                  <span>Tenant Details</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  try {
                    const response = await apiClient.get(`/api/tenant-pdf/${tenantId}/details-pdf`, { responseType: 'blob' });
                    const blob = new Blob([response.data], { type: 'application/pdf' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${tenant.name}-details.pdf`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  } catch (error) {
                    console.error('PDF download error:', error);
                    alert('Failed to download PDF');
                  }
                }}
                className="icon-button scrim-button w-12 h-12 rounded-full"
              >
                <Download size={18} />
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="icon-button scrim-button w-12 h-12 rounded-full"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={async () => {
                  const isCurrentlyArchived = tenant.status === 'Archived';
                  const action = isCurrentlyArchived ? 'restore' : 'archive';
                  const confirmMessage = isCurrentlyArchived 
                    ? `Restore ${tenant.name}? This will make them active again.`
                    : `Archive ${tenant.name}? This will hide them from active listings.`;
                  
                  if (confirm(confirmMessage)) {
                    try {
                      await apiClient.put(`/tenants/${tenantId}`, {
                        status: isCurrentlyArchived ? 'Active' : 'Archived'
                      });
                      alert(`Tenant ${action}d successfully!`);
                      // Refresh the page to show updated status
                      window.location.reload();
                    } catch (error: any) {
                      alert(`Failed to ${action} tenant: ${error.response?.data?.message || 'Unknown error'}`);
                    }
                  }
                }}
                className={`icon-button scrim-button w-12 h-12 rounded-full`}
              >
                {tenant.status === 'Archived' ? <ArchiveRestore size={18} /> : <Archive size={18} />}
              </button>
              <button
                onClick={async () => {
                  if (confirm(`Delete ${tenant.name}? This action cannot be undone and will remove all associated data.`)) {
                    try {
                      await apiClient.delete(`/tenants/${tenantId}`);
                      alert('Tenant deleted successfully!');
                      // Navigate back to tenants page
                      window.location.href = '/dashboard/tenants';
                    } catch (error: any) {
                      alert(`Failed to delete tenant: ${error.response?.data?.message || 'Unknown error'}`);
                    }
                  }
                }}
                className="icon-button scrim-button w-12 h-12 rounded-full"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/20">
        <nav className="flex space-x-4 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button scrim-button flex items-center gap-2 transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'active'
                    : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeTab === tab.id ? 'bg-blue-500/30' : 'bg-white/10'}`}>
                  <Icon size={16} className="text-white" />
                </div>
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Lease Information */}
              <PropertyStyleCard gradient="primary">
                <h3 className="text-lg font-bold mb-4 text-white/90">Lease Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'}}>
                    <p className="text-xs text-white/70 mb-1">Property</p>
                    <p className="font-medium text-white text-sm line-clamp-2">{tenant.propertyId?.name || tenant.property?.name || 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'}}>
                    <p className="text-xs text-white/70 mb-1">Unit</p>
                    <p className="font-medium text-white text-sm">Unit {tenant.unit || 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'}}>
                    <p className="text-xs text-white/70 mb-1">Monthly Rent</p>
                    <p className="font-medium text-green-400 text-sm">${tenant.rentAmount || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'}}>
                    <p className="text-xs text-white/70 mb-1">Lease Start</p>
                    <p className="font-medium text-white text-sm">{leaseStartDate?.toLocaleDateString() || 'N/A'}</p>
                  </div>
                  {tenant.leaseEndDate && (
                    <>
                      <div className="p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'}}>
                        <p className="text-xs text-white/70 mb-1">Lease End</p>
                        <p className="font-medium text-white text-sm">{new Date(tenant.leaseEndDate).toLocaleDateString()}</p>
                      </div>
                      <div className="p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'}}>
                        <p className="text-xs text-white/70 mb-1">Days Remaining</p>
                        <p className="font-medium text-orange-400 text-sm">
                          {Math.ceil((new Date(tenant.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </PropertyStyleCard>

              {/* Payment Summary */}
              <PropertyStyleCard gradient="secondary">
                <h3 className="text-lg font-bold mb-4 text-white/90">Payment Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-xl" style={{background: 'rgba(52, 211, 153, 0.2)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'}}>
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <Calendar size={20} className="text-green-300" />
                    </div>
                    <p className="text-2xl font-bold text-green-400">{monthsPaid}</p>
                    <p className="text-xs text-green-200 mt-1">Months Paid</p>
                  </div>
                  <div className="text-center p-4 rounded-xl" style={{background: 'rgba(59, 130, 246, 0.2)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'}}>
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <Calendar size={20} className="text-blue-300" />
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{monthsSinceStart - monthsPaid}</p>
                    <p className="text-xs text-blue-200 mt-1">Months Due</p>
                  </div>
                  <div className="text-center p-4 rounded-xl" style={{background: 'rgba(139, 92, 246, 0.2)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'}}>
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <DollarSign size={20} className="text-purple-300" />
                    </div>
                    <p className="text-2xl font-bold text-purple-400">${totalPaid}</p>
                    <p className="text-xs text-purple-200 mt-1">Total Paid</p>
                  </div>
                  <div className="text-center p-4 rounded-xl" style={{background: 'rgba(239, 68, 68, 0.2)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'}}>
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{background: 'rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <AlertTriangle size={20} className="text-red-300" />
                    </div>
                    <p className="text-2xl font-bold text-red-400">${outstandingAmount}</p>
                    <p className="text-xs text-red-200 mt-1">Outstanding</p>
                  </div>
                </div>
              </PropertyStyleCard>

              {/* Recent Receipts */}
              <PropertyStyleCard gradient="primary">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white/90">Recent Receipts</h3>
                  <Link to={`/dashboard/receipts?tenantId=${tenantId}`} className="text-blue-400 text-sm hover:text-blue-300 transition-colors">View All</Link>
                </div>
                <div className="space-y-3">
                  {relatedData?.receipts?.slice(0, 3).map((receipt: any) => (
                    <div key={receipt._id} className="flex justify-between items-center p-4 rounded-lg" style={{background: 'rgba(59, 130, 246, 0.2)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'}}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                          <DollarSign size={18} className="text-blue-300" />
                        </div>
                        <div>
                          <p className="font-medium text-white">${receipt.amount}</p>
                          <p className="text-xs text-white/70">{new Date(receipt.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(`/api/receipts/${receipt._id}/download`, '_blank')}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:scale-110 transition-all duration-300 border border-white/20 shadow-lg"
                        style={{backdropFilter: 'blur(15px)'}}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  )) || (
                    <p className="text-white/70 text-center py-4">No receipts available</p>
                  )}
                </div>
              </PropertyStyleCard>

              {/* Cash Flow Analysis */}
              <PropertyStyleCard gradient="dark">
                <h3 className="text-lg font-bold mb-4 text-white/90">Cash Flow Analysis</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 rounded-lg" style={{background: 'rgba(52, 211, 153, 0.2)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'}}>
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 20V4M12 4L6 10M12 4L18 10" stroke="#A7F3D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-xl font-bold text-green-400">
                      ${relatedData?.cashFlow?.filter((cf: any) => cf.type === 'income').reduce((sum: number, cf: any) => sum + cf.amount, 0) || 0}
                    </p>
                    <p className="text-xs text-green-200 mt-1">Total Income</p>
                  </div>
                  <div className="text-center p-4 rounded-lg" style={{background: 'rgba(239, 68, 68, 0.2)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'}}>
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{background: 'rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4V20M12 20L6 14M12 20L18 14" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-xl font-bold text-red-400">
                      ${relatedData?.cashFlow?.filter((cf: any) => cf.type === 'expense').reduce((sum: number, cf: any) => sum + cf.amount, 0) || 0}
                    </p>
                    <p className="text-xs text-red-200 mt-1">Total Expenses</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {relatedData?.cashFlow?.slice(0, 3).map((flow: any) => (
                    <div key={flow._id} className="flex justify-between items-center p-4 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'}}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background: flow.type === 'income' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)'}}>
                          {flow.type === 'income' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 20V4M12 4L6 10M12 4L18 10" stroke={flow.type === 'income' ? '#A7F3D0' : '#FCA5A5'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 4V20M12 20L6 14M12 20L18 14" stroke={flow.type === 'income' ? '#A7F3D0' : '#FCA5A5'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{flow.description}</p>
                          <p className="text-xs text-white/70">{new Date(flow.transactionDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full ${flow.type === 'income' ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                        <span className={`font-bold text-sm ${flow.type === 'income' ? 'text-green-300' : 'text-red-300'}`}>
                          {flow.type === 'income' ? '+' : '-'}${flow.amount}
                        </span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-white/70 text-center py-4">No cash flow data</p>
                  )}
                </div>
              </PropertyStyleCard>

              {/* Active Reminders */}
              <PropertyStyleCard gradient="secondary">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white/90">Active Reminders</h3>
                  <span className="bg-orange-500/30 text-orange-200 px-3 py-1 rounded-full text-xs font-medium border border-orange-400/30">
                    {relatedData?.reminders?.length || 0}
                  </span>
                </div>
                <div className="space-y-3">
                  {relatedData?.reminders?.slice(0, 3).map((reminder: any) => (
                    <div key={reminder._id} className="p-3 rounded-lg border-l-4 border-orange-400" style={{background: 'rgba(251, 146, 60, 0.2)', backdropFilter: 'blur(10px)'}}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-white text-sm">{reminder.message}</p>
                          <p className="text-xs text-white/70">Next: {new Date(reminder.nextRunDate).toLocaleDateString()}</p>
                          <span className="text-xs bg-orange-500/30 text-orange-200 px-2 py-1 rounded mt-2 inline-block">{reminder.frequency}</span>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await apiClient.put(`/reminders/${reminder._id}`, { status: 'completed' });
                              window.location.reload();
                            } catch (error) {
                              alert('Failed to complete reminder');
                            }
                          }}
                          className="icon-button scrim-button w-8 h-8 rounded-full"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )) || (
                    <p className="text-white/70 text-center py-4">No active reminders</p>
                  )}
                </div>
              </PropertyStyleCard>

              {/* Pending Approvals */}
              <PropertyStyleCard gradient="primary">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white/90">Pending Approvals</h3>
                  <span className="bg-yellow-500/30 text-yellow-200 px-3 py-1 rounded-full text-xs font-medium border border-yellow-400/30">
                    {relatedData?.approvals?.filter((a: any) => a.status === 'pending').length || 0}
                  </span>
                </div>
                <div className="space-y-3">
                  {relatedData?.approvals?.filter((a: any) => a.status === 'pending').slice(0, 3).map((approval: any) => (
                    <div key={approval._id} className="p-3 rounded-lg border-l-4 border-yellow-400" style={{background: 'rgba(250, 204, 21, 0.2)', backdropFilter: 'blur(10px)'}}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-white text-sm">{approval.description}</p>
                          <p className="text-xs text-white/70">Requested: {new Date(approval.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await apiClient.put(`/approvals/${approval._id}`, { status: 'approved' });
                                window.location.reload();
                              } catch (error) {
                                alert('Failed to approve request');
                              }
                            }}
                            className="icon-button scrim-button w-8 h-8 rounded-full"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await apiClient.put(`/approvals/${approval._id}`, { status: 'rejected' });
                                window.location.reload();
                              } catch (error) {
                                alert('Failed to reject request');
                              }
                            }}
                            className="icon-button scrim-button w-8 h-8 rounded-full"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )) || (
                    <p className="text-white/70 text-center py-4">No pending approvals</p>
                  )}
                </div>
              </PropertyStyleCard>

              {/* Recent Audit Logs */}
              <PropertyStyleCard gradient="dark">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white/90">Recent Activity</h3>
                  <Link to={`/dashboard/audit?tenantId=${tenantId}`} className="text-blue-400 text-sm hover:text-blue-300 transition-colors">View All</Link>
                </div>
                <div className="space-y-2">
                  {relatedData?.auditLogs?.slice(0, 5).map((log: any) => (
                    <div key={log._id} className="flex items-center gap-3 p-3 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                      <div className={`w-3 h-3 rounded-full ${
                        log.severity === 'high' ? 'bg-red-400' :
                        log.severity === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{log.description}</p>
                        <p className="text-xs text-white/70">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-white/70 text-center py-4">No recent activity</p>
                  )}
                </div>
              </PropertyStyleCard>

            </div>
          )}

          {activeTab === 'payments' && (
            <PropertyStyleCard gradient="secondary">
              <h3 className="text-lg font-bold mb-4 text-white/90">Payment History</h3>
              <div className="space-y-3">
                {payments.length > 0 ? payments.map((payment: any) => (
                  <div key={payment._id} className="flex justify-between items-center p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                    <div>
                      <p className="font-medium text-white">${payment.amount}</p>
                      <p className="text-xs text-white/70">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <UniversalStatusBadge 
                        status={payment.status} 
                        variant={payment.status === 'Paid' ? 'success' : 'warning'}
                      />
                      <button
                        onClick={() => window.open(`/api/payments/${payment._id}/receipt`, '_blank')}
                        className="icon-button scrim-button w-9 h-9 rounded-full"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)'}}>
                    <DollarSign size={36} className="mx-auto text-white/40 mb-3" />
                    <p className="text-white/70 mb-2">No payment history available</p>
                    <button
                      onClick={() => {
                        setPaymentType('normal');
                        setShowQuickPayment(true);
                      }}
                      className="action-button scrim-button rounded-xl px-4 py-2"
                    >
                      Add First Payment
                    </button>
                  </div>
                )}
              </div>
            </PropertyStyleCard>
          )}

          {activeTab === 'maintenance' && (
            <PropertyStyleCard gradient="primary">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white/90">Maintenance Requests ({relatedData?.maintenance?.length || 0})</h3>
                <div className="flex gap-2">
                  <Link 
                    to={`/dashboard/maintenance?tenantId=${tenantId}`}
                    className="action-button scrim-button rounded-xl"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 12H16M16 12L12 8M16 12L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    View All
                  </Link>
                  <button
                    onClick={async () => {
                      const description = prompt('Describe the maintenance issue:');
                      if (description) {
                        const priority = prompt('Priority (Low/Medium/High):', 'Medium');
                        const category = prompt('Category (optional):');
                        try {
                          await apiClient.post('/maintenance', {
                            tenantId: tenant._id,
                            propertyId: tenant.propertyId?._id || tenant.propertyId,
                            description,
                            priority: priority || 'Medium',
                            category
                          });
                          alert('Maintenance request created successfully!');
                          window.location.reload();
                        } catch (error: any) {
                          alert(`Failed to create request: ${error.response?.data?.message || 'Unknown error'}`);
                        }
                      }
                    }}
                    className="action-button scrim-button rounded-xl"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    New Request
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {relatedData?.maintenance?.length > 0 ? (
                  relatedData.maintenance.map((request: any) => (
                    <div key={request._id} className="p-4 rounded-xl border-l-4 border-orange-400" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-white text-base mb-1">{request.description}</h4>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-white/70">
                            <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              request.priority === 'High' ? 'bg-red-500/30 text-red-200' :
                              request.priority === 'Medium' ? 'bg-yellow-500/30 text-yellow-200' :
                              'bg-green-500/30 text-green-200'
                            }`}>
                              {request.priority} Priority
                            </span>
                            {request.category && <span className="bg-blue-500/30 text-blue-200 px-2 py-1 rounded text-xs">Category: {request.category}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <UniversalStatusBadge 
                            status={request.status}
                            variant={
                              request.status === 'Completed' ? 'success' :
                              request.status === 'In Progress' ? 'warning' :
                              request.status === 'Cancelled' ? 'error' : 'info'
                            }
                          />
                          <button
                            onClick={async () => {
                              const newStatus = prompt('Update status (Open/In Progress/Completed/Cancelled):', request.status);
                              if (newStatus && ['Open', 'In Progress', 'Completed', 'Cancelled'].includes(newStatus)) {
                                try {
                                  await apiClient.put(`/maintenance/${request._id}`, { status: newStatus });
                                  alert('Status updated successfully!');
                                  window.location.reload();
                                } catch (error: any) {
                                  alert(`Failed to update: ${error.response?.data?.message || 'Unknown error'}`);
                                }
                              }
                            }}
                            className="icon-button scrim-button w-8 h-8 rounded-full"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </div>
                      {request.notes && (
                        <div className="mt-2 p-2 rounded text-sm" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
                          <span className="text-blue-300 font-medium">Notes:</span> <span className="text-white/80">{request.notes}</span>
                        </div>
                      )}
                      {(request.estimatedCost || request.actualCost) && (
                        <div className="mt-2 flex flex-wrap gap-4 text-xs">
                          {request.estimatedCost && <span className="bg-purple-500/30 text-purple-200 px-2 py-1 rounded">Estimated: ${request.estimatedCost}</span>}
                          {request.actualCost && <span className="bg-green-500/30 text-green-200 px-2 py-1 rounded">Actual: ${request.actualCost}</span>}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)'}}>
                    <Wrench size={48} className="mx-auto text-white/40 mb-4" />
                    <h4 className="text-lg font-medium text-white/90 mb-2">No Maintenance Requests</h4>
                    <p className="text-white/70 mb-4">This tenant has no maintenance requests yet.</p>
                    <button
                      onClick={async () => {
                        const description = prompt('Describe the maintenance issue:');
                        if (description) {
                          try {
                            await apiClient.post('/maintenance', {
                              tenantId: tenant._id,
                              propertyId: tenant.propertyId?._id || tenant.propertyId,
                              description,
                              priority: 'Medium'
                            });
                            alert('Maintenance request created successfully!');
                            window.location.reload();
                          } catch (error: any) {
                            alert(`Failed to create request: ${error.response?.data?.message || 'Unknown error'}`);
                          }
                        }
                      }}
                      className="action-button scrim-button rounded-xl px-4 py-2"
                    >
                      Create First Request
                    </button>
                  </div>
                )}
              </div>
            </PropertyStyleCard>
          )}

          {activeTab === 'analytics' && (
            <PropertyStyleCard gradient="dark">
              <TenantAnalyticsDashboard tenantId={tenantId!} tenant={tenant} />
            </PropertyStyleCard>
          )}

          {activeTab === 'documents' && (
            <PropertyStyleCard gradient="primary">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white/90">Documents & Images</h3>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const description = prompt('Enter document description:');
                        if (description) {
                          try {
                            const formData = new FormData();
                            formData.append('document', file);
                            formData.append('description', description);
                            formData.append('tenantId', tenant._id);
                            
                            await apiClient.post('/upload/document', formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            alert('Document uploaded successfully!');
                            window.location.reload();
                          } catch (error: any) {
                            alert(`Failed to upload document: ${error.response?.data?.message || 'Unknown error'}`);
                          }
                        }
                      }
                    }}
                    className="hidden"
                    id="document-upload"
                  />
                  <label
                    htmlFor="document-upload"
                    className="action-button scrim-button rounded-xl cursor-pointer"
                  >
                    <FileText size={14} />
                    Upload Document
                  </label>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const description = prompt('Enter image description:');
                        if (description) {
                          try {
                            const formData = new FormData();
                            formData.append('image', file);
                            formData.append('description', description);
                            formData.append('tenantId', tenant._id);
                            
                            await apiClient.post('/upload/tenant-image', formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            alert('Image uploaded successfully!');
                            window.location.reload();
                          } catch (error: any) {
                            alert(`Failed to upload image: ${error.response?.data?.message || 'Unknown error'}`);
                          }
                        }
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="action-button scrim-button rounded-xl cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                      <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Upload Image
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tenant Photo */}
                {(tenant.tenantImage || tenant.imageUrl) && (
                  <div className="border-2 border-white/20 rounded-xl p-4 hover:border-blue-300 transition-colors" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                    <div className="aspect-square mb-3 rounded-lg overflow-hidden" style={{background: 'rgba(255, 255, 255, 0.05)'}}>
                      <img 
                        src={tenant.tenantImage || tenant.imageUrl} 
                        alt="Tenant Photo" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm font-semibold text-white mb-2">Tenant Photo</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => window.open(tenant.tenantImage || tenant.imageUrl, '_blank')}
                        className="flex-1 download-button scrim-button rounded-lg"
                      >
                        View Full Size
                      </button>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = tenant.tenantImage || tenant.imageUrl;
                          link.download = `${tenant.name}-photo.jpg`;
                          link.click();
                        }}
                        className="flex-1 download-button scrim-button rounded-lg"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Government ID Front */}
                {tenant.govtIdFront && (
                  <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                    <div className="aspect-[3/2] mb-3 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={tenant.govtIdFront} 
                        alt="Government ID Front" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">Government ID (Front)</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => window.open(tenant.govtIdFront, '_blank')}
                        className="flex-1 download-button scrim-button rounded-lg"
                      >
                        View Full Size
                      </button>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = tenant.govtIdFront;
                          link.download = `${tenant.name}-id-front.jpg`;
                          link.click();
                        }}
                        className="flex-1 text-xs bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Government ID Back */}
                {tenant.govtIdBack && (
                  <div className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                    <div className="aspect-[3/2] mb-3 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={tenant.govtIdBack} 
                        alt="Government ID Back" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                          }
                        }}
                      />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">Government ID (Back)</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => window.open(tenant.govtIdBack, '_blank')}
                        className="flex-1 text-xs bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        View Full Size
                      </button>
                      <button 
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = tenant.govtIdBack;
                          link.download = `${tenant.name}-id-back.jpg`;
                          link.click();
                        }}
                        className="flex-1 text-xs bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Additional Adult Images */}
                {tenant.additionalAdults && tenant.additionalAdults.length > 0 && tenant.additionalAdults.map((adult: any, index: number) => (
                  adult.image && (
                    <div key={`adult-${index}`} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                      <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={adult.image} 
                          alt={`${adult.name || `Adult ${index + 1}`} Photo`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                            }
                          }}
                        />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-2">{adult.name || `Adult ${index + 1}`} Photo</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.open(adult.image, '_blank')}
                          className="flex-1 text-xs bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          View Full Size
                        </button>
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = adult.image;
                            link.download = `${adult.name || `adult-${index + 1}`}-photo.jpg`;
                            link.click();
                          }}
                          className="flex-1 text-xs bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  )
                ))}
              </div>
              
              {/* Uploaded Documents Section */}
              {tenant.documents && tenant.documents.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Uploaded Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tenant.documents.map((doc: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <FileText size={24} className="text-blue-500" />
                          <div className="flex-1">
                            <p className="font-medium">{doc.description}</p>
                            <p className="text-sm text-gray-500">{doc.filename}</p>
                          </div>
                          <button
                            onClick={() => window.open(doc.url, '_blank')}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Uploaded Images Section */}
              {tenant.uploadedImages && tenant.uploadedImages.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Uploaded Images</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tenant.uploadedImages.map((img: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <img src={img.url} alt={img.description} className="w-full h-32 object-cover rounded mb-2" />
                        <p className="text-sm font-medium">{img.description}</p>
                        <button
                          onClick={() => window.open(img.url, '_blank')}
                          className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          View Full Size
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* No Documents Message */}
              {!tenant.tenantImage && !tenant.imageUrl && !tenant.govtIdFront && !tenant.govtIdBack && 
               (!tenant.additionalAdults || tenant.additionalAdults.length === 0 || !tenant.additionalAdults.some((adult: any) => adult.image)) &&
               (!tenant.documents || tenant.documents.length === 0) && (!tenant.uploadedImages || tenant.uploadedImages.length === 0) && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Available</h3>
                  <p className="text-gray-500 mb-4">Use the upload buttons above to add documents and images.</p>
                </div>
              )}
            </PropertyStyleCard>
          )}

          {activeTab === 'personal' && (
            <PropertyStyleCard gradient="secondary">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white/90">Complete Personal Details</h3>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        console.log('Starting complete package PDF download for tenant:', tenantId);
                        
                        const token = localStorage.getItem('token');
                        if (!token) {
                          alert('Please log in to download PDF');
                          window.location.href = '/login';
                          return;
                        }
                        
                        const response = await apiClient.get(`/api/tenant-pdf/${tenantId}/complete-package`, { 
                          responseType: 'blob',
                          timeout: 30000
                        });
                        
                        if (response.data.size === 0) {
                          throw new Error('Empty PDF file received');
                        }
                        
                        const blob = new Blob([response.data], { type: 'application/pdf' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}-complete-data.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        
                        console.log('Complete package PDF download completed successfully');
                      } catch (error: any) {
                        console.error('Complete data download error:', error);
                        
                        let errorMessage = 'Failed to download complete data';
                        
                        if (error.response?.status === 401) {
                          errorMessage = 'Authentication failed - please log in again';
                          localStorage.removeItem('token');
                          window.location.href = '/login';
                          return;
                        } else if (error.response?.status === 500) {
                          errorMessage = 'Server error - please try again later';
                        } else if (error.request) {
                          errorMessage = 'Cannot connect to server - please check if the backend is running';
                        }
                        
                        alert(errorMessage);
                      }
                    }}
                    className="action-button scrim-button rounded-xl"
                  >
                    <Download size={16} />
                    Download All Data
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        console.log('Starting personal details PDF download for tenant:', tenantId);
                        
                        // Check if user is authenticated
                        const token = localStorage.getItem('token');
                        if (!token) {
                          alert('Please log in to download PDF');
                          window.location.href = '/login';
                          return;
                        }
                        
                        console.log('Token exists, making API request...');
                        const response = await apiClient.get(`/api/tenant-pdf/${tenantId}/personal-details-pdf`, { 
                          responseType: 'blob',
                          timeout: 30000 // 30 second timeout
                        });
                        
                        console.log('API response received:', response.status);
                        
                        if (response.data.size === 0) {
                          throw new Error('Empty PDF file received');
                        }
                        
                        const blob = new Blob([response.data], { type: 'application/pdf' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}-personal-details.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        
                        console.log('PDF download completed successfully');
                      } catch (error: any) {
                        console.error('Personal details PDF download error:', error);
                        
                        let errorMessage = 'Failed to download personal details PDF';
                        
                        if (error.code === 'ECONNABORTED') {
                          errorMessage = 'Request timeout - server may be slow or down';
                        } else if (error.response) {
                          const status = error.response.status;
                          if (status === 401) {
                            errorMessage = 'Authentication failed - please log in again';
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                            return;
                          } else if (status === 403) {
                            errorMessage = 'Access denied - you may not have permission to view this tenant';
                          } else if (status === 404) {
                            errorMessage = 'Tenant not found or PDF service unavailable';
                          } else if (status === 500) {
                            errorMessage = 'Server error - please try again later';
                          } else {
                            errorMessage = `Server error (${status}) - ${error.response.data?.message || 'Unknown error'}`;
                          }
                        } else if (error.request) {
                          errorMessage = 'Cannot connect to server - please check if the backend is running';
                        }
                        
                        alert(errorMessage);
                        console.log('Error details:', {
                          message: error.message,
                          status: error.response?.status,
                          data: error.response?.data,
                          config: error.config
                        });
                      }
                    }}
                    className="action-button scrim-button rounded-xl"
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                </div>
              </div>
              
              <div className="space-y-8">
                {/* Photos Section */}
                <div>
                  <h4 className="font-semibold mb-4 text-lg border-b border-white/20 pb-2 text-white/90">Photos & Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Main Tenant Photo */}
                    {(tenant.tenantImage || tenant.imageUrl) && (
                      <div className="text-center">
                        <img 
                          src={tenant.tenantImage || tenant.imageUrl} 
                          alt="Tenant Photo" 
                          className="w-32 h-32 object-cover rounded-lg mx-auto mb-2 border-2 border-gray-200"
                        />
                        <p className="text-sm font-medium mb-2">Main Tenant Photo</p>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = tenant.tenantImage || tenant.imageUrl;
                            link.download = `${tenant.name}-photo.jpg`;
                            link.click();
                          }}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                          <Download size={12} className="inline mr-1" />Download
                        </button>
                      </div>
                    )}
                    
                    {/* Government IDs */}
                    {tenant.govtIdFront && (
                      <div className="text-center">
                        <img 
                          src={tenant.govtIdFront} 
                          alt="ID Front" 
                          className="w-32 h-20 object-cover rounded-lg mx-auto mb-2 border-2 border-gray-200"
                        />
                        <p className="text-sm font-medium mb-2">Government ID (Front)</p>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = tenant.govtIdFront;
                            link.download = `${tenant.name}-id-front.jpg`;
                            link.click();
                          }}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                          <Download size={12} className="inline mr-1" />Download
                        </button>
                      </div>
                    )}
                    
                    {tenant.govtIdBack && (
                      <div className="text-center">
                        <img 
                          src={tenant.govtIdBack} 
                          alt="ID Back" 
                          className="w-32 h-20 object-cover rounded-lg mx-auto mb-2 border-2 border-gray-200"
                        />
                        <p className="text-sm font-medium mb-2">Government ID (Back)</p>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = tenant.govtIdBack;
                            link.download = `${tenant.name}-id-back.jpg`;
                            link.click();
                          }}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                          <Download size={12} className="inline mr-1" />Download
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-lg border-b border-white/20 pb-2 text-white/90">Basic Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between p-2 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}><span className="text-white/70">Full Name:</span> <span className="font-medium text-white">{tenant.name}</span></div>
                      <div className="flex justify-between p-2 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}><span className="text-white/70">Email:</span> <span className="font-medium text-white">{tenant.email}</span></div>
                      <div className="flex justify-between p-2 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}><span className="text-white/70">Phone:</span> <span className="font-medium text-white">{tenant.phone}</span></div>
                      {tenant.whatsappNumber && <div className="flex justify-between p-2 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}><span className="text-white/70">WhatsApp:</span> <span className="font-medium text-white">{tenant.whatsappNumber}</span></div>}
                      <div className="flex justify-between p-2 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}><span className="text-white/70">Status:</span> <span className={`font-medium ${tenant.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>{tenant.status}</span></div>
                      {tenant.numberOfOccupants && <div className="flex justify-between p-2 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}><span className="text-white/70">Occupants:</span> <span className="font-medium text-white">{tenant.numberOfOccupants}</span></div>}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-lg border-b border-white/20 pb-2 text-white/90">Property Information</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between p-2 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}><span className="text-white/70">Property:</span> <span className="font-medium text-white">{tenant.propertyId?.name || 'N/A'}</span></div>
                      <div className="flex justify-between p-2 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}><span className="text-white/70">Unit:</span> <span className="font-medium text-white">{tenant.unit}</span></div>
                      <div className="flex justify-between p-2 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}><span className="text-white/70">Monthly Rent:</span> <span className="font-medium text-green-400">${tenant.rentAmount || 0}</span></div>
                      <div className="flex justify-between p-2 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}><span className="text-white/70">Security Deposit:</span> <span className="font-medium text-white">${tenant.securityDeposit || 0}</span></div>
                      {tenant.leaseStartDate && <div className="flex justify-between p-2 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}><span className="text-white/70">Lease Start:</span> <span className="font-medium text-white">{new Date(tenant.leaseStartDate).toLocaleDateString()}</span></div>}
                      {tenant.leaseEndDate && <div className="flex justify-between p-2 rounded-lg" style={{background: 'rgba(255, 255, 255, 0.05)'}}><span className="text-white/70">Lease End:</span> <span className="font-medium text-white">{new Date(tenant.leaseEndDate).toLocaleDateString()}</span></div>}
                    </div>
                  </div>
                </div>
                
                {/* Family & Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-lg border-b border-white/20 pb-2 text-white/90">Family Details</h4>
                    <div className="space-y-3">
                      {tenant.fatherName && <div className="flex justify-between"><span className="text-gray-600">Father's Name:</span> <span className="font-medium">{tenant.fatherName}</span></div>}
                      {tenant.motherName && <div className="flex justify-between"><span className="text-gray-600">Mother's Name:</span> <span className="font-medium">{tenant.motherName}</span></div>}
                      {tenant.govtIdNumber && <div className="flex justify-between"><span className="text-gray-600">Government ID:</span> <span className="font-medium">{tenant.govtIdNumber}</span></div>}
                      {tenant.occupation && <div className="flex justify-between"><span className="text-gray-600">Occupation:</span> <span className="font-medium">{tenant.occupation}</span></div>}
                      {tenant.monthlyIncome && <div className="flex justify-between"><span className="text-gray-600">Monthly Income:</span> <span className="font-medium text-green-600">${tenant.monthlyIncome}</span></div>}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-lg border-b border-white/20 pb-2 text-white/90">Contact & Emergency</h4>
                    <div className="space-y-3">
                      {tenant.emergencyContact?.name && <div className="flex justify-between"><span className="text-gray-600">Emergency Contact:</span> <span className="font-medium">{tenant.emergencyContact.name}</span></div>}
                      {tenant.emergencyContact?.phone && <div className="flex justify-between"><span className="text-gray-600">Emergency Phone:</span> <span className="font-medium">{tenant.emergencyContact.phone}</span></div>}
                      {tenant.emergencyContact?.relation && <div className="flex justify-between"><span className="text-gray-600">Relation:</span> <span className="font-medium">{tenant.emergencyContact.relation}</span></div>}
                      {tenant.reference?.name && <div className="flex justify-between"><span className="text-gray-600">Reference:</span> <span className="font-medium">{tenant.reference.name}</span></div>}
                      {tenant.reference?.phone && <div className="flex justify-between"><span className="text-gray-600">Reference Phone:</span> <span className="font-medium">{tenant.reference.phone}</span></div>}
                    </div>
                  </div>
                </div>
                
                {/* Addresses */}
                <div>
                  <h4 className="font-semibold mb-3 text-lg border-b border-white/20 pb-2 text-white/90">Address Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tenant.presentAddress && (
                      <div>
                        <span className="text-white/70 font-medium">Present Address:</span>
                        <p className="mt-1 p-3 rounded-lg text-white" style={{background: 'rgba(255, 255, 255, 0.05)'}}>{tenant.presentAddress}</p>
                      </div>
                    )}
                    {tenant.permanentAddress && (
                      <div>
                        <span className="text-white/70 font-medium">Permanent Address:</span>
                        <p className="mt-1 p-3 rounded-lg text-white" style={{background: 'rgba(255, 255, 255, 0.05)'}}>{tenant.permanentAddress}</p>
                      </div>
                    )}
                    {tenant.previousAddress && (
                      <div>
                        <span className="text-white/70 font-medium">Previous Address:</span>
                        <p className="mt-1 p-3 rounded-lg text-white" style={{background: 'rgba(255, 255, 255, 0.05)'}}>{tenant.previousAddress}</p>
                      </div>
                    )}
                    {tenant.reasonForMoving && (
                      <div>
                        <span className="text-white/70 font-medium">Reason for Moving:</span>
                        <p className="mt-1 p-3 rounded-lg text-white" style={{background: 'rgba(255, 255, 255, 0.05)'}}>{tenant.reasonForMoving}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Additional Information */}
                {(tenant.vehicleDetails || tenant.petDetails || tenant.specialInstructions) && (
                  <div>
                    <h4 className="font-semibold mb-3 text-lg border-b border-white/20 pb-2 text-white/90">Additional Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {tenant.vehicleDetails && (
                        <div>
                          <span className="text-gray-600 font-medium">Vehicle Details:</span>
                          <p className="mt-1 p-3 bg-gray-50 rounded-lg">{tenant.vehicleDetails}</p>
                        </div>
                      )}
                      {tenant.petDetails && (
                        <div>
                          <span className="text-gray-600 font-medium">Pet Details:</span>
                          <p className="mt-1 p-3 bg-gray-50 rounded-lg">{tenant.petDetails}</p>
                        </div>
                      )}
                    </div>
                    {tenant.specialInstructions && (
                      <div className="mt-4">
                        <span className="text-gray-600 font-medium">Special Instructions:</span>
                        <p className="mt-1 p-3 bg-gray-50 rounded-lg">{tenant.specialInstructions}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Additional Adults */}
                {tenant.additionalAdults && tenant.additionalAdults.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-lg border-b border-white/20 pb-2 text-white/90">Additional Adults ({tenant.additionalAdults.length})</h4>
                    <div className="space-y-4">
                      {tenant.additionalAdults.map((adult: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            {(adult.imageUrl || adult.image) && (
                              <img 
                                src={adult.imageUrl || adult.image} 
                                alt={`${adult.name || `Adult ${index + 1}`}`} 
                                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                              />
                            )}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-2">
                                {adult.name && <div className="flex justify-between"><span className="text-gray-600">Name:</span> <span className="font-medium">{adult.name}</span></div>}
                                {adult.phone && <div className="flex justify-between"><span className="text-gray-600">Phone:</span> <span className="font-medium">{adult.phone}</span></div>}
                                {adult.relation && <div className="flex justify-between"><span className="text-gray-600">Relation:</span> <span className="font-medium">{adult.relation}</span></div>}
                              </div>
                              <div className="space-y-2">
                                {adult.govtIdNumber && <div className="flex justify-between"><span className="text-gray-600">ID Number:</span> <span className="font-medium">{adult.govtIdNumber}</span></div>}
                                {adult.fatherName && <div className="flex justify-between"><span className="text-gray-600">Father's Name:</span> <span className="font-medium">{adult.fatherName}</span></div>}
                                {adult.motherName && <div className="flex justify-between"><span className="text-gray-600">Mother's Name:</span> <span className="font-medium">{adult.motherName}</span></div>}
                              </div>
                            </div>
                          </div>
                          {adult.permanentAddress && (
                            <div className="mt-3">
                              <span className="text-gray-600 font-medium">Address:</span>
                              <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{adult.permanentAddress}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </PropertyStyleCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enhanced Tenant Quick Actions */}
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}></div>
            <div className="relative">
              <EnhancedTenantQuickActions
                tenant={tenant}
                tenantId={tenantId || ''}
                payments={relatedData?.payments || []}
                maintenanceRequests={relatedData?.maintenance || []}
                onShowQuickPayment={(type) => {
                  setPaymentType(type);
                  setShowQuickPayment(true);
                }}
                onShowEditModal={() => setShowEditModal(true)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Modal */}
      <EditTenantModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        tenant={tenant}
        onTenantUpdated={(updatedTenant) => {
          // Refresh tenant data
          window.location.reload();
        }}
      />
      
      {/* Quick Payment Modal */}
      <QuickPaymentModal
        isOpen={showQuickPayment}
        onClose={() => setShowQuickPayment(false)}
        tenant={tenant}
        onPaymentAdded={() => {
          // Refresh page to show new payment
          window.location.reload();
        }}
        isOverdue={paymentType === 'overdue'}
        overdueAmount={overdueAmount}
        monthsOverdue={monthsOverdue}
      />
      </motion.div>
    </PropertyStyleBackground>
  );
};

export default TenantDetailsPage;