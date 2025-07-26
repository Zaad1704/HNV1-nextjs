'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  DollarSign, 
  Calendar, 
  User, 
  Building2, 
  CreditCard, 
  FileText, 
  Edit, 
  Trash2, 
  Download, 
  Receipt, 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Eye,
  History,
  FileCheck,
  Send
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { deletePayment, confirmDelete, handleDeleteError, handleDeleteSuccess } from '@/utils/deleteHelpers';
import { generatePaymentInsights, generatePaymentSuggestions } from '@/utils/paymentInsights';
import UniversalDetailsPage from '@/components/common/UniversalDetailsPage';
import UniversalGlassyDetailCard from '@/components/common/UniversalGlassyDetailCard';
import UniversalDetailActionWheel from '@/components/common/UniversalDetailActionWheel';
import UniversalDetailSidebar from '@/components/common/UniversalDetailSidebar';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';
import PaymentAIInsightsWidget from '@/components/payment/PaymentAIInsightsWidget';
import PaymentSmartSuggestionsPanel from '@/components/payment/PaymentSmartSuggestionsPanel';

const fetchPaymentDetails = async (paymentId: string) => {
  console.log('Fetching payment details for ID:', paymentId);
  try {
    const { data } = await apiClient.get(`/payments/${paymentId}`);
    console.log('API response:', data);
    if (!data || !data.data) {
      throw new Error('Invalid API response format');
    }
    return data.data;
  } catch (error) {
    console.error('Error in fetchPaymentDetails:', error);
    throw error;
  }
};

const fetchRelatedData = async (paymentId: string) => {
  try {
    const [receipts, auditLogs] = await Promise.all([
      apiClient.get(`/receipts?paymentId=${paymentId}`).catch(() => ({ data: { data: [] } })),
      apiClient.get(`/audit?resourceId=${paymentId}&limit=10`).catch(() => ({ data: { data: [] } }))
    ]);

    return {
      receipts: receipts.data.data || [],
      auditLogs: auditLogs.data.data || []
    };
  } catch (error) {
    console.error("Error fetching related data:", error);
    return {
      receipts: [],
      auditLogs: []
    };
  }
};

const PaymentDetailsPageEnhanced = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currency } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: payment, isLoading, error, isError } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => fetchPaymentDetails(id!),
    enabled: !!id,
    retry: 2,
    retryDelay: 1000,
    staleTime: 0,
    onError: (err) => {
      console.error('Payment details query error:', err);
    }
  });
  
  // Generate AI insights and suggestions
  const insights = payment ? generatePaymentInsights(payment) : [];
  const suggestions = payment ? generatePaymentSuggestions(payment) : [];
  
  const { data: relatedData } = useQuery({
    queryKey: ['paymentRelatedData', id],
    queryFn: () => fetchRelatedData(id!),
    enabled: !!id
  });

  const handleDeletePayment = async () => {
    if (confirmDelete(`${currency}${payment?.amount}`, 'payment')) {
      try {
        await deletePayment(id!);
        handleDeleteSuccess('payment');
        router.push('/dashboard/payments');
      } catch (error: any) {
        handleDeleteError(error, 'payment');
      }
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const response = await apiClient.get(`/payments/${id}/receipt`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payment_Receipt_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading receipt:", error);
      alert("Failed to download receipt. Please try again.");
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await apiClient.put(`/payments/${id}`, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['payment', id] });
      alert(`Payment status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating payment status:", error);
      alert("Failed to update payment status. Please try again.");
    }
  };

  // Calculate stats for the page header
  const stats = payment ? [
    { label: 'Amount', value: `${currency}${payment.amount?.toLocaleString()}` },
    { label: 'Status', value: payment.status || 'Pending' },
    { label: 'Date', value: new Date(payment.paymentDate).toLocaleDateString() }
  ] : [];

  // Define tabs
  const tabs = [
    { id: 'overview', label: 'Overview', icon: DollarSign },
    { id: 'details', label: 'Transaction Details', icon: FileText },
    { id: 'documents', label: 'Related Documents', icon: FileCheck },
    { id: 'history', label: 'History', icon: History }
  ];

  // Define quick actions for sidebar
  const quickActions = payment ? [
    {
      icon: Download,
      label: 'Download Receipt',
      onClick: handleDownloadReceipt,
      color: 'rgba(59, 130, 246, 0.3)'
    },
    {
      icon: Send,
      label: 'Send Receipt to Tenant',
      onClick: () => alert('Sending receipt to tenant...'),
      color: 'rgba(52, 211, 153, 0.3)'
    },
    {
      icon: payment.status !== 'Paid' ? CheckCircle : Clock,
      label: payment.status !== 'Paid' ? 'Mark as Paid' : 'Mark as Pending',
      onClick: () => handleUpdateStatus(payment.status !== 'Paid' ? 'Paid' : 'Pending'),
      color: payment.status !== 'Paid' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(249, 115, 22, 0.3)'
    },
    {
      icon: DollarSign,
      label: 'Record New Payment',
      onClick: () => router.push(`/dashboard/payments/add?tenantId=${payment.tenantId?._id}`),
      color: 'rgba(139, 92, 246, 0.3)'
    }
  ] : [];

  // Define timeline events
  const timeline = payment ? [
    {
      icon: CheckCircle,
      title: 'Payment Recorded',
      date: new Date(payment.paymentDate).toLocaleDateString(),
      color: 'rgba(52, 211, 153, 0.3)'
    },
    {
      icon: Clock,
      title: 'Entry Created',
      date: new Date(payment.createdAt).toLocaleDateString(),
      color: 'rgba(59, 130, 246, 0.3)'
    },
    ...(payment.updatedAt && payment.updatedAt !== payment.createdAt ? [
      {
        icon: Edit,
        title: 'Last Updated',
        date: new Date(payment.updatedAt).toLocaleDateString(),
        color: 'rgba(249, 115, 22, 0.3)'
      }
    ] : [])
  ] : [];

  return (
    <UniversalDetailsPage
      title={payment ? `Payment Details` : 'Loading Payment...'}
      subtitle={payment ? `${payment.description || 'Payment'} - ${new Date(payment.paymentDate).toLocaleDateString()}` : 'Retrieving payment information'}
      icon={CreditCard}
      stats={stats}
      actionWheel={
        <UniversalDetailActionWheel
          mainIcon={CreditCard}
          actions={[
            { id: 'download', icon: Download, label: 'Download Receipt', onClick: handleDownloadReceipt, angle: -60 },
            { id: 'print', icon: Printer, label: 'Print Receipt', onClick: () => window.print(), angle: -30 },
            { id: 'edit', icon: Edit, label: 'Edit Payment', onClick: () => {}, angle: 0 },
            { id: 'share', icon: Send, label: 'Share', onClick: () => {
              if (navigator.share) {
                navigator.share({
                  title: `Payment of ${currency}${payment?.amount}`,
                  text: `Payment of ${currency}${payment?.amount} for ${payment?.tenantId?.name || 'Unknown Tenant'}`,
                  url: window.location.href
                }).catch(err => console.error('Error sharing', err));
              }
            }, angle: 30 },
            { id: 'delete', icon: Trash2, label: 'Delete Payment', onClick: handleDeletePayment, angle: 60 }
          ]}
        />
      }
      backLink="/dashboard/payments"
      backLabel="Back to Payments"
      onBack={() => router.push('/dashboard/payments')}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      sidebarContent={
        <UniversalDetailSidebar
          quickActions={quickActions}
          timeline={timeline}
          relatedItems={payment?.tenantId ? [
            {
              id: payment.tenantId._id,
              title: payment.tenantId.name,
              subtitle: payment.tenantId.email,
              icon: User,
              link: `/dashboard/tenants/${payment.tenantId._id}`
            }
          ] : []}
          relatedItemsTitle="Related Tenants"
          relatedItemsViewAllLink={payment?.tenantId ? `/dashboard/payments?tenantId=${payment.tenantId._id}` : undefined}
        />
      }
      isLoading={isLoading}
      error={error}
    >
      {payment && (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Payment Overview */}
              <UniversalGlassyDetailCard title="Payment Overview" icon={DollarSign} gradient="primary">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <DollarSign size={32} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">{currency}{payment.amount?.toLocaleString()}</h2>
                      {payment.originalAmount && payment.originalAmount !== payment.amount && (
                        <p className="text-green-400 font-medium">
                          Original: {currency}{payment.originalAmount} (Discount Applied)
                        </p>
                      )}
                    </div>
                  </div>
                  <UniversalStatusBadge 
                    status={payment.status || 'Pending'} 
                    variant={payment.status?.toLowerCase() === 'completed' || payment.status?.toLowerCase() === 'paid' ? 'success' : 
                           payment.status?.toLowerCase() === 'pending' ? 'warning' : 'error'}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                        <Calendar size={20} className="text-green-300" />
                      </div>
                      <div>
                        <p className="text-sm text-white/70">Payment Date</p>
                        <p className="font-semibold text-white">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                        <CreditCard size={20} className="text-purple-300" />
                      </div>
                      <div>
                        <p className="text-sm text-white/70">Payment Method</p>
                        <p className="font-semibold text-white">{payment.paymentMethod || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {payment.rentMonth && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                          <Calendar size={20} className="text-blue-300" />
                        </div>
                        <div>
                          <p className="text-sm text-white/70">Rent Period</p>
                          <p className="font-semibold text-white">
                            {new Date(payment.rentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    )}
                    {payment.referenceNumber && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                          <Receipt size={20} className="text-orange-300" />
                        </div>
                        <div>
                          <p className="text-sm text-white/70">Reference Number</p>
                          <p className="font-semibold text-white">{payment.referenceNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </UniversalGlassyDetailCard>

              {/* Tenant Information */}
              {payment.tenantId && (
                <UniversalGlassyDetailCard 
                  title="Tenant Information" 
                  icon={User} 
                  gradient="secondary"
                  headerAction={
                    <Link
                      to={`/dashboard/tenants/${payment.tenantId._id}`}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-medium transition-colors"
                    >
                      <Eye size={14} />
                      View Details
                    </Link>
                  }
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-white/20 shadow-lg" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      {payment.tenantId.name?.charAt(0) || 'T'}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white">{payment.tenantId.name}</h4>
                      <p className="text-blue-400">{payment.tenantId.email}</p>
                      {payment.tenantId.phone && (
                        <p className="text-white/70">{payment.tenantId.phone}</p>
                      )}
                    </div>
                  </div>

                  {payment.tenantId.phone && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => window.location.href = `tel:${payment.tenantId.phone}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl" 
                        style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}
                      >
                        <Phone size={16} className="text-blue-300" />
                        <span className="text-white text-sm">Call</span>
                      </button>
                      <button
                        onClick={() => window.location.href = `sms:${payment.tenantId.phone}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl" 
                        style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}
                      >
                        <MessageCircle size={16} className="text-green-300" />
                        <span className="text-white text-sm">Text</span>
                      </button>
                      <button
                        onClick={() => window.location.href = `mailto:${payment.tenantId.email}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl" 
                        style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}
                      >
                        <Mail size={16} className="text-orange-300" />
                        <span className="text-white text-sm">Email</span>
                      </button>
                    </div>
                  )}
                </UniversalGlassyDetailCard>
              )}

              {/* Property Information */}
              {payment.propertyId && (
                <UniversalGlassyDetailCard 
                  title="Property Information" 
                  icon={Building2} 
                  gradient="dark"
                  headerAction={
                    <Link
                      to={`/dashboard/properties/${payment.propertyId._id}`}
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm font-medium transition-colors"
                    >
                      <Eye size={14} />
                      View Details
                    </Link>
                  }
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl border-2 border-white/20 shadow-lg" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      {payment.propertyId.name?.charAt(0) || 'P'}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white">{payment.propertyId.name}</h4>
                      {payment.propertyId.address && (
                        <p className="text-purple-400 flex items-center gap-1">
                          <MapPin size={14} />
                          {payment.propertyId.address.formattedAddress || payment.propertyId.address.street}
                        </p>
                      )}
                    </div>
                  </div>
                </UniversalGlassyDetailCard>
              )}
              
              {/* AI Insights */}
              <PaymentAIInsightsWidget insights={insights} />
              
              {/* Smart Suggestions */}
              <PaymentSmartSuggestionsPanel 
                suggestions={suggestions} 
                onActionClick={(action) => {
                  if (action === 'Send Receipt') {
                    // Handle send receipt action
                    alert('Sending receipt to tenant...');
                  } else if (action === 'Send Message') {
                    // Handle send message action
                    alert('Sending thank you message to tenant...');
                  } else if (action === 'Setup Auto-Pay') {
                    // Handle auto-pay setup
                    alert('Setting up auto-pay for tenant...');
                  }
                }}
              />
            </div>
          )}

          {activeTab === 'details' && (
            <UniversalGlassyDetailCard title="Transaction Details" icon={FileText} gradient="primary">
              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/70 mb-1">Transaction ID</p>
                      <p className="font-mono text-white">{payment._id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70 mb-1">Created At</p>
                      <p className="text-white">{new Date(payment.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70 mb-1">Last Updated</p>
                      <p className="text-white">{new Date(payment.updatedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70 mb-1">Status</p>
                      <UniversalStatusBadge 
                        status={payment.status || 'Pending'} 
                        variant={payment.status?.toLowerCase() === 'completed' || payment.status?.toLowerCase() === 'paid' ? 'success' : 
                               payment.status?.toLowerCase() === 'pending' ? 'warning' : 'error'}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                  <h4 className="font-semibold text-white mb-3">Payment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-white/70 mb-1">Amount</p>
                      <p className="text-white font-semibold">{currency}{payment.amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70 mb-1">Payment Method</p>
                      <p className="text-white">{payment.paymentMethod || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/70 mb-1">Payment Date</p>
                      <p className="text-white">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                    </div>
                    {payment.rentMonth && (
                      <div>
                        <p className="text-sm text-white/70 mb-1">Rent Period</p>
                        <p className="text-white">{new Date(payment.rentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </UniversalGlassyDetailCard>
          )}

          {activeTab === 'documents' && (
            <UniversalGlassyDetailCard title="Related Documents" icon={FileCheck} gradient="secondary">
              {/* Receipts Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">Receipts</h4>
                  <button
                    onClick={handleDownloadReceipt}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg" 
                    style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}
                  >
                    <Download size={14} className="text-green-300" />
                    <span className="text-white text-sm">Download Receipt</span>
                  </button>
                </div>
                
                {relatedData?.receipts && relatedData.receipts.length > 0 ? (
                  <div className="space-y-3">
                    {relatedData.receipts.map((receipt: any) => (
                      <div key={receipt._id} className="p-4 rounded-xl flex items-center justify-between" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                            <Receipt size={20} className="text-blue-300" />
                          </div>
                          <div>
                            <p className="font-medium text-white">Receipt #{receipt.receiptNumber || receipt._id.substring(0, 8)}</p>
                            <p className="text-sm text-white/70">{new Date(receipt.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(`/api/receipts/${receipt._id}/download`, '_blank')}
                            className="p-2 rounded-lg" 
                            style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}
                          >
                            <Download size={16} className="text-green-300" />
                          </button>
                          <button
                            onClick={() => window.open(`/api/receipts/${receipt._id}/view`, '_blank')}
                            className="p-2 rounded-lg" 
                            style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}
                          >
                            <Eye size={16} className="text-blue-300" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl text-center" style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)'}}>
                    <Receipt size={32} className="mx-auto text-white/40 mb-2" />
                    <p className="text-white/70 mb-3">No receipts found for this payment</p>
                    <button
                      onClick={handleDownloadReceipt}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl mx-auto" 
                      style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}
                    >
                      <Download size={16} className="text-green-300" />
                      <span className="text-white">Generate Receipt</span>
                    </button>
                  </div>
                )}
              </div>
            </UniversalGlassyDetailCard>
          )}

          {activeTab === 'history' && (
            <UniversalGlassyDetailCard title="Payment History" icon={History} gradient="dark">
              {/* Timeline */}
              <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-blue-400 before:to-purple-400 before:left-3">
                {/* Payment Created */}
                <div className="relative">
                  <div className="absolute -left-8 w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                  <div className="p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">Payment Created</h4>
                      <span className="text-sm text-white/70">{new Date(payment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-white/90">Payment of {currency}{payment.amount} was recorded in the system</p>
                  </div>
                </div>
                
                {/* Payment Status Updates */}
                {payment.statusHistory && payment.statusHistory.map((status: any, index: number) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-8 w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    </div>
                    <div className="p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">Status Changed to {status.status}</h4>
                        <span className="text-sm text-white/70">{new Date(status.date).toLocaleString()}</span>
                      </div>
                      {status.note && <p className="text-white/90">{status.note}</p>}
                    </div>
                  </div>
                ))}
                
                {/* Audit Logs */}
                {relatedData?.auditLogs && relatedData.auditLogs.map((log: any) => (
                  <div key={log._id} className="relative">
                    <div className="absolute -left-8 w-6 h-6 rounded-full bg-green-400 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    </div>
                    <div className="p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">{log.action}</h4>
                        <span className="text-sm text-white/70">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-white/90">{log.description}</p>
                      {log.userId && (
                        <p className="text-sm text-white/70 mt-2">By: {log.userId.name || 'Unknown User'}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </UniversalGlassyDetailCard>
          )}
        </>
      )}
    </UniversalDetailsPage>
  );
};

export default PaymentDetailsPageEnhanced;