import { Schema, model, Document } from 'mongoose';

export interface IPlan extends Document {
  name: string;
  description: string;
  price: number; // in cents
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  duration: string;
  features: string[];
  limits: {
    properties: number;
    tenants: number;
    users: number;
    storage: number; // in MB
    exports: number; // per month
  };
  twocheckoutProductId?: string;
  stripeProductId?: string;
  stripePriceId?: string;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlanSchema = new Schema<IPlan>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
  duration: { type: String, required: true },
  features: [{ type: String }],
  limits: {
    properties: { type: Number, required: true },
    tenants: { type: Number, required: true },
    users: { type: Number, required: true },
    storage: { type: Number, required: true },
    exports: { type: Number, required: true }
  },
  twocheckoutProductId: { type: String },
  stripeProductId: { type: String },
  stripePriceId: { type: String },
  isActive: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

// Add indexes
PlanSchema.index({ isActive: 1, sortOrder: 1 });

export default model<IPlan>('Plan', PlanSchema);