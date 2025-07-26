import { useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export const useSmartWorkflows = () => {
  const queryClient = useQueryClient();

  const paymentReceived = async (paymentData: any) => {
    await apiClient.post('/receipts/generate', { paymentId: paymentData._id });
    queryClient.invalidateQueries({ queryKey: ['cashFlow'] });
    await apiClient.put(`/reminders/clear-tenant/${paymentData.tenantId}`);
    queryClient.setQueryData(['tenants'], (old: any) => 
      (old || []).map((t: any) => 
        t._id === paymentData.tenantId ? { ...t, status: 'Current' } : t
      )
    );
  };

  const maintenanceCompleted = async (maintenanceData: any) => {
    if (maintenanceData.actualCost > 0) {
      await apiClient.post('/expenses', {
        description: `Maintenance: ${maintenanceData.description}`,
        amount: maintenanceData.actualCost,
        propertyId: maintenanceData.propertyId,
        category: 'Maintenance'
      });
    }
    queryClient.invalidateQueries({ queryKey: ['properties'] });
  };

  const expenseAdded = async (expenseData: any) => {
    queryClient.invalidateQueries({ queryKey: ['cashFlow'] });
    const budget = await apiClient.get(`/budgets/property/${expenseData.propertyId}`);
    if (expenseData.amount > budget.data.monthlyLimit) {
      await apiClient.post('/approvals', {
        type: 'expense_over_budget',
        expenseId: expenseData._id,
        amount: expenseData.amount
      });
    }
  };

  return { paymentReceived, maintenanceCompleted, expenseAdded };
};