'use client';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, DollarSign, User } from 'lucide-react';

interface StatementItem {
  _id: string;
  date: string;
  description: string;
  amount: number;
  type: 'charge' | 'payment' | 'credit';
}

interface TenantStatement {
  tenant: {
    name: string;
    email: string;
    unit: string;
  };
  property: {
    name: string;
    address: string;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  items: StatementItem[];
  totalCharges: number;
  totalPayments: number;
  balance: number;
}

const fetchTenantStatement = async (tenantId: string, period: string): Promise<TenantStatement> => {
  const { data } = await apiClient.get(`/tenant-portal/statement/${tenantId}?period=${period}`);
  return data.data;
};

const TenantStatementPage = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  const { data: statement, isLoading, error } = useQuery({
    queryKey: ['tenantStatement', tenantId, selectedPeriod],
    queryFn: () => fetchTenantStatement(tenantId!, selectedPeriod),
    enabled: !!tenantId
  });

  const handleDownloadStatement = async (format: 'pdf' | 'thermal') => {
    try {
      const response = await apiClient.get(`/tenant-portal/statement/${tenantId}?period=${selectedPeriod}&format=${format}`, {
        responseType: 'blob'
      });
      
      const contentType = format === 'pdf' ? 'application/pdf' : 'text/plain';
      const fileExtension = format === 'pdf' ? 'pdf' : 'txt';
      
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      if (format === 'thermal') {
        // For thermal, open in a new window for printing
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        } else {
          // If popup blocked, download instead
          const link = document.createElement('a');
          link.href = url;
          link.download = `statement-${selectedPeriod}-thermal.${fileExtension}`;
          link.click();
        }
      } else {
        // For PDF, download the file
        const link = document.createElement('a');
        link.href = url;
        link.download = `statement-${selectedPeriod}.${fileExtension}`;
        link.click();
      }
      
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to download statement';
      alert(`Error: ${errorMessage}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading statement...</span>
      </div>
    );
  }

  if (error || !statement) {
    return (
      <div className="text-center py-16">
        <FileText size={48} className="mx-auto text-text-muted mb-4" />
        <h3 className="text-xl font-semibold text-text-primary mb-2">Statement Not Available</h3>
        <p className="text-text-secondary">Unable to load the tenant statement.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Tenant Statement</h1>
          <p className="text-text-secondary mt-1">
            {new Date(statement.period.startDate).toLocaleDateString()} - {new Date(statement.period.endDate).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 rounded-2xl border border-app-border bg-app-surface"
          >
            <option value="current">Current Month</option>
            <option value="last">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleDownloadStatement('pdf')}
              className="btn-gradient px-4 py-2 rounded-2xl flex items-center gap-2 font-semibold"
            >
              <Download size={16} />
              PDF
            </button>
            
            <button
              onClick={() => handleDownloadStatement('thermal')}
              className="bg-purple-500 text-white px-4 py-2 rounded-2xl flex items-center gap-2 font-semibold"
            >
              <FileText size={16} />
              Thermal
            </button>
          </div>
        </div>
      </div>

      {/* Statement Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tenant & Property Info */}
        <div className="app-surface rounded-3xl p-6 border border-app-border">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <User size={20} />
            Tenant Information
          </h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-text-secondary">Name</p>
              <p className="font-medium text-text-primary">{statement.tenant.name}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Email</p>
              <p className="font-medium text-text-primary">{statement.tenant.email}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Unit</p>
              <p className="font-medium text-text-primary">{statement.tenant.unit}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Property</p>
              <p className="font-medium text-text-primary">{statement.property.name}</p>
              <p className="text-xs text-text-muted">{statement.property.address}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2 app-surface rounded-3xl p-6 border border-app-border">
          <h3 className="font-semibold text-text-primary mb-6 flex items-center gap-2">
            <DollarSign size={20} />
            Statement Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-2xl">
              <p className="text-2xl font-bold text-blue-600">
                ${statement.totalCharges.toLocaleString()}
              </p>
              <p className="text-sm text-blue-800">Total Charges</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-2xl">
              <p className="text-2xl font-bold text-green-600">
                ${statement.totalPayments.toLocaleString()}
              </p>
              <p className="text-sm text-green-800">Total Payments</p>
            </div>
            
            <div className={`text-center p-4 rounded-2xl ${
              statement.balance >= 0 ? 'bg-red-50' : 'bg-green-50'
            }`}>
              <p className={`text-2xl font-bold ${
                statement.balance >= 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                ${Math.abs(statement.balance).toLocaleString()}
              </p>
              <p className={`text-sm ${
                statement.balance >= 0 ? 'text-red-800' : 'text-green-800'
              }`}>
                {statement.balance >= 0 ? 'Amount Due' : 'Credit Balance'}
              </p>
            </div>
          </div>

          {/* Statement Items */}
          <div className="space-y-3">
            <h4 className="font-medium text-text-primary">Transaction Details</h4>
            {statement.items.map((item: StatementItem) => (
              <div key={item._id} className="flex justify-between items-center p-4 bg-app-bg rounded-2xl">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-text-muted" />
                  <div>
                    <p className="font-medium text-text-primary">{item.description}</p>
                    <p className="text-sm text-text-secondary">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-semibold ${
                    item.type === 'payment' ? 'text-green-600' : 
                    item.type === 'credit' ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {item.type === 'payment' || item.type === 'credit' ? '-' : '+'}
                    ${item.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-text-muted capitalize">{item.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TenantStatementPage;