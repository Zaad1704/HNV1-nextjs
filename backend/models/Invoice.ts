import mongoose, { Schema, Document, model, Types } from 'mongoose';

export interface IInvoice extends Document {
  tenantId: Types.ObjectId;
  propertyId: Types.ObjectId;
  organizationId: Types.ObjectId;
  leaseId?: Types.ObjectId;
  invoiceNumber: string;
  title?: string;
  amount: number;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  issueDate: Date;
  dueDate: Date;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Paid' | 'Overdue' | 'Cancelled' | 'Refunded';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  category: 'Rent' | 'Utilities' | 'Maintenance' | 'Late Fee' | 'Security Deposit' | 'Other';
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    taxRate?: number;
  }[];
  paymentTerms?: string;
  notes?: string;
  paidAt?: Date;
  sentAt?: Date;
  viewedAt?: Date;
  transactionId?: string;
  paymentMethod?: string;
  recurringInfo?: {
    isRecurring: boolean;
    frequency: 'Monthly' | 'Quarterly' | 'Yearly';
    nextInvoiceDate?: Date;
    endDate?: Date;
  };
  attachments?: Array<{
    url: string;
    filename: string;
    description?: string;
    uploadedAt: Date;
  }>;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema<IInvoice> = new Schema({
  tenantId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Tenant', 
    required: [true, 'Tenant is required'],
    index: true
  },
  propertyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Property', 
    required: [true, 'Property is required'],
    index: true
  },
  organizationId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: [true, 'Organization is required'],
    index: true
  },
  leaseId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Lease',
    index: true
  },
  invoiceNumber: { 
    type: String, 
    required: [true, 'Invoice number is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Invoice number cannot exceed 50 characters'],
    index: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  amount: { 
    type: Number, 
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  taxAmount: {
    type: Number,
    min: [0, 'Tax amount cannot be negative'],
    default: 0
  },
  discountAmount: {
    type: Number,
    min: [0, 'Discount amount cannot be negative'],
    default: 0
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now,
    index: true
  },
  dueDate: { 
    type: Date, 
    required: [true, 'Due date is required'],
    validate: {
      validator: function(this: IInvoice, v: Date) {
        return v >= this.issueDate;
      },
      message: 'Due date must be after issue date'
    },
    index: true
  },
  status: { 
    type: String, 
    default: 'Draft',
    enum: {
      values: ['Draft', 'Sent', 'Viewed', 'Paid', 'Overdue', 'Cancelled', 'Refunded'],
      message: 'Invalid status value'
    },
    index: true
  },
  priority: {
    type: String,
    enum: {
      values: ['Low', 'Medium', 'High', 'Urgent'],
      message: 'Priority must be Low, Medium, High, or Urgent'
    },
    default: 'Medium'
  },
  category: {
    type: String,
    enum: {
      values: ['Rent', 'Utilities', 'Maintenance', 'Late Fee', 'Security Deposit', 'Other'],
      message: 'Invalid category'
    },
    required: [true, 'Category is required'],
    index: true
  },
  lineItems: [{
    description: { 
      type: String, 
      required: [true, 'Line item description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 1
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    amount: { 
      type: Number, 
      required: [true, 'Line item amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    taxRate: {
      type: Number,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%'],
      default: 0
    }
  }],
  paymentTerms: {
    type: String,
    trim: true,
    maxlength: [500, 'Payment terms cannot exceed 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  paidAt: { type: Date },
  sentAt: { type: Date },
  viewedAt: { type: Date },
  transactionId: { 
    type: String,
    trim: true,
    maxlength: [100, 'Transaction ID cannot exceed 100 characters']
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['Cash', 'Bank Transfer', 'Check', 'Credit Card', 'Debit Card', 'Mobile Payment', 'Online', 'Other'],
      message: 'Invalid payment method'
    }
  },
  recurringInfo: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: {
        values: ['Monthly', 'Quarterly', 'Yearly'],
        message: 'Frequency must be Monthly, Quarterly, or Yearly'
      }
    },
    nextInvoiceDate: {
      type: Date,
      validate: {
        validator: function(v: Date) {
          return !v || v > new Date();
        },
        message: 'Next invoice date must be in the future'
      }
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(this: IInvoice, v: Date) {
          return !v || !this.recurringInfo?.nextInvoiceDate || v > this.recurringInfo.nextInvoiceDate;
        },
        message: 'End date must be after next invoice date'
      }
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
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
    index: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
InvoiceSchema.index({ organizationId: 1, status: 1, dueDate: 1 });
InvoiceSchema.index({ tenantId: 1, status: 1 });
InvoiceSchema.index({ propertyId: 1, issueDate: -1 });
InvoiceSchema.index({ organizationId: 1, category: 1 });
InvoiceSchema.index({ createdAt: -1 });
InvoiceSchema.index({ invoiceNumber: 1, organizationId: 1 }, { unique: true });

// Text index for search
InvoiceSchema.index({ 
  invoiceNumber: 'text', 
  title: 'text',
  notes: 'text'
});

// Virtual for days overdue
InvoiceSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'Paid' || !this.dueDate) return 0;
  const now = new Date();
  const due = new Date(this.dueDate);
  return Math.max(0, Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
});

// Virtual for is overdue
InvoiceSchema.virtual('isOverdue').get(function() {
  return this.status !== 'Paid' && this.dueDate && new Date() > this.dueDate;
});

// Virtual for formatted amounts
InvoiceSchema.virtual('formattedAmount').get(function() {
  return `$${this.totalAmount.toFixed(2)}`;
});

// Pre-save middleware
InvoiceSchema.pre('save', async function(next) {
  try {
    // Auto-calculate amounts
    this.subtotal = this.lineItems.reduce((sum, item) => sum + item.amount, 0);
    this.totalAmount = this.subtotal + (this.taxAmount || 0) - (this.discountAmount || 0);
    this.amount = this.totalAmount; // Keep for backward compatibility
    
    // Auto-update status based on due date
    if (this.status !== 'Paid' && this.status !== 'Cancelled' && this.dueDate && new Date() > this.dueDate) {
      this.status = 'Overdue';
    }
    
    // Set sent timestamp
    if (this.isModified('status') && this.status === 'Sent' && !this.sentAt) {
      this.sentAt = new Date();
    }
    
    // Set viewed timestamp
    if (this.isModified('status') && this.status === 'Viewed' && !this.viewedAt) {
      this.viewedAt = new Date();
    }
    
    // Set paid timestamp
    if (this.isModified('status') && this.status === 'Paid' && !this.paidAt) {
      this.paidAt = new Date();
    }
    
    // Validate tenant belongs to property and organization
    if (this.isNew || this.isModified('tenantId') || this.isModified('propertyId')) {
      const Tenant = require('./Tenant').default;
      const tenant = await Tenant.findById(this.tenantId);
      
      if (!tenant || tenant.organizationId.toString() !== this.organizationId.toString()) {
        throw new Error('Tenant does not belong to this organization');
      }
      
      if (tenant.propertyId.toString() !== this.propertyId.toString()) {
        throw new Error('Tenant does not belong to this property');
      }
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Static methods
InvoiceSchema.statics.findByTenant = function(tenantId: string, organizationId: string) {
  return this.find({ tenantId, organizationId })
    .populate('propertyId', 'name address')
    .sort({ issueDate: -1 });
};

InvoiceSchema.statics.findOverdue = function(organizationId: string) {
  return this.find({
    organizationId,
    dueDate: { $lt: new Date() },
    status: { $nin: ['Paid', 'Cancelled'] }
  }).populate('tenantId', 'name email').populate('propertyId', 'name');
};

InvoiceSchema.statics.findByStatus = function(status: string, organizationId: string) {
  return this.find({ status, organizationId })
    .populate('tenantId', 'name email')
    .populate('propertyId', 'name')
    .sort({ issueDate: -1 });
};

export default model<IInvoice>('Invoice', InvoiceSchema);