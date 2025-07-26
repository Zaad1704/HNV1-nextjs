'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Send,
  ArrowLeft,
  Printer,
  Share2,
  Save,
  X
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useCurrency } from '@/contexts/CurrencyContext';
import { deletePayment, confirmDelete, handleDeleteError, handleDeleteSuccess } from '@/utils/deleteHelpers';
import { generatePaymentInsights, generatePaymentSuggestions } from '@/utils/paymentInsights';

import UniversalGlassyCardSimple from '@/components/common/UniversalGlassyCardSimple';
import EnhancedPaymentDetailsActionWheel from '@/components/payment/EnhancedPaymentDetailsActionWheel';
import EnhancedPaymentFloatingActionMenu from '@/components/payment/EnhancedPaymentFloatingActionMenu';
import PaymentAIInsightsWidget from '@/components/payment/PaymentAIInsightsWidget';
import PaymentSmartSuggestionsPanel from '@/components/payment/PaymentSmartSuggestionsPanel';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';

const fetchPaymentDetails = async (paymentId: string) => {
  console.log('Fetching payment details for ID:', paymentId);
  
  // Validate payment ID format
  if (!paymentId || !paymentId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error(`Invalid payment ID format: ${paymentId}`);
  }
  
  try {
    const { data } = await apiClient.get(`/payments/${paymentId}`);
    console.log('API response:', data);
    
    if (!data) {
      throw new Error('No response data received');
    }
    
    if (!data.success) {
      throw new Error(data.message || 'API request failed');
    }
    
    if (!data.data) {
      throw new Error('Payment data not found in response');
    }
    
    return data.data;
  } catch (error: any) {
    console.error('Error in fetchPaymentDetails:', error);
    
    // Provide more specific error messages
    if (error.response?.status === 404) {
      throw new Error('Payment not found. It may have been deleted or you may not have access to it.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. You do not have permission to view this payment.');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The server may be busy. Please try again.');
    }
    
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

const PaymentDetailsPageUniversal = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { currency } = useCurrency();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const { data: payment, isLoading, error, isError, refetch } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => fetchPaymentDetails(id!),
    enabled: Boolean(id && id.match(/^[0-9a-fA-F]{24}$/)),
    retry: (failureCount, error: any) => {
      // Don't retry on 404, 401, or 403 errors
      if (error?.response?.status === 404 || 
          error?.response?.status === 401 || 
          error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
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
    enabled: Boolean(id)
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
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Authentication required. Please log in again.');
        router.push('/login');
        return;
      }
      
      console.log('Attempting to download PDF receipt for payment:', id);
      const receiptUrl = `${apiClient.defaults.baseURL}/payments/${id}/receipt-pdf?token=${token}`;
      console.log('PDF Receipt URL:', receiptUrl);
      
      const response = await fetch(receiptUrl);
      
      if (!response.ok) {
        let errorMessage = 'Failed to download receipt.';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status-based message
          if (response.status === 401) {
            errorMessage = 'Authentication failed. Please log in again.';
            setTimeout(() => router.push('/login'), 2000);
          } else if (response.status === 403) {
            errorMessage = 'Access denied. You do not have permission to view this receipt.';
          } else if (response.status === 404) {
            errorMessage = 'Payment receipt not found.';
          } else if (response.status === 400) {
            errorMessage = 'Invalid payment ID format.';
          }
        }
        
        console.error('Receipt download failed:', response.status, errorMessage);
        alert(errorMessage);
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payment_Receipt_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('PDF receipt downloaded successfully');
    } catch (error: any) {
      console.error("Error downloading receipt:", error);
      
      let errorMessage = 'Failed to download receipt. Please try again.';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      alert(errorMessage);
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
    { label: 'Amount', value: `${currency}${(payment.amount || 0).toLocaleString()}` },
    { label: 'Status', value: payment.status || 'Pending' },
    { label: 'Date', value: payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A' }
  ] : [];

  // Back button handler
  const handleBack = () => {
    router.push('/dashboard/payments-universal');
  };
  
  // PDF receipt generation
  const handleGeneratePdf = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Authentication required. Please log in again.');
        router.push('/login');
        return;
      }
      
      const receiptUrl = `${apiClient.defaults.baseURL}/payments/${id}/receipt-pdf`;
      console.log('Generating PDF receipt:', receiptUrl);
      
      // For window.open, we need to use query token since we can't set headers
      const receiptWindow = window.open(`${receiptUrl}?token=${token}`, '_blank');
      if (!receiptWindow) {
        alert('Popup blocked. Please allow popups for this site or use the download button.');
      }
    } catch (error: any) {
      console.error('Error generating PDF receipt:', error);
      alert('Failed to generate PDF receipt. Please try again.');
    }
  };

  // Handle invalid payment ID format
  if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Invalid Payment ID</h3>
        <p className="text-white/70 mb-4">The payment ID format is invalid. Please check the URL and try again.</p>
        <p className="text-white/60 mb-6 font-mono text-sm">ID: {id}</p>
        <button onClick={handleBack} className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold">
          Back to Payments
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full animate-pulse"></div>
        <span className="ml-3 text-white/70">Loading payment details...</span>
        <div className="mt-4">
          <button onClick={() => refetch()} className="bg-blue-500/50 hover:bg-blue-500/70 text-white px-4 py-2 rounded-xl">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Payment Details Unavailable</h3>
        <p className="text-white/80 mb-4">We couldn't load the payment details. The payment may not exist or there might be a connection issue.</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 rounded-lg text-left max-w-md mx-auto">
            <p className="text-white font-medium mb-2">Error Details:</p>
            <p className="text-white/80 text-sm">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </div>
        )}
        
        <div className="flex gap-3 justify-center">
          <button onClick={handleBack} className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold">
            Back to Payments
          </button>
          <button 
            onClick={() => refetch()}
            className="bg-blue-500/50 hover:bg-blue-500/70 text-white px-6 py-3 rounded-2xl font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header with Back Button */}
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
              <button 
                onClick={handleBack}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">
                  Payment Details - {currency}{(payment?.amount || 0).toLocaleString()}
                </h1>
                <div className="flex items-center gap-2 text-white/90 mt-1">
                  <CreditCard size={16} />
                  <span>{payment?.description || 'Payment'} - {payment?.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {(user?.role === 'Super Admin' || user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Landlord') && (
                <button
                  onClick={() => {
                    setEditData({
                      amount: payment?.amount || 0,
                      description: payment?.description || '',
                      paymentMethod: payment?.paymentMethod || '',
                      status: payment?.status || 'Paid',
                      paymentDate: payment?.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : ''
                    });
                    setIsEditing(true);
                  }}
                  className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                  style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
                  title="Edit Payment"
                >
                  <Edit size={20} className="text-white" />
                </button>
              )}
              <button
                onClick={handleDownloadReceipt}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
                title="Download PDF Receipt"
              >
                <Download size={20} className="text-white" />
              </button>
              <button
                onClick={() => {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    alert('Authentication required. Please log in again.');
                    router.push('/login');
                    return;
                  }
                  const receiptWindow = window.open(`${apiClient.defaults.baseURL}/payments/${id}/receipt?token=${token}`, '_blank');
                  if (receiptWindow) {
                    receiptWindow.onload = () => receiptWindow.print();
                  } else {
                    alert('Popup blocked. Please allow popups for this site.');
                  }
                }}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
                title="Print Receipt"
              >
                <Printer size={20} className="text-white" />
              </button>
              <button
                onClick={async () => {
                  const token = localStorage.getItem('token');
                  const receiptUrl = `${apiClient.defaults.baseURL}/payments/${id}/receipt?token=${token}`;
                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title: `Payment Receipt - ${currency}${payment?.amount || 0}`,
                        text: `Payment receipt for ${payment?.tenantId?.name || 'tenant'}`,
                        url: receiptUrl
                      });
                    } else {
                      await navigator.clipboard.writeText(receiptUrl);
                      alert('Receipt link copied to clipboard!');
                    }
                  } catch (error) {
                    console.error('Error sharing:', error);
                    alert('Receipt URL: ' + receiptUrl);
                  }
                }}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
                title="Share Receipt"
              >
                <Share2 size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="flex-1 space-y-6">
          {/* Payment Overview */}
          <UniversalGlassyCardSimple>
            <h3 className="text-lg font-bold mb-4 text-white/90">Payment Overview</h3>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                  <DollarSign size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{currency}{(payment?.amount || 0).toLocaleString()}</h2>
                  {payment?.originalAmount && payment.originalAmount !== payment.amount && (
                    <p className="text-green-400 font-medium">
                      Original: {currency}{(payment.originalAmount || 0).toLocaleString()} (Discount Applied)
                    </p>
                  )}
                </div>
              </div>
              <UniversalStatusBadge 
                status={payment?.status || 'Pending'} 
                variant={payment?.status?.toLowerCase() === 'completed' || payment?.status?.toLowerCase() === 'paid' ? 'success' : 
                       payment?.status?.toLowerCase() === 'pending' ? 'warning' : 'error'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Calendar size={20} className="text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Payment Date</p>
                    <p className="font-semibold text-white">{payment?.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <CreditCard size={20} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Payment Method</p>
                    <p className="font-semibold text-white">{payment?.paymentMethod || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {payment?.rentMonth && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <Calendar size={20} className="text-blue-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Rent Period</p>
                      <p className="font-semibold text-white">
                        {payment?.rentMonth ? new Date(payment.rentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
                {payment?.referenceNumber && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <Receipt size={20} className="text-orange-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Reference Number</p>
                      <p className="font-semibold text-white">{payment?.referenceNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons - After Payment Details */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDownloadReceipt}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/30 hover:bg-blue-500/50 text-white transition-colors font-medium"
                >
                  <Download size={18} className="text-blue-300" />
                  <span>Download PDF</span>
                </button>
                
                <button
                  onClick={() => {
                    const token = localStorage.getItem('token');
                    if (!token) {
                      alert('Authentication required. Please log in again.');
                      router.push('/login');
                      return;
                    }
                    const receiptWindow = window.open(`${apiClient.defaults.baseURL}/payments/${id}/receipt?token=${token}`, '_blank');
                    if (receiptWindow) {
                      receiptWindow.onload = () => receiptWindow.print();
                    } else {
                      alert('Popup blocked. Please allow popups for this site.');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/30 hover:bg-green-500/50 text-white transition-colors font-medium"
                >
                  <Printer size={18} className="text-green-300" />
                  <span>Print Receipt</span>
                </button>
                
                <button
                  onClick={async () => {
                    const email = payment?.tenantId?.email || prompt('Enter email address:');
                    if (email) {
                      try {
                        await apiClient.post(`/payments/${id}/send-receipt`, { email });
                        alert('Receipt sent successfully!');
                      } catch (error) {
                        console.error('Error sending receipt:', error);
                        alert('Failed to send receipt. Please try again.');
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-orange-500/30 hover:bg-orange-500/50 text-white transition-colors font-medium"
                >
                  <Send size={18} className="text-orange-300" />
                  <span>Send to Tenant</span>
                </button>
                
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    if (!token) {
                      alert('Authentication required. Please log in again.');
                      router.push('/login');
                      return;
                    }
                    const receiptUrl = `${apiClient.defaults.baseURL}/payments/${id}/receipt?token=${token}`;
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: `Payment Receipt - ${currency}${payment?.amount || 0}`,
                          text: `Payment receipt for ${payment?.tenantId?.name || 'tenant'}`,
                          url: receiptUrl
                        });
                      } else {
                        await navigator.clipboard.writeText(receiptUrl);
                        alert('Receipt link copied to clipboard!');
                      }
                    } catch (error) {
                      console.error('Error sharing:', error);
                      alert('Receipt URL: ' + receiptUrl);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/50 text-white transition-colors font-medium"
                >
                  <Share2 size={18} className="text-indigo-300" />
                  <span>Share Receipt</span>
                </button>
              </div>
            </div>

          </UniversalGlassyCardSimple>

          {/* Tenant Information */}
          {payment?.tenantId && (
            <UniversalGlassyCardSimple>
              <h3 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
                <User size={20} className="text-blue-300" />
                Tenant Information
              </h3>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-white/20 shadow-lg overflow-hidden" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                  {(payment?.tenantId?.imageUrl || payment?.tenantId?.tenantImage || payment?.tenantId?.image || payment?.tenantId?.profileImage) ? (
                    <img 
                      src={payment.tenantId.imageUrl || payment.tenantId.tenantImage || payment.tenantId.image || payment.tenantId.profileImage} 
                      alt={payment.tenantId.name || 'Tenant'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center ${(payment?.tenantId?.imageUrl || payment?.tenantId?.tenantImage || payment?.tenantId?.image || payment?.tenantId?.profileImage) ? 'hidden' : ''}`}>
                    {payment?.tenantId?.name?.charAt(0) || 'T'}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{payment?.tenantId?.name || 'Unknown Tenant'}</h4>
                      <p className="text-blue-400">{payment?.tenantId?.email || 'No email'}</p>
                      {payment?.tenantId?.phone && (
                        <p className="text-white/70">{payment.tenantId.phone}</p>
                      )}
                    </div>
                    {payment?.tenantId?.dueAmount && payment.tenantId.dueAmount > 0 && (
                      <div className="bg-red-500/30 px-3 py-2 rounded-lg">
                        <p className="text-white font-medium">Due Amount</p>
                        <p className="text-red-300 font-bold">{currency}{(payment?.tenantId?.dueAmount || 0).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {payment?.tenantId?._id && (
                      <Link to={`/dashboard/tenants/${payment.tenantId._id}`} className="inline-flex items-center gap-1 bg-blue-500/50 hover:bg-blue-500/70 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                        <Eye size={14} />
                        View Tenant
                      </Link>
                    )}
                    {payment?.tenantId?.phone && (
                      <a href={`tel:${payment.tenantId.phone}`} className="inline-flex items-center gap-1 bg-green-500/50 hover:bg-green-500/70 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                        <Phone size={14} />
                        Call
                      </a>
                    )}
                    {payment?.tenantId?.email && (
                      <a href={`mailto:${payment.tenantId.email}`} className="inline-flex items-center gap-1 bg-purple-500/50 hover:bg-purple-500/70 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                        <Mail size={14} />
                        Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </UniversalGlassyCardSimple>
          )}

          {/* Property Information */}
          {payment?.propertyId && (
            <UniversalGlassyCardSimple>
              <h3 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
                <Building2 size={20} className="text-purple-300" />
                Property Information
              </h3>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-3xl border-4 border-white/20 shadow-lg overflow-hidden" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                  {(payment?.propertyId?.imageUrl || payment?.propertyId?.image || payment?.propertyId?.images?.[0]) ? (
                    <img 
                      src={payment.propertyId.imageUrl || payment.propertyId.image || payment.propertyId.images?.[0]} 
                      alt={payment.propertyId.name || 'Property'} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center ${(payment?.propertyId?.imageUrl || payment?.propertyId?.image || payment?.propertyId?.images?.[0]) ? 'hidden' : ''}`}>
                    {payment?.propertyId?.name?.charAt(0) || 'P'}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{payment?.propertyId?.name || 'Unknown Property'}</h4>
                  {payment?.propertyId?.address && (
                    <p className="text-purple-400 flex items-center gap-1">
                      <MapPin size={14} />
                      {payment.propertyId.address.formattedAddress || payment.propertyId.address.street || 'No address'}
                    </p>
                  )}
                  <div className="mt-3">
                    {payment?.propertyId?._id && (
                      <Link to={`/dashboard/properties/${payment.propertyId._id}`} className="inline-flex items-center gap-1 bg-purple-500/50 hover:bg-purple-500/70 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                        <Eye size={14} />
                        View Property
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </UniversalGlassyCardSimple>
          )}
          
          {/* Transaction Details */}
          <UniversalGlassyCardSimple>
            <h3 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
              <FileText size={20} className="text-yellow-300" />
              Transaction Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Receipt size={20} className="text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Transaction ID</p>
                    <p className="font-semibold text-white font-mono">{payment?._id || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Clock size={20} className="text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Created At</p>
                    <p className="font-semibold text-white">{payment?.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <User size={20} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Recorded By</p>
                    <p className="font-semibold text-white">{payment?.recordedBy?.name || 'System'}</p>
                  </div>
                </div>
                {payment?.notes && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <FileText size={20} className="text-blue-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Notes</p>
                      <p className="font-semibold text-white">{payment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </UniversalGlassyCardSimple>
        </div>
        
        {/* Right Sidebar */}
        <div className="w-80 space-y-6">
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
              } else if (action === 'Generate PDF') {
                handleGeneratePdf();
              }
            }}
          />
          
          {/* Action Wheel */}
          <EnhancedPaymentDetailsActionWheel
            onDownloadReceipt={handleDownloadReceipt}
            onPrintReceipt={() => window.print()}
            onGeneratePdf={handleGeneratePdf}
            tenantId={payment?.tenantId?._id}
            propertyId={payment?.propertyId?._id}
          />
        </div>
      </div>
      
      {/* Edit Payment Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Payment</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  value={editData.amount}
                  onChange={(e) => setEditData({...editData, amount: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={editData.paymentMethod}
                  onChange={(e) => setEditData({...editData, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="card">Card</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({...editData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={editData.paymentDate}
                  onChange={(e) => setEditData({...editData, paymentDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={async () => {
                  try {
                    await apiClient.put(`/payments/${id}`, editData);
                    queryClient.invalidateQueries({ queryKey: ['payment', id] });
                    setIsEditing(false);
                    alert('Payment updated successfully!');
                  } catch (error) {
                    console.error('Error updating payment:', error);
                    alert('Failed to update payment. Please try again.');
                  }
                }}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentDetailsPageUniversal;