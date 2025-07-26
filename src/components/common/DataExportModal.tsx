import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { Download, Calendar, FileText } from 'lucide-react';

interface ExportOptions {
  section: string;
  dateRange: 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';
  startDate?: string;
  endDate?: string;
  format: 'csv' | 'pdf';
}

const DataExportModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [options, setOptions] = useState<ExportOptions>({
    section: 'tenants',
    dateRange: 'month',
    format: 'csv'
  });

  const exportMutation = useMutation({
    mutationFn: async (exportOptions: ExportOptions) => {
      const response = await apiClient.post('/reports/export', exportOptions, {
        responseType: 'blob'
      });
      return response.data;
    },
    onSuccess: (data) => {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${options.section}-export-${Date.now()}.${options.format}`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    }
  });

  const sections = [
    { value: 'tenants', label: 'Tenants' },
    { value: 'properties', label: 'Properties' },
    { value: 'payments', label: 'Payments' },
    { value: 'expenses', label: 'Expenses' },
    { value: 'maintenance', label: 'Maintenance Requests' },
    { value: 'cashflow', label: 'Cash Flow' },
    { value: 'all', label: 'All Data' }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleExport = () => {
    exportMutation.mutate(options);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText size={24} />
            Export Data
          </h2>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Section to Export
            </label>
            <select
              value={options.section}
              onChange={(e) => setOptions({...options, section: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {sections.map(section => (
                <option key={section.value} value={section.value}>{section.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <select
              value={options.dateRange}
              onChange={(e) => setOptions({...options, dateRange: e.target.value as any})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>

          {options.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={options.startDate || ''}
                  onChange={(e) => setOptions({...options, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={options.endDate || ''}
                  onChange={(e) => setOptions({...options, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Format
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={options.format === 'csv'}
                  onChange={(e) => setOptions({...options, format: e.target.value as any})}
                  className="mr-2"
                />
                CSV
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pdf"
                  checked={options.format === 'pdf'}
                  onChange={(e) => setOptions({...options, format: e.target.value as any})}
                  className="mr-2"
                />
                PDF
              </label>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exportMutation.isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Download size={16} />
            {exportMutation.isLoading ? 'Exporting...' : 'Export'}
          </button>
        </div>
        
        <div className="px-6 pb-4 text-xs text-gray-500 text-center">
          Powered by HNV Property Management Solutions
        </div>
      </div>
    </div>
  );
};

export default DataExportModal;