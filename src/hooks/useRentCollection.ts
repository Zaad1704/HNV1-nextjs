import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export const useRentCollection = (year: number, month: number) => {
  const queryClient = useQueryClient();

  // Get collection period data
  const {
    data: collectionData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['collectionPeriod', year, month],
    queryFn: async () => {
      const response = await apiClient.get(`/rent-collection/period/${year}/${month}`);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000 // Refetch every 10 minutes
  });

  // Generate collection period
  const generatePeriodMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(`/rent-collection/period/${year}/${month}/generate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionPeriod', year, month] });
    }
  });

  // Generate collection sheet
  const generateSheetMutation = useMutation({
    mutationFn: async (options: any) => {
      const response = await apiClient.post(`/rent-collection/sheet/${collectionData._id}/create`, options);
      return response.data;
    },
    onSuccess: (data) => {
      // Auto-download the sheet
      if (data.data.result?.fileUrl) {
        window.open(data.data.result.fileUrl, '_blank');
      }
    }
  });

  // Record collection action
  const recordActionMutation = useMutation({
    mutationFn: async (actionData: any) => {
      const response = await apiClient.post('/rent-collection/action', actionData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionPeriod', year, month] });
      queryClient.invalidateQueries({ queryKey: ['collectionActions'] });
    }
  });

  // Update tenant notes
  const updateNotesMutation = useMutation({
    mutationFn: async ({ tenantId, notes }: { tenantId: string; notes: string }) => {
      const response = await apiClient.put(
        `/rent-collection/period/${collectionData._id}/tenant/${tenantId}/notes`,
        { notes }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionPeriod', year, month] });
    }
  });

  // Get collection actions
  const { data: collectionActions } = useQuery({
    queryKey: ['collectionActions', collectionData?._id],
    queryFn: async () => {
      if (!collectionData?._id) return [];
      const response = await apiClient.get(`/rent-collection/actions?periodId=${collectionData._id}`);
      return response.data.data;
    },
    enabled: !!collectionData?._id
  });

  // Get overdue payments
  const { data: overduePayments } = useQuery({
    queryKey: ['overduePayments'],
    queryFn: async () => {
      const response = await apiClient.get('/rent-collection/overdue');
      return response.data.data;
    },
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  });

  // Get collection analytics
  const { data: analytics } = useQuery({
    queryKey: ['collectionAnalytics'],
    queryFn: async () => {
      const response = await apiClient.get('/rent-collection/analytics');
      return response.data.data;
    },
    staleTime: 30 * 60 * 1000 // 30 minutes
  });

  // Helper functions
  const generateCollectionSheet = (options?: any) => {
    const defaultOptions = {
      format: {
        type: 'printable',
        layout: 'compact',
        groupBy: 'property'
      },
      sections: {
        header: {
          showLogo: true,
          showPeriod: true,
          showSummary: true,
          customText: `Monthly Rent Collection - ${getMonthName(month)} ${year}`
        },
        tenantList: {
          showCheckboxes: true,
          showContactInfo: true,
          showPaymentHistory: false,
          showNotes: true,
          sortBy: 'property'
        },
        footer: {
          showTotals: true,
          showSignature: true,
          showDate: true
        }
      },
      customization: {
        fieldsToShow: [
          'tenant_name', 'property', 'unit', 'rent_due',
          'late_fees', 'total_owed', 'due_date', 'contact_phone'
        ],
        checkboxStyle: 'square',
        fontSize: 'medium'
      }
    };

    return generateSheetMutation.mutate({ ...defaultOptions, ...options });
  };

  const recordAction = (tenantId: string, actionData: any) => {
    return recordActionMutation.mutate({
      tenantId,
      periodId: collectionData._id,
      ...actionData
    });
  };

  const updateTenantNotes = (tenantId: string, notes: string) => {
    return updateNotesMutation.mutate({ tenantId, notes });
  };

  const refreshPeriod = () => {
    return generatePeriodMutation.mutate();
  };

  // Quick action helpers
  const quickActions = {
    callTenant: (tenantId: string, notes: string, outcome: string = 'contacted') =>
      recordAction(tenantId, {
        type: 'call',
        details: { outcome, notes, method: 'phone' }
      }),

    emailTenant: (tenantId: string, notes: string, outcome: string = 'contacted') =>
      recordAction(tenantId, {
        type: 'email',
        details: { outcome, notes, method: 'email' }
      }),

    visitTenant: (tenantId: string, notes: string, outcome: string = 'contacted') =>
      recordAction(tenantId, {
        type: 'visit',
        details: { outcome, notes, method: 'in_person' }
      }),

    recordPayment: (tenantId: string, amount: number, date: Date, method: string = 'cash') =>
      recordAction(tenantId, {
        type: 'payment_received',
        details: { outcome: 'completed', notes: `Payment received: $${amount}` },
        paymentInfo: { actualAmount: amount, actualDate: date, paymentMethod: method }
      })
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  return {
    // Data
    collectionData,
    collectionActions,
    overduePayments,
    analytics,
    
    // Loading states
    isLoading,
    isGeneratingSheet: generateSheetMutation.isPending,
    isRecordingAction: recordActionMutation.isPending,
    isUpdatingNotes: updateNotesMutation.isPending,
    isRefreshing: generatePeriodMutation.isPending,
    
    // Actions
    generateCollectionSheet,
    recordAction,
    updateTenantNotes,
    refreshPeriod,
    quickActions,
    
    // Errors
    error,
    sheetError: generateSheetMutation.error,
    actionError: recordActionMutation.error
  };
};

export default useRentCollection;