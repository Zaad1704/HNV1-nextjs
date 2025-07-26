import mongoose, { Schema, Document, model } from 'mongoose';

export interface ILease extends Document {
  propertyId: mongoose.Schema.Types.ObjectId;
  tenantId: mongoose.Schema.Types.ObjectId;
  unitId?: mongoose.Schema.Types.ObjectId;
  organizationId: mongoose.Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  rentAmount: number;
  securityDeposit?: number;
  status: 'active' | 'expired' | 'terminated' | 'pending_renewal' | 'renewed';
  leaseType: 'fixed' | 'month_to_month' | 'yearly';
  autoRenewal: {
    enabled: boolean;
    renewalPeriod: number; // months
    rentIncrease?: {
      type: 'percentage' | 'fixed';
      value: number;
    };
    notificationDays: number; // days before expiry
  };
  renewalHistory: Array<{
    renewedAt: Date;
    previousEndDate: Date;
    newEndDate: Date;
    oldRent: number;
    newRent: number;
    renewalType: 'auto' | 'manual';
  }>;
  documents: Array<{
    type: 'lease_agreement' | 'renewal' | 'termination' | 'amendment';
    url: string;
    filename: string;
    generatedAt: Date;
    templateUsed?: string;
  }>;
  terms: {
    lateFeeDays?: number;
    lateFeeAmount?: number;
    petPolicy?: string;
    maintenanceResponsibility?: string;
    utilitiesIncluded?: string[];
    parkingSpaces?: number;
    specialClauses?: string[];
  };
  notifications: Array<{
    type: 'renewal_reminder' | 'expiry_warning' | 'auto_renewed';
    sentAt: Date;
    daysBeforeExpiry: number;
  }>;
}

const LeaseSchema: Schema<ILease> = new Schema({
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true },
  unitId: { type: Schema.Types.ObjectId, ref: 'Unit' },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  rentAmount: { type: Number, required: true },
  securityDeposit: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['active', 'expired', 'terminated', 'pending_renewal', 'renewed'], 
    default: 'active' 
  },
  leaseType: {
    type: String,
    enum: ['fixed', 'month_to_month', 'yearly'],
    default: 'yearly'
  },
  autoRenewal: {
    enabled: { type: Boolean, default: false },
    renewalPeriod: { type: Number, default: 12 },
    rentIncrease: {
      type: { type: String, enum: ['percentage', 'fixed'] },
      value: { type: Number, default: 0 }
    },
    notificationDays: { type: Number, default: 30 }
  },
  renewalHistory: [{
    renewedAt: { type: Date },
    previousEndDate: { type: Date },
    newEndDate: { type: Date },
    oldRent: { type: Number },
    newRent: { type: Number },
    renewalType: { type: String, enum: ['auto', 'manual'] }
  }],
  documents: [{
    type: { 
      type: String, 
      enum: ['lease_agreement', 'renewal', 'termination', 'amendment'] 
    },
    url: { type: String },
    filename: { type: String },
    generatedAt: { type: Date, default: Date.now },
    templateUsed: { type: String }
  }],
  terms: {
    lateFeeDays: { type: Number, default: 5 },
    lateFeeAmount: { type: Number, default: 50 },
    petPolicy: { type: String },
    maintenanceResponsibility: { type: String },
    utilitiesIncluded: [{ type: String }],
    parkingSpaces: { type: Number, default: 0 },
    specialClauses: [{ type: String }]
  },
  notifications: [{
    type: { 
      type: String, 
      enum: ['renewal_reminder', 'expiry_warning', 'auto_renewed'] 
    },
    sentAt: { type: Date },
    daysBeforeExpiry: { type: Number }
  }]
}, { timestamps: true });

// Index for efficient queries
LeaseSchema.index({ organizationId: 1, status: 1 });
LeaseSchema.index({ endDate: 1, status: 1 });
LeaseSchema.index({ 'autoRenewal.enabled': 1, endDate: 1 });

export default model<ILease>('Lease', LeaseSchema);