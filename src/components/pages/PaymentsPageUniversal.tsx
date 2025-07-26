'use client';
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Plus, DollarSign, Calendar, User, Download, Building2, Edit, Receipt, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';
import LazyLoader from '@/components/common/LazyLoader';

// Import universal components
import UniversalSectionPage from '@/components/common/UniversalSectionPage';
import UniversalFloatingActionMenu from '@/components/common/UniversalFloatingActionMenu';
import UniversalRadialActionWheel from '@/components/common/UniversalRadialActionWheel';
import UniversalGlassyCard from '@/components/common/UniversalGlassyCard';
import UniversalSearchModal from '@/components/common/UniversalSearchModal';
import UniversalAnalyticsModal from '@/components/common/UniversalAnalyticsModal';
import PaymentHandoverModal from '@/components/common/PaymentHandoverModal';
import QuickPaymentModal from '@/components/common/QuickPaymentModal';
import BulkPaymentModal from '@/components/common/BulkPaymentModal';
import MonthlyCollectionSheet from '@/components/common/MonthlyCollectionSheet';

const fetchPayments = async () => {
  try {
    const { data } = await apiClient.get('/payments');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return [];
  }
};

const PaymentsPageUniversal = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkPayment, setShowBulkPayment] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showPaymentHandover, setShowPaymentHandover] = useState(false);
  const [showQuickPayment, setShowQuickPayment] = useState(false);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  
  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments
  });

  const handlePaymentSelect = (paymentId: string, selected: boolean) => {
    if (selected) {
      setSelectedPayments(prev => [...prev, paymentId]);
    } else {
      setSelectedPayments(prev => prev.filter(id => id !== paymentId));
    }
  };

  // Calculate stats
  const totalAmount = useMemo(() => {
    return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments]);

  const thisMonthPayments = useMemo(() => {
    const now = new Date();
    return payments.filter(p => {
      const paymentDate = new Date(p.paymentDate);
      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
    });
  }, [payments]);

  return (
    <>
    <UniversalSectionPage
      title="Payments"
      subtitle={`Track and manage rent payments (${payments.length} payments)`}
      icon={CreditCard}
      stats={[
        { label: 'Total', value: payments.length },
        { label: 'This Month', value: thisMonthPayments.length },
        { label: 'Amount', value: `$${totalAmount.toLocaleString()}` }
      ]}
      actionWheel={
        <UniversalRadialActionWheel
          actions={[
            { id: 'bulk', icon: Building2, label: 'Bulk Payment', onClick: () => setShowBulkPayment(true), angle: -60 },
            { id: 'export', icon: Download, label: 'Export Data', onClick: () => setShowExport(true), angle: 0 },
            { id: 'quick', icon: Zap, label: 'Quick Payment', onClick: () => setShowQuickPayment(true), angle: 60 }
          ]}
        />
      }
      addButton={
        <button 
          onClick={() => setShowQuickPayment(true)}
          className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Zap size={18} />
          Quick Payment
        </button>
      }
      floatingActionMenu={
        <UniversalFloatingActionMenu
          sectionName="Payment"
          onAddItem={() => setShowQuickPayment(true)}
          onBulkAction={() => setShowBulkPayment(true)}
          onExport={() => setShowExport(true)}
          onSearch={() => setShowSearch(true)}
          onAnalytics={() => setShowAnalytics(true)}
          onPaymentHandover={() => setShowPaymentHandover(true)}
          onQuickPayment={() => setShowQuickPayment(true)}
          onBulkPayment={() => setShowBulkPayment(true)}
          onCollectionSheet={() => setShowCollectionSheet(true)}
        />
      }
      aiInsightsData={{
        properties: payments.map(p => p.propertyId).filter(Boolean),
        tenants: payments.map(p => p.tenantId).filter(Boolean)
      }}
      smartSuggestionsData={{
        properties: payments.map(p => p.propertyId).filter(Boolean),
        tenants: payments.map(p => p.tenantId).filter(Boolean)
      }}
      isLoading={isLoading}
      error={error}
    >
      {payments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {payments.map((payment, index) => {
            const tenantImage = payment.tenantId?.imageUrl || payment.tenantId?.tenantImage || payment.tenantId?.image || payment.tenantId?.profileImage;
            const propertyImage = payment.propertyId?.imageUrl || payment.propertyId?.image || payment.propertyId?.images?.[0];
            
            return (
              <LazyLoader key={payment._id}>
                <div className="relative">
                  <UniversalGlassyCard
                    item={payment}
                    index={index}
                    icon={CreditCard}
                    title={payment.description || `Payment #${payment._id.substring(0, 8)}`}
                    subtitle={`${payment.tenantId?.name || 'Unknown Tenant'} - ${new Date(payment.paymentDate).toLocaleDateString()}`}
                    status={payment.status || 'Completed'}
                    imageUrl={tenantImage}
                    stats={[
                      { 
                        label: 'Amount', 
                        value: `$${payment.amount?.toLocaleString() || 0}`, 
                        icon: DollarSign,
                        color: 'text-green-300'
                      },
                      { 
                        label: 'Payment Date', 
                        value: new Date(payment.paymentDate).toLocaleDateString(), 
                        icon: Calendar,
                        color: 'text-blue-300'
                      },
                      { 
                        label: 'Tenant', 
                        value: payment.tenantId?.name || 'Unknown', 
                        icon: User,
                        color: 'text-purple-300'
                      }
                    ]}
                    badges={[
                      { label: 'Amount:', value: `$${payment.amount}`, color: 'bg-green-500' }
                    ]}
                    detailsPath={`/dashboard/payments-universal/${payment._id}`}
                    onEdit={() => {
                      // Role-based edit access
                      const canEdit = user?.role === 'Super Admin' || 
                                     user?.role === 'Admin' || 
                                     user?.role === 'Manager' ||
                                     user?.role === 'Landlord';
                      
                      if (canEdit) {
                        router.push(`/dashboard/payments-universal/${payment._id}`);
                      } else {
                        alert('You do not have permission to edit payments.');
                      }
                    }}
                    onDelete={() => {}}
                    secondaryActions={[
                      { 
                        icon: Receipt, 
                        label: 'Receipt', 
                        onClick: async () => {
                          const token = localStorage.getItem('token');
                          if (token) {
                            try {
                              const response = await fetch(`${apiClient.defaults.baseURL}/payments/${payment._id}/receipt-pdf`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              if (response.ok) {
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `Receipt_${payment._id}.pdf`;
                                link.click();
                                window.URL.revokeObjectURL(url);
                              } else {
                                alert('Failed to download receipt');
                              }
                            } catch (error) {
                              alert('Error downloading receipt');
                            }
                          }
                        }, 
                        color: 'bg-gradient-to-r from-blue-400 to-blue-500'
                      },
                      { 
                        icon: Zap, 
                        label: 'Quick Pay', 
                        onClick: () => setShowQuickPayment(true), 
                        color: 'bg-gradient-to-r from-green-400 to-green-500'
                      }
                    ]}
                    showCheckbox={false}
                    isSelected={selectedPayments.includes(payment._id)}
                    onSelect={handlePaymentSelect}
                  />
                  
                  {propertyImage && (
                    <div className="absolute top-4 left-4 w-12 h-12 rounded-full border-2 border-white/50 overflow-hidden shadow-lg" style={{background: 'rgba(139, 92, 246, 0.3)', backdropFilter: 'blur(10px)'}}>
                      <img 
                        src={propertyImage} 
                        alt={payment.propertyId?.name || 'Property'} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs hidden">
                        {payment.propertyId?.name?.charAt(0) || 'P'}
                      </div>
                    </div>
                  )}
                </div>
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
              <CreditCard size={64} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-4">
              No Payments Yet
            </h3>
            <p className="text-gray-300 mb-10 text-lg">
              Start tracking your rental income by recording payments.
            </p>
            <button 
              onClick={() => setShowQuickPayment(true)}
              className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium"
            >
              <Zap size={18} className="inline mr-2" />
              Quick Payment
            </button>
          </div>
        </div>
      )}
    </UniversalSectionPage>
    
    {/* Modals */}
    <UniversalSearchModal
      isOpen={showSearch}
      onClose={() => setShowSearch(false)}
      sectionName="Payment"
      onSearch={(query, filters) => {
        console.log('Search payments:', query, filters);
        // Implement search logic here
      }}
      data={payments}
    />
    
    <UniversalAnalyticsModal
      isOpen={showAnalytics}
      onClose={() => setShowAnalytics(false)}
      sectionName="Payment"
      data={payments}
    />
    
    <PaymentHandoverModal
      isOpen={showPaymentHandover}
      onClose={() => setShowPaymentHandover(false)}
      onHandover={async (data) => {
        console.log('Payment handover:', data);
        alert('Payment handover completed successfully!');
      }}
    />
    
    <QuickPaymentModal
      isOpen={showQuickPayment}
      onClose={() => setShowQuickPayment(false)}
    />
    
    <BulkPaymentModal
      isOpen={showBulkPayment}
      onClose={() => setShowBulkPayment(false)}
    />
    
    <MonthlyCollectionSheet
      isOpen={showCollectionSheet}
      onClose={() => setShowCollectionSheet(false)}
    />
  </>
  );
};

export default PaymentsPageUniversal;