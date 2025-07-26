import mongoose, { Schema, Document } from 'mongoose';

export interface IReceipt extends Document {
  tenantId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  paymentId: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  receiptNumber: string;
  handwrittenReceiptNumber?: string;
  title?: string;
  amount: number;
  originalAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  paymentDate: Date;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Check' | 'Credit Card' | 'Debit Card' | 'Mobile Payment' | 'Online' | 'Other';
  status: 'Generated' | 'Sent' | 'Viewed' | 'Downloaded' | 'Printed';
  category: 'Rent' | 'Utilities' | 'Maintenance' | 'Late Fee' | 'Security Deposit' | 'Other';
  rentMonth?: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  description?: string;
  notes?: string;
  transactionId?: string;
  referenceNumber?: string;
  issuedBy: mongoose.Types.ObjectId;
  sentAt?: Date;
  viewedAt?: Date;
  downloadedAt?: Date;
  printedAt?: Date;
  emailSent?: boolean;
  whatsappSent?: boolean;
  attachments?: Array<{
    url: string;
    filename: string;
    type: 'PDF' | 'Image' | 'Document';
    uploadedAt: Date;
  }>;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema = new Schema<IReceipt>({
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
  paymentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Payment', 
    required: [true, 'Payment is required'],
    index: true
  },
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice',
    index: true
  },
  receiptNumber: { 
    type: String, 
    required: [true, 'Receipt number is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Receipt number cannot exceed 50 characters'],
    index: true
  },
  handwrittenReceiptNumber: { 
    type: String,
    trim: true,
    maxlength: [50, 'Handwritten receipt number cannot exceed 50 characters']
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
  originalAmount: {
    type: Number,
    min: [0, 'Original amount cannot be negative']
  },
  discountAmount: {
    type: Number,
    min: [0, 'Discount amount cannot be negative'],
    default: 0
  },
  taxAmount: {
    type: Number,
    min: [0, 'Tax amount cannot be negative'],
    default: 0
  },
  paymentDate: { 
    type: Date, 
    required: [true, 'Payment date is required'],
    index: true
  },
  paymentMethod: { 
    type: String, 
    enum: {
      values: ['Cash', 'Bank Transfer', 'Check', 'Credit Card', 'Debit Card', 'Mobile Payment', 'Online', 'Other'],
      message: 'Invalid payment method'
    },
    required: [true, 'Payment method is required']
  },
  status: {
    type: String,
    enum: {
      values: ['Generated', 'Sent', 'Viewed', 'Downloaded', 'Printed'],
      message: 'Invalid status'
    },
    default: 'Generated',
    index: true
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
  rentMonth: { 
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
      },
      message: 'Rent month must be in YYYY-MM format'
    },
    index: true
  },
  tenantName: { 
    type: String, 
    required: [true, 'Tenant name is required'],
    trim: true,
    maxlength: [100, 'Tenant name cannot exceed 100 characters']
  },
  propertyName: { 
    type: String, 
    required: [true, 'Property name is required'],
    trim: true,
    maxlength: [200, 'Property name cannot exceed 200 characters']
  },
  unitNumber: { 
    type: String, 
    required: [true, 'Unit number is required'],
    trim: true,
    maxlength: [20, 'Unit number cannot exceed 20 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  transactionId: {
    type: String,
    trim: true,
    maxlength: [100, 'Transaction ID cannot exceed 100 characters']
  },
  referenceNumber: {
    type: String,
    trim: true,
    maxlength: [100, 'Reference number cannot exceed 100 characters']
  },
  issuedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Issuer is required'],
    index: true
  },
  sentAt: { type: Date },
  viewedAt: { type: Date },
  downloadedAt: { type: Date },
  printedAt: { type: Date },
  emailSent: {
    type: Boolean,
    default: false
  },
  whatsappSent: {
    type: Boolean,
    default: false
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
    type: {
      type: String,
      enum: {
        values: ['PDF', 'Image', 'Document'],
        message: 'Attachment type must be PDF, Image, or Document'
      },
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    ipAddress: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/.test(v);
        },
        message: 'Invalid IP address format'
      }
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, 'User agent cannot exceed 500 characters']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters']
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
ReceiptSchema.index({ organizationId: 1, paymentDate: -1 });
ReceiptSchema.index({ tenantId: 1, status: 1 });
ReceiptSchema.index({ propertyId: 1, paymentDate: -1 });
ReceiptSchema.index({ organizationId: 1, category: 1 });
ReceiptSchema.index({ receiptNumber: 1, organizationId: 1 }, { unique: true });
ReceiptSchema.index({ createdAt: -1 });

// Text index for search
ReceiptSchema.index({ 
  receiptNumber: 'text', 
  tenantName: 'text',
  propertyName: 'text',
  description: 'text'
});

// Virtual for formatted amount
ReceiptSchema.virtual('formattedAmount').get(function() {
  return `$${this.amount.toFixed(2)}`;
});

// Virtual for net amount
ReceiptSchema.virtual('netAmount').get(function() {
  return this.amount - (this.discountAmount || 0) + (this.taxAmount || 0);
});

// Virtual for receipt age
ReceiptSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  return Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
ReceiptSchema.pre('save', async function(next) {
  try {
    // Auto-generate receipt number if not provided
    if (!this.receiptNumber) {
      const count = await mongoose.model('Receipt').countDocuments({
        organizationId: this.organizationId
      });
      this.receiptNumber = `RCP-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    }
    
    // Set status timestamps
    if (this.isModified('status')) {
      const now = new Date();
      switch (this.status) {
        case 'Sent':
          if (!this.sentAt) this.sentAt = now;
          break;
        case 'Viewed':
          if (!this.viewedAt) this.viewedAt = now;
          break;
        case 'Downloaded':
          if (!this.downloadedAt) this.downloadedAt = now;
          break;
        case 'Printed':
          if (!this.printedAt) this.printedAt = now;
          break;
      }
    }
    
    // Validate payment belongs to tenant and organization
    if (this.isNew || this.isModified('paymentId')) {
      const Payment = require('./Payment').default;
      const payment = await Payment.findById(this.paymentId);
      
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      if (payment.organizationId.toString() !== this.organizationId.toString()) {
        throw new Error('Payment does not belong to this organization');
      }
      
      if (payment.tenantId.toString() !== this.tenantId.toString()) {
        throw new Error('Payment does not belong to this tenant');
      }
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Static methods
ReceiptSchema.statics.findByTenant = function(tenantId: string, organizationId: string) {
  return this.find({ tenantId, organizationId })
    .populate('paymentId', 'amount status')
    .sort({ paymentDate: -1 });
};

ReceiptSchema.statics.findByProperty = function(propertyId: string, organizationId: string) {
  return this.find({ propertyId, organizationId })
    .populate('tenantId', 'name unit')
    .sort({ paymentDate: -1 });
};

ReceiptSchema.statics.findByMonth = function(rentMonth: string, organizationId: string) {
  return this.find({ rentMonth, organizationId })
    .populate('tenantId', 'name unit')
    .populate('propertyId', 'name')
    .sort({ paymentDate: -1 });
};

export default mongoose.model<IReceipt>('Receipt', ReceiptSchema);