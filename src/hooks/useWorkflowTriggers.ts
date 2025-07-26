import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { smartWorkflowService } from '@/services/smartWorkflowService';

export const useWorkflowTriggers = () => {
  const queryClient = useQueryClient();

  // Payment workflow trigger
  const triggerPaymentWorkflow = async (payment: any) => {
    try {
      await smartWorkflowService.paymentReceived(payment);
      
      // Refresh related queries
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.invalidateQueries({ queryKey: ['cashFlow'] });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      
      return { success: true };
    } catch (error) {
      console.error('Payment workflow failed:', error);
      return { success: false, error };
    }
  };

  // Maintenance workflow trigger
  const triggerMaintenanceWorkflow = async (maintenance: any) => {
    try {
      await smartWorkflowService.maintenanceCompleted(maintenance);
      
      // Refresh related queries
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      
      return { success: true };
    } catch (error) {
      console.error('Maintenance workflow failed:', error);
      return { success: false, error };
    }
  };

  // Expense workflow trigger
  const triggerExpenseWorkflow = async (expense: any) => {
    try {
      await smartWorkflowService.expenseAdded(expense);
      
      // Refresh related queries
      queryClient.invalidateQueries({ queryKey: ['cashFlow'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      
      return { success: true };
    } catch (error) {
      console.error('Expense workflow failed:', error);
      return { success: false, error };
    }
  };

  // Tenant workflow trigger
  const triggerTenantWorkflow = async (tenant: any) => {
    try {
      await smartWorkflowService.tenantAdded(tenant);
      
      // Refresh related queries
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      
      return { success: true };
    } catch (error) {
      console.error('Tenant workflow failed:', error);
      return { success: false, error };
    }
  };

  return {
    triggerPaymentWorkflow,
    triggerMaintenanceWorkflow,
    triggerExpenseWorkflow,
    triggerTenantWorkflow
  };
};