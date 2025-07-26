'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { Receipt, Download, Search, Calendar, Filter } from 'lucide-react';
import LazyLoader from '@/components/common/LazyLoader';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import SwipeableCard from '@/components/mobile/SwipeableCard';
import { useBackgroundRefresh } from '@/hooks/useBackgroundRefresh';
import MessageButtons from '@/components/common/MessageButtons';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalActionButton from '@/components/common/UniversalActionButton';
import UniversalSearch, { SearchFilters } from '@/components/common/UniversalSearch';
import { useCrossData } from '@/hooks/useCrossData';

const ReceiptsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    dateRange: 'all',
    status: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const { stats } = useCrossData();

  const { data: receipts = [], isLoading } = useQuery({
    queryKey: ['receipts', searchQuery, dateFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (dateFilter !== 'all') params.append('date', dateFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const { data } = await apiClient.get(`/receipts?${params.toString()}`);
      return data.data || [];
    }
  });

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

  // Background refresh
  useBackgroundRefresh([['receipts']], 60000);

  if (isLoading) {
    return <SkeletonLoader type="card" count={8} />;
  }

  return (
    <div className="space-y-8">
      <UniversalHeader
        title="Payment Receipts"
        subtitle={`View and manage all payment receipts (${receipts.length} total)`}
        icon={Receipt}
        stats={[
          { label: 'Total', value: receipts.length, color: 'blue' },
          { label: 'This Month', value: receipts.filter((r: any) => new Date(r.paymentDate).getMonth() === new Date().getMonth()).length, color: 'green' },
          { label: 'Generated', value: receipts.filter((r: any) => r.receiptNumber).length, color: 'purple' }
        ]}
      />

      <UniversalSearch
        onSearch={setSearchFilters}
        placeholder="Search receipts by tenant, property, or receipt number..."
        showStatusFilter={false}
      />

      {receipts.length > 0 ? (
        <div className="universal-grid universal-grid-1">
          {receipts.map((receipt: any, index: number) => (
            <LazyLoader key={receipt._id}>
              <div className="md:hidden">
                <SwipeableCard
                  onView={() => handleDownloadReceipt(receipt._id)}
                >
                  <UniversalCard delay={index * 0.05} gradient="blue">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 gradient-dark-orange-blue rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Receipt size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-brand-blue transition-colors">
                      Receipt #{receipt.receiptNumber}
                    </h3>
                    <p className="text-sm text-text-secondary font-medium">
                      {receipt.tenantName} - {receipt.propertyName}
                    </p>
                    <p className="text-xs text-text-muted">
                      {new Date(receipt.paymentDate).toLocaleDateString()} • Unit: {receipt.unitNumber}
                    </p>
                    {/* Related Data */}
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        receipt.receiptGenerated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {receipt.receiptGenerated ? 'Generated' : 'Manual'}
                      </span>
                      {receipt.isLatePayment && (
                        <span className="px-2 py-1 rounded-full bg-red-100 text-red-800">
                          Late Payment
                        </span>
                      )}
                      {receipt.remindersSent > 0 && (
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {receipt.remindersSent} Reminders Sent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">
                      ${receipt.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {receipt.rentMonth || 'N/A'}
                    </p>
                  </div>
                  
                  <UniversalActionButton
                    variant="primary"
                    size="sm"
                    icon={Download}
                    onClick={() => handleDownloadReceipt(receipt._id)}
                  >
                    Download PDF
                  </UniversalActionButton>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-app-border">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open(`/dashboard/tenants/${receipt.tenantId}`, '_blank')}
                      className="bg-blue-100 text-blue-800 py-1 px-3 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                    >
                      View Tenant
                    </button>
                    <button 
                      onClick={() => window.open(`/dashboard/payments/${receipt.paymentId}`, '_blank')}
                      className="bg-green-100 text-green-800 py-1 px-3 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                    >
                      View Payment
                    </button>
                  </div>
                  <MessageButtons
                    phone={receipt.tenantPhone}
                    email={receipt.tenantEmail}
                    name={receipt.tenantName}
                    messageType="receiptConfirmation"
                    additionalData={{
                      receiptNumber: receipt.receiptNumber,
                      amount: receipt.amount,
                      date: new Date(receipt.paymentDate).toLocaleDateString()
                    }}
                  />
                </div>
                {receipt.handwrittenReceiptNumber && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-text-secondary">
                      Manual Receipt #: {receipt.handwrittenReceiptNumber}
                    </p>
                  </div>
                )}
              </div>
                  </UniversalCard>
                </SwipeableCard>
              </div>
              <div className="hidden md:block">
                <UniversalCard delay={index * 0.05} gradient="blue">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 gradient-dark-orange-blue rounded-2xl flex items-center justify-center shadow-lg">
                        <Receipt size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-text-primary">Receipt #{receipt.receiptNumber}</h3>
                        <p className="text-sm text-text-secondary">{receipt.tenantName} - {receipt.propertyName}</p>
                      </div>
                    </div>
                  </div>
                </UniversalCard>
              </div>
            </LazyLoader>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Receipt size={64} className="text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-4">
            No Receipts Found
          </h3>
          <p className="text-text-secondary mb-8 max-w-lg mx-auto">
            No payment receipts match your current filters. Try adjusting your search criteria or generate new receipts from the payments section.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReceiptsPage;