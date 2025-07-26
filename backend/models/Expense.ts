import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  description: string;
  amount: number;
  category: 'Repairs' | 'Utilities' | 'Management Fees' | 'Insurance' | 'Taxes' | 'Salary' | 'Other';
  date: Date;
  propertyId?: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  documentUrl?: string;
  paidToAgentId?: mongoose.Types.ObjectId;
  status: 'Active' | 'Archived';
  vendor?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  receiptNumber?: string;
  paymentMethod?: string;
  notes?: string;
  isRecurring?: boolean;
  recurringDetails?: {
    frequency: 'Monthly' | 'Quarterly' | 'Yearly';
    nextDate?: Date;
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
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
  category: { 
    type: String,
    enum: {
      values: ['Repairs', 'Utilities', 'Management Fees', 'Insurance', 'Taxes', 'Salary', 'Other'],
      message: 'Invalid expense category'
    },
    required: [true, 'Category is required'],
    index: true
  },
  date: { 
    type: Date, 
    default: Date.now, 
    required: [true, 'Date is required'],
    validate: {
      validator: function(v: Date) {
        return v <= new Date();
      },
      message: 'Expense date cannot be in the future'
    },
    index: true
  },
  propertyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Property',
    index: true
  },
  organizationId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: [true, 'Organization is required'],
    index: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['Active', 'Archived'],
      message: 'Status must be Active or Archived'
    },
    default: 'Active',
    index: true
  },
  vendor: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Vendor name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^[\+]?[1-9][\d]{1,14}$/.test(v.replace(/[\s\-\(\)]/g, ''));
        },
        message: 'Please enter a valid phone number'
      }
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v: string) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    }
  },
  receiptNumber: {
    type: String,
    trim: true,
    maxlength: [50, 'Receipt number cannot exceed 50 characters'],
    index: { sparse: true }
  },
  paymentMethod: {
    type: String,
    trim: true,
    maxlength: [50, 'Payment method cannot exceed 50 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  documentUrl: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^(https?:\/\/)|(\/)/.test(v);
      },
      message: 'Document URL must be a valid URL or path'
    }
  },
  paidToAgentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    index: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: {
        values: ['Monthly', 'Quarterly', 'Yearly'],
        message: 'Recurring frequency must be Monthly, Quarterly, or Yearly'
      }
    },
    nextDate: {
      type: Date,
      validate: {
        validator: function(v: Date) {
          return !v || v > new Date();
        },
        message: 'Next recurring date must be in the future'
      }
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(this: IExpense, v: Date) {
          return !v || !this.recurringDetails?.nextDate || v > this.recurringDetails.nextDate;
        },
        message: 'Recurring end date must be after next date'
      }
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
ExpenseSchema.index({ organizationId: 1, date: -1 });
ExpenseSchema.index({ propertyId: 1, date: -1 });
ExpenseSchema.index({ organizationId: 1, category: 1 });
ExpenseSchema.index({ organizationId: 1, status: 1, date: -1 });
ExpenseSchema.index({ createdBy: 1, date: -1 });
ExpenseSchema.index({ amount: -1, organizationId: 1 });
ExpenseSchema.index({ createdAt: -1 });

// Text index for search functionality
ExpenseSchema.index({ 
  description: 'text', 
  notes: 'text',
  'vendor.name': 'text'
});

// Virtual for formatted amount
ExpenseSchema.virtual('formattedAmount').get(function() {
  return `$${this.amount.toLocaleString()}`;
});

// Virtual for expense age in days
ExpenseSchema.virtual('expenseAge').get(function() {
  const now = new Date();
  const expenseDate = new Date(this.date);
  const diffTime = Math.abs(now.getTime() - expenseDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
ExpenseSchema.pre('save', async function(next) {
  try {
    // Validate property belongs to organization
    if (this.propertyId && (this.isNew || this.isModified('propertyId'))) {
      const Property = require('./Property').default;
      const property = await Property.findById(this.propertyId);
      
      if (!property) {
        throw new Error('Property not found');
      }
      
      if (property.organizationId.toString() !== this.organizationId.toString()) {
        throw new Error('Property does not belong to this organization');
      }
    }
    
    // Generate receipt number if not provided
    if (!this.receiptNumber && this.isNew) {
      const count = await mongoose.model('Expense').countDocuments({
        organizationId: this.organizationId
      });
      this.receiptNumber = `EXP-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    }
    
    next();
  } catch (error) {
    console.error('Expense pre-save error:', error);
    next(error as Error);
  }
});

// Post-save middleware
ExpenseSchema.post('save', async function(doc) {
  try {
    // Update property cash flow statistics
    if (doc.propertyId) {
      const Property = require('./Property').default;
      const totalExpenses = await mongoose.model('Expense').aggregate([
        {
          $match: {
            propertyId: doc.propertyId,
            status: 'Active'
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]);
      
      const stats = totalExpenses[0] || { totalAmount: 0, count: 0 };
      await Property.findByIdAndUpdate(doc.propertyId, {
        'cashFlow.totalExpenses': stats.totalAmount,
        'cashFlow.expenseCount': stats.count
      });
    }
    
    // Create audit log entry
    try {
      const AuditLog = require('./AuditLog').default;
      await AuditLog.create({
        userId: doc.createdBy,
        organizationId: doc.organizationId,
        action: doc.isNew ? 'expense_created' : 'expense_updated',
        resource: 'expense',
        resourceId: doc._id,
        details: {
          amount: doc.amount,
          category: doc.category,
          description: doc.description,
          propertyId: doc.propertyId
        },
        timestamp: new Date()
      });
    } catch (auditError) {
      console.error('Audit log error (non-critical):', auditError);
    }
  } catch (error) {
    console.error('Post-save middleware error:', error);
  }
});

// Static methods
ExpenseSchema.statics.findByProperty = function(propertyId: string, organizationId: string) {
  return this.find({ propertyId, organizationId, status: 'Active' })
    .populate('createdBy', 'name')
    .sort({ date: -1 });
};

ExpenseSchema.statics.findByCategory = function(category: string, organizationId: string) {
  return this.find({ category, organizationId, status: 'Active' })
    .populate('propertyId', 'name')
    .sort({ date: -1 });
};

ExpenseSchema.statics.getExpenseStats = function(organizationId: string, startDate?: Date, endDate?: Date) {
  const matchStage: any = { organizationId, status: 'Active' };
  
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = startDate;
    if (endDate) matchStage.date.$lte = endDate;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
};

export default mongoose.model<IExpense>('Expense', ExpenseSchema);