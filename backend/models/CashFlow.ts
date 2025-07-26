import mongoose, { Schema, Document } from 'mongoose';

export interface ICashFlow extends Document {
  organizationId: mongoose.Types.ObjectId;
  propertyId?: mongoose.Types.ObjectId;
  fromUser: mongoose.Types.ObjectId;
  toUser?: mongoose.Types.ObjectId;
  amount: number;
  type: 'income' | 'expense' | 'transfer' | 'cash_handover' | 'bank_deposit' | 'refund';
  category: 'rent' | 'utilities' | 'maintenance' | 'management_fee' | 'other';
  status: 'pending' | 'completed' | 'cancelled';
  transactionDate: Date;
  description?: string;
  notes?: string;
  referenceNumber?: string;
  documentUrl?: string;
  recordedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  paymentMethod?: string;
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    routingNumber?: string;
  };
  metadata?: {
    source?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CashFlowSchema = new Schema<ICashFlow>({
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
  fromUser: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'From user is required'],
    index: true
  },
  toUser: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    index: true
  },
  amount: { 
    type: Number, 
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0'],
    validate: {
      validator: function(v: number) {
        return Number.isFinite(v) && v > 0;
      },
      message: 'Amount must be a valid positive number'
    }
  },
  type: { 
    type: String, 
    enum: {
      values: ['income', 'expense', 'transfer', 'cash_handover', 'bank_deposit', 'refund'],
      message: 'Invalid cash flow type'
    },
    required: [true, 'Type is required'],
    index: true
  },
  category: {
    type: String,
    enum: {
      values: ['rent', 'utilities', 'maintenance', 'management_fee', 'other'],
      message: 'Invalid category'
    },
    required: [true, 'Category is required'],
    index: true
  },
  status: { 
    type: String, 
    enum: {
      values: ['pending', 'completed', 'cancelled'],
      message: 'Status must be pending, completed, or cancelled'
    },
    default: 'pending',
    index: true
  },
  transactionDate: { 
    type: Date, 
    default: Date.now, 
    required: [true, 'Transaction date is required'],
    validate: {
      validator: function(v: Date) {
        return v <= new Date();
      },
      message: 'Transaction date cannot be in the future'
    },
    index: true
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
  referenceNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Reference number cannot exceed 50 characters'],
    index: { sparse: true }
  },
  documentUrl: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^(https?:\/\/)|(\/)/.test(v);
      },
      message: 'Document URL must be valid'
    }
  },
  recordedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Recorder is required'],
    index: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  approvedAt: { type: Date },
  paymentMethod: {
    type: String,
    trim: true,
    maxlength: [50, 'Payment method cannot exceed 50 characters']
  },
  bankDetails: {
    accountName: {
      type: String,
      trim: true,
      maxlength: [100, 'Account name cannot exceed 100 characters']
    },
    accountNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Account number cannot exceed 50 characters']
    },
    bankName: {
      type: String,
      trim: true,
      maxlength: [100, 'Bank name cannot exceed 100 characters']
    },
    routingNumber: {
      type: String,
      trim: true,
      maxlength: [20, 'Routing number cannot exceed 20 characters']
    }
  },
  metadata: {
    source: {
      type: String,
      trim: true,
      maxlength: [50, 'Source cannot exceed 50 characters']
    },
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
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
CashFlowSchema.index({ organizationId: 1, transactionDate: -1 });
CashFlowSchema.index({ propertyId: 1, transactionDate: -1 });
CashFlowSchema.index({ organizationId: 1, type: 1, status: 1 });
CashFlowSchema.index({ fromUser: 1, transactionDate: -1 });
CashFlowSchema.index({ toUser: 1, transactionDate: -1 });
CashFlowSchema.index({ createdAt: -1 });

// Text index for search
CashFlowSchema.index({ 
  description: 'text', 
  notes: 'text',
  referenceNumber: 'text'
});

// Virtual for formatted amount
CashFlowSchema.virtual('formattedAmount').get(function() {
  return `$${this.amount.toFixed(2)}`;
});

// Virtual for transaction age
CashFlowSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const transactionDate = new Date(this.transactionDate);
  return Math.ceil((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
CashFlowSchema.pre('save', async function(next) {
  try {
    // Generate reference number if not provided
    if (!this.referenceNumber && this.isNew) {
      const count = await mongoose.model('CashFlow').countDocuments({
        organizationId: this.organizationId
      });
      this.referenceNumber = `CF-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    }
    
    // Set approval timestamp
    if (this.isModified('status') && this.status === 'completed' && !this.approvedAt) {
      this.approvedAt = new Date();
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Post-save middleware
CashFlowSchema.post('save', async function(doc) {
  try {
    // Create audit log entry
    const AuditLog = require('./AuditLog').default;
    await AuditLog.create({
      userId: doc.recordedBy,
      organizationId: doc.organizationId,
      action: doc.isNew ? 'cashflow_created' : 'cashflow_updated',
      resource: 'cashflow',
      resourceId: doc._id,
      details: {
        amount: doc.amount,
        type: doc.type,
        category: doc.category,
        status: doc.status,
        fromUser: doc.fromUser,
        toUser: doc.toUser
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Audit log error (non-critical):', error);
  }
});

// Static methods
CashFlowSchema.statics.findByProperty = function(propertyId: string, organizationId: string) {
  return this.find({ propertyId, organizationId })
    .populate('fromUser', 'name')
    .populate('toUser', 'name')
    .sort({ transactionDate: -1 });
};

CashFlowSchema.statics.getFlowSummary = function(organizationId: string, startDate?: Date, endDate?: Date) {
  const matchStage: any = { organizationId };
  
  if (startDate || endDate) {
    matchStage.transactionDate = {};
    if (startDate) matchStage.transactionDate.$gte = startDate;
    if (endDate) matchStage.transactionDate.$lte = endDate;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);
};

export default mongoose.model<ICashFlow>('CashFlow', CashFlowSchema);