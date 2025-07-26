import { Schema, model, Document } from 'mongoose';

export interface IReminder extends Document {
  type: 'rent_due' | 'lease_expiry' | 'maintenance_due' | 'inspection_due' | 'payment_overdue' | 'custom';
  title: string;
  message: string;
  organizationId: Schema.Types.ObjectId;
  createdBy: Schema.Types.ObjectId;
  propertyId?: Schema.Types.ObjectId;
  tenantId?: Schema.Types.ObjectId;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  triggerDate: Date;
  nextRunDate: Date;
  lastRunDate?: Date;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  recipients: {
    tenants: boolean;
    landlords: boolean;
    agents: boolean;
    custom: string[];
  };
  channels: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    inApp: boolean;
  };
  conditions?: {
    daysBeforeDue?: number;
    amountThreshold?: number;
    propertyStatus?: string;
    tenantStatus?: string;
  };
  executionCount: number;
  maxExecutions?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>({
  type: { 
    type: String, 
    enum: ['rent_due', 'lease_expiry', 'maintenance_due', 'inspection_due', 'payment_overdue', 'custom'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  frequency: { 
    type: String, 
    enum: ['once', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly' 
  },
  triggerDate: { type: Date, required: true },
  nextRunDate: { type: Date, required: true },
  lastRunDate: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active' 
  },
  recipients: {
    tenants: { type: Boolean, default: true },
    landlords: { type: Boolean, default: false },
    agents: { type: Boolean, default: false },
    custom: [{ type: String }]
  },
  channels: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false },
    inApp: { type: Boolean, default: true }
  },
  conditions: {
    daysBeforeDue: { type: Number },
    amountThreshold: { type: Number },
    propertyStatus: { type: String },
    tenantStatus: { type: String }
  },
  executionCount: { type: Number, default: 0 },
  maxExecutions: { type: Number }
}, { timestamps: true });

// Add indexes for better performance
ReminderSchema.index({ organizationId: 1, status: 1 });
ReminderSchema.index({ nextRunDate: 1, status: 1 });
ReminderSchema.index({ type: 1, organizationId: 1 });

export default model<IReminder>('Reminder', ReminderSchema);