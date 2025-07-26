import { Schema, model, Document } from 'mongoose';

export interface IApprovalRequest extends Document {
  type: 'property_edit' | 'tenant_delete' | 'payment_modify' | 'expense_add' | 'maintenance_close' | 'other';
  title: string;
  description: string;
  requestedBy: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  propertyId?: Schema.Types.ObjectId;
  tenantId?: Schema.Types.ObjectId;
  paymentId?: Schema.Types.ObjectId;
  expenseId?: Schema.Types.ObjectId;
  maintenanceId?: Schema.Types.ObjectId;
  requestData: any;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: Schema.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  attachments?: Array<{
    url: string;
    filename: string;
    uploadedAt: Date;
  }>;
  comments?: Array<{
    userId: Schema.Types.ObjectId;
    message: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ApprovalRequestSchema = new Schema<IApprovalRequest>({
  type: { 
    type: String, 
    enum: {
      values: ['property_edit', 'tenant_delete', 'payment_modify', 'expense_add', 'maintenance_close', 'other'],
      message: 'Invalid approval request type'
    },
    required: [true, 'Type is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  requestedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Requester is required'],
    index: true
  },
  organizationId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: [true, 'Organization is required'],
    index: true
  },
  propertyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Property',
    index: true
  },
  tenantId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Tenant',
    index: true
  },
  paymentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Payment',
    index: true
  },
  expenseId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Expense',
    index: true
  },
  maintenanceId: { 
    type: Schema.Types.ObjectId, 
    ref: 'MaintenanceRequest',
    index: true
  },
  requestData: { 
    type: Schema.Types.Mixed,
    required: [true, 'Request data is required']
  },
  status: { 
    type: String, 
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Status must be pending, approved, or rejected'
    },
    default: 'pending',
    index: true
  },
  approvedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    index: true
  },
  approvedAt: { type: Date },
  rejectionReason: { 
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  priority: { 
    type: String, 
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority must be low, medium, high, or urgent'
    },
    default: 'medium',
    index: true
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(v: Date) {
        return !v || v >= new Date();
      },
      message: 'Due date cannot be in the past'
    }
  },
  attachments: [{
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(v: string) {
          return /^(https?:\/\/)|(\/)/.test(v);
        },
        message: 'Attachment URL must be valid'
      }
    },
    filename: {
      type: String,
      required: true,
      trim: true,
      maxlength: [255, 'Filename cannot exceed 255 characters']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better performance
ApprovalRequestSchema.index({ organizationId: 1, status: 1, priority: -1 });
ApprovalRequestSchema.index({ requestedBy: 1, createdAt: -1 });
ApprovalRequestSchema.index({ type: 1, organizationId: 1 });
ApprovalRequestSchema.index({ dueDate: 1, status: 1 });
ApprovalRequestSchema.index({ createdAt: -1 });

// Text index for search
ApprovalRequestSchema.index({ 
  title: 'text', 
  description: 'text'
});

// Virtual for request age
ApprovalRequestSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  return Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for is overdue
ApprovalRequestSchema.virtual('isOverdue').get(function() {
  return this.dueDate && new Date() > this.dueDate && this.status === 'pending';
});

// Pre-save middleware
ApprovalRequestSchema.pre('save', async function(next) {
  try {
    // Auto-set due date based on priority if not provided
    if (!this.dueDate && this.isNew) {
      const now = new Date();
      const dueDateMap = {
        'urgent': 1,   // 1 day
        'high': 3,     // 3 days
        'medium': 7,   // 1 week
        'low': 14      // 2 weeks
      };
      
      const daysToAdd = dueDateMap[this.priority] || 7;
      this.dueDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    }
    
    // Set approval timestamp
    if (this.isModified('status') && (this.status === 'approved' || this.status === 'rejected')) {
      if (!this.approvedAt) {
        this.approvedAt = new Date();
      }
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Post-save middleware
ApprovalRequestSchema.post('save', async function(doc) {
  try {
    // Create audit log entry
    const AuditLog = require('./AuditLog').default;
    await AuditLog.create({
      userId: doc.requestedBy,
      organizationId: doc.organizationId,
      action: doc.isNew ? 'approval_request_created' : 'approval_request_updated',
      resource: 'approval_request',
      resourceId: doc._id,
      details: {
        type: doc.type,
        status: doc.status,
        priority: doc.priority,
        title: doc.title
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Audit log error (non-critical):', error);
  }
});

// Static methods
ApprovalRequestSchema.statics.findPending = function(organizationId: string) {
  return this.find({ organizationId, status: 'pending' })
    .populate('requestedBy', 'name email')
    .sort({ priority: -1, createdAt: -1 });
};

ApprovalRequestSchema.statics.findOverdue = function(organizationId: string) {
  return this.find({
    organizationId,
    status: 'pending',
    dueDate: { $lt: new Date() }
  }).populate('requestedBy', 'name email');
};

export default model<IApprovalRequest>('ApprovalRequest', ApprovalRequestSchema);