import { Schema, model, Document } from 'mongoose';

export interface IBulkPaymentBatch extends Document {
  organizationId: Schema.Types.ObjectId;
  batchName: string;
  batchType: 'rent_collection' | 'late_fees' | 'deposits' | 'custom';
  status: 'draft' | 'processing' | 'completed' | 'failed' | 'partial';
  totalAmount: number;
  totalPayments: number;
  processedPayments: number;
  successfulPayments: number;
  failedPayments: number;
  processingStarted?: Date;
  processingCompleted?: Date;
  filters: {
    propertyIds?: Schema.Types.ObjectId[];
    tenantIds?: Schema.Types.ObjectId[];
    paymentStatus?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  paymentDetails: {
    amount?: number;
    description: string;
    paymentMethod: string;
    dueDate: Date;
    autoProcess: boolean;
  };
  payments: Array<{
    tenantId: Schema.Types.ObjectId;
    propertyId: Schema.Types.ObjectId;
    unitId?: Schema.Types.ObjectId;
    amount: number;
    status: 'pending' | 'processing' | 'success' | 'failed';
    paymentId?: Schema.Types.ObjectId;
    errorMessage?: string;
    processedAt?: Date;
  }>;
  summary: {
    totalTenants: number;
    totalProperties: number;
    avgPaymentAmount: number;
    successRate: number;
  };
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BulkPaymentBatchSchema = new Schema<IBulkPaymentBatch>({
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  batchName: {
    type: String,
    required: true,
  },
  batchType: {
    type: String,
    enum: ['rent_collection', 'late_fees', 'deposits', 'custom'],
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'processing', 'completed', 'failed', 'partial'],
    default: 'draft',
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  totalPayments: {
    type: Number,
    default: 0,
  },
  processedPayments: {
    type: Number,
    default: 0,
  },
  successfulPayments: {
    type: Number,
    default: 0,
  },
  failedPayments: {
    type: Number,
    default: 0,
  },
  processingStarted: {
    type: Date,
  },
  processingCompleted: {
    type: Date,
  },
  filters: {
    propertyIds: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
    tenantIds: [{ type: Schema.Types.ObjectId, ref: 'Tenant' }],
    paymentStatus: [{ type: String }],
    dateRange: {
      start: { type: Date },
      end: { type: Date },
    },
  },
  paymentDetails: {
    amount: { type: Number },
    description: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    dueDate: { type: Date, required: true },
    autoProcess: { type: Boolean, default: false },
  },
  payments: [{
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit' },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'success', 'failed'],
      default: 'pending',
    },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    errorMessage: { type: String },
    processedAt: { type: Date },
  }],
  summary: {
    totalTenants: { type: Number, default: 0 },
    totalProperties: { type: Number, default: 0 },
    avgPaymentAmount: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

// Indexes for efficient queries
BulkPaymentBatchSchema.index({ organizationId: 1, status: 1 });
BulkPaymentBatchSchema.index({ organizationId: 1, createdAt: -1 });
BulkPaymentBatchSchema.index({ 'payments.status': 1 });

export default model<IBulkPaymentBatch>('BulkPaymentBatch', BulkPaymentBatchSchema);