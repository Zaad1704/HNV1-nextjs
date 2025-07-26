'use client';
import React, { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  User, 
  Building2, 
  CreditCard, 
  FileText, 
  Edit, 
  Trash2, 
  Share2, 
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
import { generatePDF, printElement, generateThemedPDF } from '@/utils/printUtils';
import PropertyStyleBackground from '@/components/common/PropertyStyleBackground';
import PropertyStyleCard from '@/components/common/PropertyStyleCard';
import MessageButtons from '@/components/common/MessageButtons';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';
import { motion } from 'framer-motion';

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

const PaymentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currency } = useCurrency();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSendReceiptModal, setShowSendReceiptModal] = useState(false);

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
  
  // Debug logging
  console.log('Payment details page state:', { id, isLoading, error, hasData: !!payment });

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

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', variant: 'success' };
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', variant: 'warning' };
      case 'failed':
        return { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', variant: 'error' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100', variant: 'neutral' };
    }
  };

  const getPaymentAge = () => {
    try {
      if (!payment?.paymentDate) return 'No date';
      const paymentDate = new Date(payment.paymentDate);
      if (isNaN(paymentDate.getTime())) return 'Invalid date';
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - paymentDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 30) return `${diffDays} days ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch (error) {
      console.error('Error calculating payment age:', error);
      return 'Unknown';
    }
  };

  const paymentContentRef = useRef<HTMLDivElement>(null);

  const handleDownloadReceipt = async () => {
    try {
      // Try the API endpoint first
      try {
        const response = await apiClient.get(`/payments/${id}/receipt`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Payment_Receipt_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      } catch (apiError) {
        console.warn("API receipt generation failed, falling back to client-side generation", apiError);
      }
      
      // Fallback to client-side PDF generation
      if (paymentContentRef.current) {
        await generatePDF(paymentContentRef.current, `Payment_Receipt_${id}.pdf`);
      } else {
        throw new Error("Payment content reference not available");
      }
    } catch (error) {
      console.error("Error downloading receipt:", error);
      alert("Failed to download receipt. Please try again.");
    }
  };
  
  const handlePrintReceipt = () => {
    if (paymentContentRef.current) {
      printElement(paymentContentRef.current);
    } else {
      alert("Print content not available. Please try again.");
    }
  };
  
  const handleThemedPrint = async () => {
    try {
      if (paymentContentRef.current) {
        await generateThemedPDF(
          paymentContentRef.current, 
          `Themed_Receipt_${id}.pdf`,
          {
            primaryColor: '#FF8A65',
            secondaryColor: '#42A5F5',
            headerText: `Payment Receipt - ${currency}${payment.amount}`,
            footerText: `Generated on ${new Date().toLocaleDateString()} | Reference: ${payment.referenceNumber || id}`
          }
        );
      } else {
        throw new Error("Payment content reference not available");
      }
    } catch (error) {
      console.error("Error generating themed PDF:", error);
      alert("Failed to generate themed PDF. Please try again.");
    }
  };

  const handleSendReceipt = async (email: string) => {
    try {
      await apiClient.post(`/payments/${id}/send-receipt`, { email });
      alert("Receipt sent successfully!");
      setShowSendReceiptModal(false);
    } catch (error) {
      console.error("Error sending receipt:", error);
      alert("Failed to send receipt. Please try again.");
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

  // Handle invalid payment ID format
  if (id && !id.match(/^[0-9a-fA-F]{24}$/)) {
    return (
      <PropertyStyleBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 rounded-3xl border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
            <div className="w-16 h-16 bg-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Invalid Payment ID</h2>
            <p className="text-white/80 mb-4">The payment ID format is invalid. Please check the URL and try again.</p>
            <p className="text-white/60 mb-6 font-mono text-sm">ID: {id}</p>
            <Link href="/dashboard/payments" className="bg-gradient-to-r from-orange-400 to-blue-400 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all">
              ← Back to Payments
            </Link>
          </div>
        </div>
      </PropertyStyleBackground>
    );
  }

  if (isLoading) {
    console.log('Rendering loading state for payment ID:', id);
    return (
      <PropertyStyleBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4 p-8 rounded-3xl border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-blue-400 rounded-full animate-spin">
              <div className="w-full h-full rounded-full border-2 border-transparent border-t-white"></div>
            </div>
            <p className="text-white text-xl font-medium">Loading payment details...</p>
            <div className="mt-4 text-center">
              <p className="text-white/70">Payment ID: {id}</p>
              <p className="text-white/70 mb-4">Loading time: {new Date().toLocaleTimeString()}</p>
              <div className="mt-4 flex gap-3 justify-center">
                <Link 
                  to="/dashboard/payments"
                  className="bg-gradient-to-r from-orange-400 to-blue-400 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all"
                >
                  ← Back to Payments
                </Link>
                <button 
                  onClick={() => refetch()}
                  className="bg-blue-500/50 hover:bg-blue-500/70 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </PropertyStyleBackground>
    );
  }

  if (error || !payment) {
    console.log('Rendering error state:', { error, payment, id });
    return (
      <PropertyStyleBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8 rounded-3xl border border-white/20" style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(10px)'}}>
            <div className="w-16 h-16 bg-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Payment Details Unavailable</h2>
            <p className="text-white/80 mb-4">We couldn't load the payment details. The payment may not exist or there might be a connection issue.</p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 rounded-lg text-left">
                <p className="text-white font-medium mb-2">Error Details:</p>
                <pre className="text-white/80 text-xs overflow-auto max-h-32 p-2 bg-black/30 rounded">
                  {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <Link href="/dashboard/payments" className="bg-gradient-to-r from-orange-400 to-blue-400 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all">
                ← Back to Payments
              </Link>
              <button 
                onClick={() => refetch()}
                className="bg-blue-500/50 hover:bg-blue-500/70 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all"
              >
                Try Again
              </button>
              <button 
                onClick={() => {
                  // Clear cache and retry
                  queryClient.removeQueries({ queryKey: ['payment', id] });
                  setTimeout(() => refetch(), 100);
                }}
                className="bg-purple-500/50 hover:bg-purple-500/70 text-white px-4 py-2 rounded-xl hover:scale-105 transition-all"
              >
                Clear Cache & Retry
              </button>
            </div>
          </div>
        </div>
      </PropertyStyleBackground>
    );
  }

  const statusInfo = getStatusIcon(payment.status);
  const StatusIcon = statusInfo.icon;
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: DollarSign },
    { id: 'details', label: 'Transaction Details', icon: FileText },
    { id: 'documents', label: 'Related Documents', icon: FileCheck },
    { id: 'history', label: 'History', icon: History }
  ];

  return (
    <PropertyStyleBackground>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 p-6">
        {/* Header */}
        <div className="relative mb-8 payment-details-header">
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
                  to="/dashboard/payments"
                  className="p-2 rounded-xl icon-button scrim-button" 
                >
                  <ArrowLeft size={20} className="text-white" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent">{currency}{payment.amount?.toLocaleString()}</h1>
                  <div className="flex items-center gap-2 text-white/90 mt-1">
                    <DollarSign size={16} />
                    <span>Payment Details • {getPaymentAge()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="relative group">
                  <button
                    onClick={handleDownloadReceipt}
                    className="icon-button scrim-button w-12 h-12 rounded-full"
                  >
                    <Download size={18} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 bg-black/80 backdrop-blur-md rounded-lg p-2 hidden group-hover:block z-50">
                    <div className="flex flex-col gap-2">
                      <button onClick={handleDownloadReceipt} className="text-white text-xs whitespace-nowrap px-3 py-1 hover:bg-white/10 rounded">
                        PDF Download
                      </button>
                      <button onClick={handlePrintReceipt} className="text-white text-xs whitespace-nowrap px-3 py-1 hover:bg-white/10 rounded">
                        Print
                      </button>
                      <button onClick={handleThemedPrint} className="text-white text-xs whitespace-nowrap px-3 py-1 hover:bg-white/10 rounded">
                        Themed PDF
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="icon-button scrim-button w-12 h-12 rounded-full"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={handleDeletePayment}
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

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" ref={paymentContentRef}>
          {/* Main content area */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Payment Overview */}
                <PropertyStyleCard gradient="secondary">
                  <h3 className="text-lg font-bold mb-4 text-white/90">Payment Overview</h3>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                        <DollarSign size={32} className="text-white" style={{filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))'}} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">{currency}{(payment.amount || 0).toLocaleString()}</h2>
                        {payment.originalAmount && payment.originalAmount !== payment.amount && (
                          <p className="text-green-400 font-medium">
                            Original: {currency}{(payment.originalAmount || 0).toLocaleString()} (Discount Applied)
                          </p>
                        )}
                      </div>
                    </div>
                    <UniversalStatusBadge 
                      status={payment.status || 'Pending'} 
                      variant={statusInfo.variant as any}
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
                          <p className="font-semibold text-white">{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'No date'}</p>
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
                              {payment.rentMonth ? new Date(payment.rentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Not specified'}
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

                  {(payment.description || payment.notes) && (
                    <div className="mt-6 p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                      <h3 className="font-semibold text-white mb-2">Additional Information</h3>
                      {payment.description && (
                        <p className="text-white/90 mb-2"><span className="font-medium">Description:</span> {payment.description}</p>
                      )}
                      {payment.notes && (
                        <p className="text-white/90"><span className="font-medium">Notes:</span> {payment.notes}</p>
                      )}
                    </div>
                  )}
                </PropertyStyleCard>

                {/* Tenant Information */}
                {payment.tenantId && (
                  <PropertyStyleCard gradient="primary">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white/90 flex items-center gap-2">
                        <User size={20} className="text-blue-300" />
                        Tenant Information
                      </h3>
                      <Link
                        to={`/dashboard/tenants/${payment.tenantId._id}`}
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-medium transition-colors"
                      >
                        <Eye size={14} />
                        View Details
                      </Link>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {payment.tenantId.unit && (
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-white/70" />
                          <span className="text-sm text-white/70">Unit: <span className="font-medium text-white">{payment.tenantId.unit}</span></span>
                        </div>
                      )}
                      {payment.tenantId.rentAmount && (
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-white/70" />
                          <span className="text-sm text-white/70">Rent: <span className="font-medium text-white">{currency}{payment.tenantId.rentAmount}</span></span>
                        </div>
                      )}
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
                  </PropertyStyleCard>
                )}

                {/* Property Information */}
                {payment.propertyId && (
                  <PropertyStyleCard gradient="dark">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white/90 flex items-center gap-2">
                        <Building2 size={20} className="text-purple-300" />
                        Property Information
                      </h3>
                      <Link
                        to={`/dashboard/properties/${payment.propertyId._id}`}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm font-medium transition-colors"
                      >
                        <Eye size={14} />
                        View Details
                      </Link>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {payment.propertyId.type && (
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-white/70" />
                          <span className="text-sm text-white/70">Type: <span className="font-medium text-white">{payment.propertyId.type}</span></span>
                        </div>
                      )}
                      {payment.propertyId.numberOfUnits && (
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-white/70" />
                          <span className="text-sm text-white/70">Units: <span className="font-medium text-white">{payment.propertyId.numberOfUnits}</span></span>
                        </div>
                      )}
                    </div>
                  </PropertyStyleCard>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <PropertyStyleCard gradient="primary">
                <h3 className="text-lg font-bold mb-4 text-white/90">Transaction Details</h3>
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
                          variant={statusInfo.variant as any}
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
                      {payment.referenceNumber && (
                        <div>
                          <p className="text-sm text-white/70 mb-1">Reference Number</p>
                          <p className="text-white">{payment.referenceNumber}</p>
                        </div>
                      )}
                      {payment.transactionId && (
                        <div>
                          <p className="text-sm text-white/70 mb-1">Transaction ID</p>
                          <p className="text-white font-mono">{payment.transactionId}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {(payment.description || payment.notes) && (
                    <div className="p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                      <h4 className="font-semibold text-white mb-3">Additional Information</h4>
                      {payment.description && (
                        <div className="mb-3">
                          <p className="text-sm text-white/70 mb-1">Description</p>
                          <p className="text-white">{payment.description}</p>
                        </div>
                      )}
                      {payment.notes && (
                        <div>
                          <p className="text-sm text-white/70 mb-1">Notes</p>
                          <p className="text-white">{payment.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                    <h4 className="font-semibold text-white mb-3">Related Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {payment.tenantId && (
                        <div>
                          <p className="text-sm text-white/70 mb-1">Tenant</p>
                          <Link href={`/dashboard/tenants/${payment.tenantId._id}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                            {payment.tenantId.name}
                          </Link>
                        </div>
                      )}
                      {payment.propertyId && (
                        <div>
                          <p className="text-sm text-white/70 mb-1">Property</p>
                          <Link href={`/dashboard/properties/${payment.propertyId._id}`} className="text-purple-400 hover:text-purple-300 transition-colors">
                            {payment.propertyId.name}
                          </Link>
                        </div>
                      )}
                      {payment.unitId && (
                        <div>
                          <p className="text-sm text-white/70 mb-1">Unit</p>
                          <p className="text-white">{payment.unitId.unitNumber || payment.unit}</p>
                        </div>
                      )}
                      {payment.leaseId && (
                        <div>
                          <p className="text-sm text-white/70 mb-1">Lease</p>
                          <Link href={`/dashboard/leases/${payment.leaseId}`} className="text-green-400 hover:text-green-300 transition-colors">
                            View Lease
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </PropertyStyleCard>
            )}

            {activeTab === 'documents' && (
              <PropertyStyleCard gradient="secondary">
                <h3 className="text-lg font-bold mb-4 text-white/90">Related Documents</h3>
                
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
                              onClick={() => {
                                // Try PDF first, fallback to regular download
                                const downloadUrl = `/api/payment-pdf/${id}/receipt-pdf`;
                                const fallbackUrl = `/api/receipts/${receipt._id}/download`;
                                
                                fetch(downloadUrl)
                                  .then(response => {
                                    if (response.ok) {
                                      return response.blob();
                                    }
                                    throw new Error('PDF generation failed');
                                  })
                                  .then(blob => {
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `Payment_Receipt_${id}.pdf`;
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                  })
                                  .catch(() => {
                                    window.open(fallbackUrl, '_blank');
                                  });
                              }}
                              className="p-2 rounded-lg" 
                              style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}
                            >
                              <Download size={16} className="text-green-300" />
                            </button>
                            <button
                              onClick={() => window.open(`/api/payments/${id}/receipt`, '_blank')}
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
                
                {/* Other Documents Section */}
                <div>
                  <h4 className="font-semibold text-white mb-3">Other Documents</h4>
                  <div className="p-6 rounded-xl text-center" style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)'}}>
                    <FileText size={32} className="mx-auto text-white/40 mb-2" />
                    <p className="text-white/70 mb-3">No additional documents found</p>
                    <input
                      type="file"
                      id="document-upload"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const formData = new FormData();
                            formData.append('document', file);
                            formData.append('paymentId', id!);
                            
                            await apiClient.post('/upload/payment-document', formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });
                            
                            queryClient.invalidateQueries({ queryKey: ['paymentRelatedData', id] });
                            alert('Document uploaded successfully!');
                          } catch (error) {
                            console.error('Error uploading document:', error);
                            alert('Failed to upload document. Please try again.');
                          }
                        }
                      }}
                    />
                    <label
                      htmlFor="document-upload"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl mx-auto cursor-pointer inline-flex" 
                      style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}
                    >
                      <FileText size={16} className="text-blue-300" />
                      <span className="text-white">Upload Document</span>
                    </label>
                  </div>
                </div>
              </PropertyStyleCard>
            )}

            {activeTab === 'history' && (
              <PropertyStyleCard gradient="dark">
                <h3 className="text-lg font-bold mb-4 text-white/90">Payment History</h3>
                
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
                  
                  {/* If no history */}
                  {(!payment.statusHistory || payment.statusHistory.length === 0) && 
                   (!relatedData?.auditLogs || relatedData.auditLogs.length === 0) && (
                    <div className="relative">
                      <div className="absolute -left-8 w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      </div>
                      <div className="p-4 rounded-xl" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white">No Additional History</h4>
                          <span className="text-sm text-white/70">{new Date().toLocaleDateString()}</span>
                        </div>
                        <p className="text-white/90">No status changes or audit logs have been recorded for this payment</p>
                      </div>
                    </div>
                  )}
                </div>
              </PropertyStyleCard>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl p-1 animate-pulse" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)', backgroundSize: '300% 300%', animation: 'gradientFlow 4s ease infinite'}}></div>
              <div className="relative rounded-3xl p-6 border-2 border-white/40" style={{
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(255,138,101,0.05), rgba(66,165,245,0.05))', 
                backdropFilter: 'blur(25px) saturate(200%)'
              }}>
                <h3 className="text-lg font-bold text-white/90 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleDownloadReceipt}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:scale-105 transition-all duration-300"
                    style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}
                  >
                    <Download size={18} className="text-blue-300" />
                    <span className="text-white">Download Receipt</span>
                  </button>
                  
                  <button
                    onClick={handlePrintReceipt}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:scale-105 transition-all duration-300"
                    style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}
                  >
                    <FileText size={18} className="text-green-300" />
                    <span className="text-white">Print Receipt</span>
                  </button>
                  
                  <button
                    onClick={handleThemedPrint}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:scale-105 transition-all duration-300"
                    style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}
                  >
                    <FileCheck size={18} className="text-purple-300" />
                    <span className="text-white">Themed PDF</span>
                  </button>
                  
                  <button
                    onClick={() => setShowSendReceiptModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:scale-105 transition-all duration-300"
                    style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}
                  >
                    <Send size={18} className="text-green-300" />
                    <span className="text-white">Send Receipt to Tenant</span>
                  </button>
                  
                  {payment.status !== 'Paid' && (
                    <button
                      onClick={() => handleUpdateStatus('Paid')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:scale-105 transition-all duration-300"
                      style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}
                    >
                      <CheckCircle size={18} className="text-green-300" />
                      <span className="text-white">Mark as Paid</span>
                    </button>
                  )}
                  
                  {payment.status === 'Paid' && (
                    <button
                      onClick={() => handleUpdateStatus('Pending')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:scale-105 transition-all duration-300"
                      style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}
                    >
                      <Clock size={18} className="text-orange-300" />
                      <span className="text-white">Mark as Pending</span>
                    </button>
                  )}
                  
                  <Link
                    to={`/dashboard/payments/add?tenantId=${payment.tenantId?._id}`}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:scale-105 transition-all duration-300"
                    style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}
                  >
                    <DollarSign size={18} className="text-purple-300" />
                    <span className="text-white">Record New Payment</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Payment Timeline */}
            <PropertyStyleCard gradient="secondary">
              <h3 className="text-lg font-bold text-white/90 mb-4">Payment Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <CheckCircle size={16} className="text-green-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">Payment Recorded</p>
                    <p className="text-sm text-white/70">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                  </div>
                </div>
                {payment.createdAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <Clock size={16} className="text-blue-300" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">Entry Created</p>
                      <p className="text-sm text-white/70">{new Date(payment.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {payment.updatedAt && payment.updatedAt !== payment.createdAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <Edit size={16} className="text-orange-300" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">Last Updated</p>
                      <p className="text-sm text-white/70">{new Date(payment.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </PropertyStyleCard>

            {/* Related Payments */}
            <PropertyStyleCard gradient="primary">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white/90">Related Payments</h3>
                {payment.tenantId && (
                  <Link
                    to={`/dashboard/payments?tenantId=${payment.tenantId._id}`}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    View All
                  </Link>
                )}
              </div>
              <div className="space-y-3">
                {/* This would be populated with actual related payments */}
                <div className="p-4 rounded-xl text-center" style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)'}}>
                  <DollarSign size={24} className="mx-auto text-white/40 mb-2" />
                  <p className="text-white/70">No related payments found</p>
                </div>
              </div>
            </PropertyStyleCard>
          </div>
        </div>

        {/* Send Receipt Modal would be implemented here */}
        {/* Edit Payment Modal would be implemented here */}
      </motion.div>
    </PropertyStyleBackground>
  );
};

export default PaymentDetailsPage;