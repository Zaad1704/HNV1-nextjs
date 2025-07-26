import apiClient from '@/lib/api';

export const deleteProperty = async (propertyId: string) => {
  const response = await apiClient.delete(`/properties/${propertyId}`);
  return response.data;
};

export const deleteTenant = async (tenantId: string) => {
  const response = await apiClient.delete(`/tenants/${tenantId}`);
  return response.data;
};

export const deletePayment = async (paymentId: string) => {
  const response = await apiClient.delete(`/payments/${paymentId}`);
  return response.data;
};

export const deleteExpense = async (expenseId: string) => {
  const response = await apiClient.delete(`/expenses/${expenseId}`);
  return response.data;
};

export const deleteMaintenanceRequest = async (requestId: string) => {
  const response = await apiClient.delete(`/maintenance/${requestId}`);
  return response.data;
};

export const confirmDelete = (itemName: string, itemType: string = 'item'): boolean => {
  return confirm(
    `Are you sure you want to delete this ${itemType}${itemName ? ` "${itemName}"` : ''}?\n\nThis action cannot be undone.`
  );
};

export const handleDeleteError = (error: any, itemType: string = 'item') => {
  const message = error.response?.data?.message || error.message || `Failed to delete ${itemType}`;
  alert(`Error: ${message}`);
  console.error(`Delete ${itemType} error:`, error);
};

export const handleDeleteSuccess = (itemType: string = 'item') => {
  alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully!`);
};