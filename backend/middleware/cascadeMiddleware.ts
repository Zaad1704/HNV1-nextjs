import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Receipt from '../models/Receipt';
import Expense from '../models/Expense';

// Cascade operations when property is deleted/archived
export const cascadePropertyChanges = async (propertyId: string, action: 'delete' | 'archive', organizationId: string) => {
  try {
    if (action === 'delete') {
      // Delete all related data
      await Promise.all([
        Tenant.deleteMany({ propertyId, organizationId }),
        Payment.deleteMany({ propertyId, organizationId }),
        Receipt.deleteMany({ propertyId, organizationId }),
        Expense.deleteMany({ propertyId, organizationId })
      ]);
    } else if (action === 'archive') {
      // Archive all related data
      await Promise.all([
        Tenant.updateMany({ propertyId, organizationId }, { status: 'Archived' }),
        Payment.updateMany({ propertyId, organizationId }, { status: 'Archived' }),
        Receipt.updateMany({ propertyId, organizationId }, { status: 'Archived' }),
        Expense.updateMany({ propertyId, organizationId }, { status: 'Archived' })
      ]);
    }
  } catch (error) {
    console.error('Cascade property changes error:', error);
    throw error;
  }
};

// Cascade operations when tenant is deleted/archived
export const cascadeTenantChanges = async (tenantId: string, action: 'delete' | 'archive', organizationId: string) => {
  try {
    const [MaintenanceRequest, Reminder, ApprovalRequest, AuditLog] = await Promise.all([
      import('../models/MaintenanceRequest'),
      import('../models/Reminder'),
      import('../models/ApprovalRequest'),
      import('../models/AuditLog')
    ]);

    if (action === 'delete') {
      // Delete all related data
      await Promise.all([
        Payment.deleteMany({ tenantId, organizationId }),
        Receipt.deleteMany({ tenantId, organizationId }),
        MaintenanceRequest.default.deleteMany({ tenantId, organizationId }),
        Reminder.default.deleteMany({ tenantId, organizationId }),
        ApprovalRequest.default.deleteMany({ tenantId, organizationId }),
        AuditLog.default.deleteMany({ 
          organizationId,
          $or: [{ resourceId: tenantId }, { 'metadata.tenantId': tenantId }]
        })
      ]);
    } else if (action === 'archive') {
      // Archive all related data
      await Promise.all([
        Payment.updateMany({ tenantId, organizationId }, { status: 'Archived' }),
        Receipt.updateMany({ tenantId, organizationId }, { status: 'Archived' }),
        MaintenanceRequest.default.updateMany({ tenantId, organizationId }, { status: 'Archived' }),
        Reminder.default.updateMany({ tenantId, organizationId }, { status: 'inactive' }),
        ApprovalRequest.default.updateMany({ tenantId, organizationId }, { status: 'archived' })
      ]);
    }
  } catch (error) {
    console.error('Cascade tenant changes error:', error);
    throw error;
  }
};