import { useState } from 'react';
import apiClient from '@/lib/api';

interface ExportOptions {
  format: 'xlsx' | 'csv' | 'pdf';
  filters?: any;
  dateRange?: {
    start: string;
    end: string;
  };
}

export const useDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async (endpoint: string, filename: string, options: ExportOptions) => {
    setIsExporting(true);
    try {
      const response = await apiClient.post(`/export/${endpoint}`, options, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${options.format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      // Don't throw error, just log it
      alert('Export feature is not available yet.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportProperties = async (options: ExportOptions) => {
    return exportData('properties', 'properties', options);
  };

  const exportTenants = async (options: ExportOptions) => {
    return exportData('tenants', 'tenants', options);
  };

  const exportPayments = async (options: ExportOptions) => {
    return exportData('payments', 'payments', options);
  };

  const exportExpenses = async (options: ExportOptions) => {
    return exportData('expenses', 'expenses', options);
  };

  return {
    isExporting,
    exportData,
    exportProperties,
    exportTenants,
    exportPayments,
    exportExpenses
  };
};