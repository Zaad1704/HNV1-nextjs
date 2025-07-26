'use client';
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Receipt, 
  Calendar, 
  Building2, 
  User, 
  FileText, 
  Edit, 
  ArrowLeft,
  Download,
  Share2,
  Save,
  X,
  DollarSign,
  Printer,
  Send,
  Eye
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useCurrency } from '@/contexts/CurrencyContext';
import UniversalGlassyCardSimple from '@/components/common/UniversalGlassyCardSimple';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';

const fetchReceiptDetails = async (id: string) => {
  const { data } = await apiClient.get(`/receipts/${id}`);
  return data.data;
};

const ReceiptDetailsPageUniversal = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { currency } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const { data: receipt, isLoading, error } = useQuery({
    queryKey: ['receipt', id],
    queryFn: () => fetchReceiptDetails(id!),
    enabled: Boolean(id)
  });

  const handleBack = () => {
    router.push('/dashboard/receipts-universal');
  };

  const handleDownloadReceipt = async () => {
    try {
      const response = await apiClient.get(`/receipts/${id}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receipt?.receiptNumber || id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download receipt');
    }
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open(`${apiClient.defaults.baseURL}/receipts/${id}/print`, '_blank');
    if (printWindow) {
      printWindow.onload = () => printWindow.print();
    } else {
      alert('Popup blocked. Please allow popups for this site.');
    }
  };

  const handleSendReceipt = async () => {
    const email = receipt?.tenantEmail || prompt('Enter email address:');
    if (email) {
      try {
        await apiClient.post(`/receipts/${id}/send`, { email });
        alert('Receipt sent successfully!');
      } catch (error) {
        console.error('Error sending receipt:', error);
        alert('Failed to send receipt. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-blue-500 rounded-full animate-pulse"></div>
        <span className="ml-3 text-white/70">Loading receipt details...</span>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-white mb-2">Receipt Not Found</h3>
        <p className="text-white/70 mb-4">The receipt you're looking for doesn't exist.</p>
        <button onClick={handleBack} className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-2xl font-semibold">
          Back to Receipts
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
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
                  Receipt Details - {currency}{(receipt?.amount || 0).toLocaleString()}
                </h1>
                <div className="flex items-center gap-2 text-white/90 mt-1">
                  <Receipt size={16} />
                  <span>Receipt #{receipt?.receiptNumber || 'N/A'} - {new Date(receipt?.paymentDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadReceipt}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
                title="Download PDF"
              >
                <Download size={20} className="text-white" />
              </button>
              <button
                onClick={handlePrintReceipt}
                className="p-2 rounded-xl transition-all duration-300 hover:scale-105 border border-white/30" 
                style={{background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(15px)'}}
                title="Print Receipt"
              >
                <Printer size={20} className="text-white" />
              </button>
              <button
                onClick={() => {
                  const shareData = {
                    title: `Receipt #${receipt?.receiptNumber} - ${currency}${receipt?.amount}`,
                    text: `Payment receipt for ${receipt?.tenantName || 'tenant'}`,
                    url: window.location.href
                  };
                  if (navigator.share) {
                    navigator.share(shareData);
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
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
          {/* Receipt Overview */}
          <UniversalGlassyCardSimple>
            <h3 className="text-lg font-bold mb-4 text-white/90">Receipt Overview</h3>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'rgba(34, 197, 94, 0.3)', backdropFilter: 'blur(10px)'}}>
                  <Receipt size={32} className="text-green-300" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{currency}{(receipt?.amount || 0).toLocaleString()}</h2>
                  <p className="text-green-400 font-medium">Receipt #{receipt?.receiptNumber || 'N/A'}</p>
                </div>
              </div>
              <UniversalStatusBadge 
                status={receipt?.receiptGenerated ? 'Generated' : 'Manual'} 
                variant={receipt?.receiptGenerated ? 'success' : 'warning'}
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
                    <p className="font-semibold text-white">{new Date(receipt?.paymentDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <FileText size={20} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Payment Method</p>
                    <p className="font-semibold text-white">{receipt?.paymentMethod || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Calendar size={20} className="text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Generated On</p>
                    <p className="font-semibold text-white">{receipt?.createdAt ? new Date(receipt.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                {receipt?.rentMonth && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <Calendar size={20} className="text-orange-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Rent Period</p>
                      <p className="font-semibold text-white">
                        {receipt?.rentMonth ? new Date(receipt.rentMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
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
                  onClick={handlePrintReceipt}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/30 hover:bg-green-500/50 text-white transition-colors font-medium"
                >
                  <Printer size={18} className="text-green-300" />
                  <span>Print Receipt</span>
                </button>
                
                <button
                  onClick={handleSendReceipt}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-orange-500/30 hover:bg-orange-500/50 text-white transition-colors font-medium"
                >
                  <Send size={18} className="text-orange-300" />
                  <span>Send to Tenant</span>
                </button>
              </div>
            </div>
          </UniversalGlassyCardSimple>

          {/* Tenant Information */}
          {receipt?.tenantId && (
            <UniversalGlassyCardSimple>
              <h3 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
                <User size={20} className="text-blue-300" />
                Tenant Information
              </h3>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                  <User size={32} className="text-blue-300" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{receipt?.tenantName || 'Unknown Tenant'}</h4>
                  <p className="text-blue-400">{receipt?.tenantEmail || 'No email'}</p>
                  {receipt?.tenantPhone && (
                    <p className="text-white/70">{receipt.tenantPhone}</p>
                  )}
                  <div className="mt-3">
                    {receipt?.tenantId && (
                      <Link to={`/dashboard/tenants/${receipt.tenantId}`} className="inline-flex items-center gap-1 bg-blue-500/50 hover:bg-blue-500/70 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                        <Eye size={14} />
                        View Tenant
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </UniversalGlassyCardSimple>
          )}

          {/* Property Information */}
          {receipt?.propertyId && (
            <UniversalGlassyCardSimple>
              <h3 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
                <Building2 size={20} className="text-purple-300" />
                Property Information
              </h3>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                  <Building2 size={32} className="text-purple-300" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{receipt?.propertyName || 'Unknown Property'}</h4>
                  {receipt?.propertyAddress && (
                    <p className="text-purple-400">{receipt.propertyAddress}</p>
                  )}
                  <div className="mt-3">
                    {receipt?.propertyId && (
                      <Link to={`/dashboard/properties/${receipt.propertyId}`} className="inline-flex items-center gap-1 bg-purple-500/50 hover:bg-purple-500/70 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                        <Eye size={14} />
                        View Property
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </UniversalGlassyCardSimple>
          )}

          {/* Payment Information */}
          {receipt?.paymentId && (
            <UniversalGlassyCardSimple>
              <h3 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
                <DollarSign size={20} className="text-green-300" />
                Payment Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(34, 197, 94, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <DollarSign size={20} className="text-green-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Payment ID</p>
                      <p className="font-semibold text-white font-mono">{receipt?.paymentId}</p>
                    </div>
                  </div>
                  {receipt?.isLatePayment && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(10px)'}}>
                        <FileText size={20} className="text-red-300" />
                      </div>
                      <div>
                        <p className="text-sm text-white/70">Payment Status</p>
                        <p className="font-semibold text-red-300">Late Payment</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="mt-3">
                    <Link to={`/dashboard/payments-universal/${receipt?.paymentId}`} className="inline-flex items-center gap-1 bg-green-500/50 hover:bg-green-500/70 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                      <Eye size={14} />
                      View Payment
                    </Link>
                  </div>
                </div>
              </div>
            </UniversalGlassyCardSimple>
          )}

          {/* Receipt Details */}
          <UniversalGlassyCardSimple>
            <h3 className="text-lg font-bold text-white/90 flex items-center gap-2 mb-4">
              <FileText size={20} className="text-yellow-300" />
              Receipt Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249, 115, 22, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Receipt size={20} className="text-orange-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Receipt ID</p>
                    <p className="font-semibold text-white font-mono">{receipt?._id || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(52, 211, 153, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <Calendar size={20} className="text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Created At</p>
                    <p className="font-semibold text-white">{receipt?.createdAt ? new Date(receipt.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                    <FileText size={20} className="text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Type</p>
                    <p className="font-semibold text-white">{receipt?.receiptGenerated ? 'Auto-Generated' : 'Manual'}</p>
                  </div>
                </div>
                {receipt?.notes && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(59, 130, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <FileText size={20} className="text-blue-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Notes</p>
                      <p className="font-semibold text-white">{receipt.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </UniversalGlassyCardSimple>
        </div>
      </div>
    </>
  );
};

export default ReceiptDetailsPageUniversal;