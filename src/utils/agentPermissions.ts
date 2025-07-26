import apiClient from '@/lib/api';

export const requestApproval = async (type: string, description: string, requestData: any, relatedIds: any = {}) => {
  try {
    const approvalRequest = {
      type,
      description,
      requestData,
      priority: 'medium',
      ...relatedIds // propertyId, tenantId, paymentId, etc.
    };
    
    const response = await apiClient.post('/approvals', approvalRequest);
    return response.data;
  } catch (error) {
    console.error('Failed to request approval:', error);
    throw error;
  }
};

export const checkAgentPermission = (userRole: string, action: string): boolean => {
  if (userRole !== 'Agent') return true; // Non-agents have full permissions
  
  const restrictedActions = [
    'property_edit',
    'tenant_delete', 
    'payment_modify',
    'expense_add_large', // expenses over certain amount
    'maintenance_close'
  ];
  
  return !restrictedActions.includes(action);
};

export const getApprovalMessage = (action: string): string => {
  const messages = {
    'property_edit': 'Agent needs approval to edit property details',
    'tenant_delete': 'Agent needs approval to delete tenant records',
    'payment_modify': 'Agent needs approval to modify payment records',
    'expense_add_large': 'Agent needs approval to add large expenses',
    'maintenance_close': 'Agent needs approval to close maintenance requests'
  };
  
  return messages[action as keyof typeof messages] || 'Agent needs approval for this action';
};

export const handleRestrictedAction = async (
  userRole: string, 
  action: string, 
  description: string, 
  requestData: any,
  relatedIds: any = {},
  onApprovalNeeded?: () => void,
  onDirectAction?: () => void
) => {
  if (checkAgentPermission(userRole, action)) {
    // User has permission, execute directly
    if (onDirectAction) onDirectAction();
    return { needsApproval: false };
  } else {
    // Request approval
    try {
      await requestApproval(action, description, requestData, relatedIds);
      if (onApprovalNeeded) onApprovalNeeded();
      return { 
        needsApproval: true, 
        message: 'Approval request sent to landlord. You will be notified when approved.' 
      };
    } catch (error) {
      return { 
        needsApproval: true, 
        error: 'Failed to send approval request. Please try again.' 
      };
    }
  }
};