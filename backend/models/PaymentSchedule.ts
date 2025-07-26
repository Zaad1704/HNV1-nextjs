import { Schema, model, Document } from 'mongoose';

export interface IPaymentSchedule extends Document {
  organizationId: Schema.Types.ObjectId;
  tenantId: Schema.Types.ObjectId;
  propertyId: Schema.Types.ObjectId;
  unitId?: Schema.Types.ObjectId;
  scheduleType: 'recurring' | 'installment' | 'custom';
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  startDate: Date;
  endDate?: Date;
  nextDueDate: Date;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  autoProcess: boolean;
  paymentMethod: 'auto_debit' | 'manual' | 'online_portal';
  reminders: {
    enabled: boolean;
    daysBefore: number[];
    methods: ('email' | 'sms' | 'push')[];
  };
  installmentPlan?: {
    totalAmount: number;
    installments: number;
    currentInstallment: number;
    installmentAmount: number;
  };
  processedPayments: Array<{
    paymentId: Schema.Types.ObjectId;
    processedDate: Date;
    amount: number;
    status: 'success' | 'failed' | 'pending';
  }>;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentScheduleSchema = new Schema<IPaymentSchedule>({
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  unitId: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
  },
  scheduleType: {
    type: String,
    enum: ['recurring', 'installment', 'custom'],
    required: true,
  },
  frequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  nextDueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active',
  },
  autoProcess: {
    type: Boolean,
    default: false,
  },
  paymentMethod: {
    type: String,
    enum: ['auto_debit', 'manual', 'online_portal'],
    default: 'manual',
  },
  reminders: {
    enabled: { type: Boolean, default: true },
    daysBefore: [{ type: Number }],
    methods: [{ type: String, enum: ['email', 'sms', 'push'] }],
  },
  installmentPlan: {
    totalAmount: { type: Number },
    installments: { type: Number },
    currentInstallment: { type: Number, default: 1 },
    installmentAmount: { type: Number },
  },
  processedPayments: [{
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    processedDate: { type: Date },
    amount: { type: Number },
    status: { type: String, enum: ['success', 'failed', 'pending'] },
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

// Indexes for efficient queries
PaymentScheduleSchema.index({ organizationId: 1, status: 1 });
PaymentScheduleSchema.index({ nextDueDate: 1, status: 1 });
PaymentScheduleSchema.index({ tenantId: 1, status: 1 });

export default model<IPaymentSchedule>('PaymentSchedule', PaymentScheduleSchema);