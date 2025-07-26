import { Schema, model, Document } from 'mongoose';

export interface ISubscription extends Document {
  organizationId: Schema.Types.ObjectId;
  planId: Schema.Types.ObjectId;
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'expired' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  endedAt?: Date;
  amount: number; // in cents
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  paymentMethod: string;
  stripeSubscriptionId?: string;
  twocheckoutSubscriptionId?: string;
  lastPaymentDate?: Date;
  nextBillingDate?: Date;
  failedPaymentAttempts: number;
  isLifetime: boolean;
  trialExpiresAt?: Date;
  currentPeriodEndsAt?: Date;
  currentProperties?: number;
  currentTenants?: number;
  currentAgents?: number;
  currentUsers?: number;
  features: string[];
  limits: {
    properties: number;
    tenants: number;
    users: number;
    storage: number; // in MB
    exports: number; // per month
  };
  usage: {
    properties: number;
    tenants: number;
    users: number;
    storage: number;
    exports: number;
    lastReset: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'canceled', 'past_due', 'expired', 'trialing'],
    default: 'trialing' 
  },
  currentPeriodStart: { type: Date, required: true },
  currentPeriodEnd: { type: Date, required: true },
  trialStart: { type: Date },
  trialEnd: { type: Date },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  canceledAt: { type: Date },
  endedAt: { type: Date },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
  paymentMethod: { type: String, default: 'card' },
  stripeSubscriptionId: { type: String },
  twocheckoutSubscriptionId: { type: String },
  lastPaymentDate: { type: Date },
  nextBillingDate: { type: Date },
  failedPaymentAttempts: { type: Number, default: 0 },
  isLifetime: { type: Boolean, default: false },
  trialExpiresAt: { type: Date },
  currentPeriodEndsAt: { type: Date },
  currentProperties: { type: Number, default: 0 },
  currentTenants: { type: Number, default: 0 },
  currentAgents: { type: Number, default: 0 },
  currentUsers: { type: Number, default: 0 },
  features: [{ type: String }],
  limits: {
    properties: { type: Number, default: 10 },
    tenants: { type: Number, default: 50 },
    users: { type: Number, default: 5 },
    storage: { type: Number, default: 1000 }, // 1GB
    exports: { type: Number, default: 20 }
  },
  usage: {
    properties: { type: Number, default: 0 },
    tenants: { type: Number, default: 0 },
    users: { type: Number, default: 0 },
    storage: { type: Number, default: 0 },
    exports: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  }
}, { timestamps: true });

// Add indexes for better performance
SubscriptionSchema.index({ organizationId: 1 });
SubscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });
SubscriptionSchema.index({ twocheckoutSubscriptionId: 1 });

export default model<ISubscription>('Subscription', SubscriptionSchema);