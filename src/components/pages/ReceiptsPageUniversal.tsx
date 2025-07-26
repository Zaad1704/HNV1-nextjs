'use client';
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Receipt, Plus, DollarSign, Calendar, User, Download, Building2 } from 'lucide-react';
import apiClient from '@/lib/api';
import LazyLoader from '@/components/common/LazyLoader';

// Import universal components
import UniversalSectionPage from '@/components/common/UniversalSectionPage';
import UniversalFloatingActionMenu from '@/components/common/UniversalFloatingActionMenu';
import UniversalRadialActionWheel from '@/components/common/UniversalRadialActionWheel';
import UniversalGlassyCard from '@/components/common/UniversalGlassyCard';
import UniversalSearchModal from '@/components/common/UniversalSearchModal';
import UniversalAnalyticsModal from '@/components/common/UniversalAnalyticsModal';

const fetchReceipts = async () => {
  try {
    const { data } = await apiClient.get('/receipts');
    return data.data || [];
  } catch (error) {
    console.error('Failed to fetch receipts:', error);
    return [];
  }
};

const ReceiptsPageUniversal = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedReceipts, setSelectedReceipts] = useState<string[]>([]);
  
  const { data: receipts = [], isLoading, error } = useQuery({
    queryKey: ['receipts'],
    queryFn: fetchReceipts
  });

  const handleReceiptSelect = (receiptId: string, selected: boolean) => {
    if (selected) {
      setSelectedReceipts(prev => [...prev, receiptId]);
    } else {
      setSelectedReceipts(prev => prev.filter(id => id !== receiptId));
    }
  };

  // Calculate stats
  const thisMonthReceipts = useMemo(() => {
    const now = new Date();
    return receipts.filter((r: any) => {
      const receiptDate = new Date(r.paymentDate);
      return receiptDate.getMonth() === now.getMonth() && receiptDate.getFullYear() === now.getFullYear();
    });
  }, [receipts]);

  const handleDownloadReceipt = async (receiptId: string) => {
    try {
      const response = await apiClient.get(`/receipts/${receiptId}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${receiptId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download receipt');
    }
  };

  return (
    <>
    <UniversalSectionPage
      title="Receipts"
      subtitle={`View and manage payment receipts (${receipts.length} receipts)`}
      icon={Receipt}
      stats={[
        { label: 'Total', value: receipts.length },
        { label: 'This Month', value: thisMonthReceipts.length },
        { label: 'Generated', value: receipts.filter((r: any) => r.receiptNumber).length }
      ]}
      actionWheel={
        <UniversalRadialActionWheel
          actions={[
            { id: 'bulk', icon: Building2, label: 'Bulk Action', onClick: () => setShowBulkAction(true), angle: -60 },
            { id: 'export', icon: Download, label: 'Export Data', onClick: () => setShowExport(true), angle: 0 },
            { id: 'add', icon: Plus, label: 'Generate Receipt', onClick: () => setShowAddModal(true), angle: 60 }
          ]}
        />
      }
      addButton={
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus size={18} />
          Generate Receipt
        </button>
      }
      floatingActionMenu={
        <UniversalFloatingActionMenu
          sectionName="Receipt"
          onAddItem={() => setShowAddModal(true)}
          onBulkAction={() => setShowBulkAction(true)}
          onExport={() => setShowExport(true)}
          onSearch={() => setShowSearch(true)}
          onAnalytics={() => setShowAnalytics(true)}
        />
      }
      aiInsightsData={{
        properties: receipts.map((r: any) => r.propertyId).filter(Boolean),
        tenants: receipts.map((r: any) => r.tenantId).filter(Boolean)
      }}
      smartSuggestionsData={{
        properties: receipts.map((r: any) => r.propertyId).filter(Boolean),
        tenants: receipts.map((r: any) => r.tenantId).filter(Boolean)
      }}
      isLoading={isLoading}
      error={error}
    >
      {receipts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {receipts.map((receipt: any, index: number) => (
            <LazyLoader key={receipt._id}>
              <UniversalGlassyCard
                item={receipt}
                index={index}
                icon={Receipt}
                title={`Receipt #${receipt.receiptNumber || 'N/A'}`}
                subtitle={`${receipt.tenantName || 'Unknown Tenant'} - ${new Date(receipt.paymentDate).toLocaleDateString()}`}
                status={receipt.receiptGenerated ? 'Generated' : 'Manual'}
                stats={[
                  { 
                    label: 'Amount', 
                    value: `$${receipt.amount?.toLocaleString() || 0}`, 
                    icon: DollarSign,
                    color: 'text-green-300'
                  },
                  { 
                    label: 'Payment Date', 
                    value: new Date(receipt.paymentDate).toLocaleDateString(), 
                    icon: Calendar,
                    color: 'text-blue-300'
                  },
                  { 
                    label: 'Tenant', 
                    value: receipt.tenantName || 'Unknown', 
                    icon: User,
                    color: 'text-purple-300'
                  },
                  { 
                    label: 'Property', 
                    value: receipt.propertyName || 'Unknown', 
                    icon: Building2,
                    color: 'text-orange-300'
                  }
                ]}
                badges={[
                  { label: 'Amount:', value: `$${receipt.amount}`, color: 'bg-green-500' },
                  ...(receipt.isLatePayment ? [{ label: 'Late', value: '', color: 'bg-red-500' }] : [])
                ]}
                detailsPath={`/dashboard/receipts-universal/${receipt._id}`}
                onEdit={() => {}}
                onDelete={() => {}}
                secondaryActions={[
                  { 
                    icon: Download, 
                    label: 'Download', 
                    onClick: () => handleDownloadReceipt(receipt._id), 
                    color: 'bg-gradient-to-r from-blue-400 to-blue-500'
                  }
                ]}
                showCheckbox={false}
                isSelected={selectedReceipts.includes(receipt._id)}
                onSelect={handleReceiptSelect}
              />
            </LazyLoader>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="rounded-2xl p-12 shadow-lg max-w-lg mx-auto border-2 border-white/20" 
               style={{background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(20px)'}}>
            <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-lg border-2 border-white/20"
                 style={{background: 'rgba(249, 115, 22, 0.3)'}}>
              <Receipt size={64} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-blue-400 bg-clip-text text-transparent mb-4">
              No Receipts Yet
            </h3>
            <p className="text-gray-300 mb-10 text-lg">
              Generate receipts for your payments to keep track of your rental income.
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-orange-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium"
            >
              <Plus size={18} className="inline mr-2" />
              Generate Receipt
            </button>
          </div>
        </div>
      )}
    </UniversalSectionPage>
    
    {/* Modals */}
    <UniversalSearchModal
      isOpen={showSearch}
      onClose={() => setShowSearch(false)}
      sectionName="Receipt"
      onSearch={(query, filters) => {
        console.log('Search receipts:', query, filters);
      }}
      data={receipts}
    />
    
    <UniversalAnalyticsModal
      isOpen={showAnalytics}
      onClose={() => setShowAnalytics(false)}
      sectionName="Receipt"
      data={receipts}
    />
  </>
  );
};

export default ReceiptsPageUniversal;