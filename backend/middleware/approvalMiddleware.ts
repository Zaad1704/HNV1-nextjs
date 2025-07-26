import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: any;
}

// Actions that require approval for agents
const APPROVAL_REQUIRED_ACTIONS = {
  expense: ['create', 'update', 'delete'], // Expenses over $500
  maintenance: ['update', 'delete'], // Maintenance requests
  payment: ['delete'], // Payment deletions
  tenant: ['delete'], // Tenant deletions
  property: ['delete'] // Property deletions
};

const ApprovalSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  action: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

const Approval = mongoose.models.Approval || mongoose.model('Approval', ApprovalSchema);

export const requireApproval = (resourceType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Skip approval for landlords and super admins
      if (req.user?.role === 'Landlord' || req.user?.role === 'Super Admin') {
        return next();
      }

      // Skip approval for agents on GET requests
      if (req.method === 'GET') {
        return next();
      }

      const action = req.method === 'POST' ? 'create' : 
                    req.method === 'PUT' ? 'update' : 
                    req.method === 'DELETE' ? 'delete' : 'unknown';

      // Check if this action requires approval
      const requiredActions = APPROVAL_REQUIRED_ACTIONS[resourceType as keyof typeof APPROVAL_REQUIRED_ACTIONS];
      if (!requiredActions || !requiredActions.includes(action)) {
        return next();
      }

      // Special case: expenses over $500 require approval
      if (resourceType === 'expense' && action === 'create') {
        const amount = parseFloat(req.body.amount);
        if (amount < 500) {
          return next();
        }
      }

      // Create approval request
      const approval = await Approval.create({
        organizationId: req.user.organizationId,
        requestedBy: req.user._id,
        type: resourceType,
        resourceId: req.params.id || 'new',
        action,
        data: req.body,
        status: 'pending'
      });

      return res.status(202).json({
        success: true,
        message: 'Request submitted for approval',
        approvalId: approval._id,
        requiresApproval: true
      });

    } catch (error) {
      console.error('Approval middleware error:', error);
      next();
    }
  };
};

export default requireApproval;