import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api';

interface ExportOptions {
  type: 'properties' | 'tenants' | 'payments' | 'maintenance' | 'expenses';
  format: 'pdf' | 'csv';
  filters?: Record<string, any>;
  options?: Record<string, any>;
}

export const useExport = () => {
  const [exportProgress, setExportProgress] = useState<Record<string, number>>({});
  const [exportStatus, setExportStatus] = useState<Record<string, string>>({});

  const exportMutation = useMutation({
    mutationFn: async (data: ExportOptions) => {
      const response = await apiClient.post('/export/request', data);
      return response.data;
    },
    onSuccess: (data) => {
      const exportId = data.data._id;
      setExportStatus(prev => ({ ...prev, [exportId]: 'processing' }));
      pollExportStatus(exportId);
    },
    onError: (error: any) => {
      console.error('Export failed:', error);
      throw error;
    }
  });

  const pollExportStatus = async (exportId: string) => {
    const checkStatus = async () => {
      try {
        const response = await apiClient.get(`/export/status/${exportId}`);
        const exportData = response.data.data;

        setExportProgress(prev => ({ ...prev, [exportId]: exportData.progress }));
        setExportStatus(prev => ({ ...prev, [exportId]: exportData.status }));

        if (exportData.status === 'completed') {
          // Auto-download the file
          const downloadUrl = `/api/export/download/${exportId}`;
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = exportData.result?.fileName || 'export';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up state
          setTimeout(() => {
            setExportProgress(prev => {
              const newState = { ...prev };
              delete newState[exportId];
              return newState;
            });
            setExportStatus(prev => {
              const newState = { ...prev };
              delete newState[exportId];
              return newState;
            });
          }, 3000);
        } else if (exportData.status === 'failed') {
          console.error('Export failed:', exportData.error);
          // Clean up state
          setTimeout(() => {
            setExportProgress(prev => {
              const newState = { ...prev };
              delete newState[exportId];
              return newState;
            });
            setExportStatus(prev => {
              const newState = { ...prev };
              delete newState[exportId];
              return newState;
            });
          }, 3000);
        } else {
          // Continue polling
          setTimeout(checkStatus, 2000);
        }
      } catch (error) {
        console.error('Error checking export status:', error);
      }
    };

    checkStatus();
  };

  const exportData = (options: ExportOptions) => {
    return exportMutation.mutate(options);
  };

  const quickExport = {
    properties: (format: 'pdf' | 'csv' = 'pdf', filters?: Record<string, any>) =>
      exportData({ type: 'properties', format, filters }),
    
    tenants: (format: 'pdf' | 'csv' = 'pdf', filters?: Record<string, any>) =>
      exportData({ type: 'tenants', format, filters }),
    
    payments: (format: 'pdf' | 'csv' = 'pdf', filters?: Record<string, any>) =>
      exportData({ type: 'payments', format, filters }),
    
    maintenance: (format: 'pdf' | 'csv' = 'pdf', filters?: Record<string, any>) =>
      exportData({ type: 'maintenance', format, filters }),
    
    expenses: (format: 'pdf' | 'csv' = 'pdf', filters?: Record<string, any>) =>
      exportData({ type: 'expenses', format, filters })
  };

  return {
    exportData,
    quickExport,
    isExporting: exportMutation.isPending,
    exportProgress,
    exportStatus,
    error: exportMutation.error
  };
};

export default useExport;