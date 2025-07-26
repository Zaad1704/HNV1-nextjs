import { Schema, model, Document } from 'mongoose';

export interface ITenantMovement extends Document {
  tenantId: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  movementType: 'move_in' | 'move_out' | 'transfer' | 'eviction';
  movementDate: Date;
  fromProperty?: {
    propertyId: Schema.Types.ObjectId;
    propertyName: string;
    unitId?: Schema.Types.ObjectId;
    unitNumber: string;
    unitNickname?: string;
  };
  toProperty?: {
    propertyId: Schema.Types.ObjectId;
    propertyName: string;
    unitId?: Schema.Types.ObjectId;
    unitNumber: string;
    unitNickname?: string;
  };
  rentChange?: {
    oldRent: number;
    newRent: number;
    changeAmount: number;
    changePercentage: number;
  };
  reason?: string;
  notes?: string;
  processedBy?: Schema.Types.ObjectId;
  documents?: Array<{
    type: 'move_in_checklist' | 'move_out_checklist' | 'transfer_agreement';
    url: string;
    filename: string;
    uploadedAt: Date;
  }>;
  createdAt: Date;
}

const TenantMovementSchema = new Schema<ITenantMovement>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  movementType: {
    type: String,
    enum: ['move_in', 'move_out', 'transfer', 'eviction'],
    required: true,
  },
  movementDate: {
    type: Date,
    default: Date.now,
  },
  fromProperty: {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
    propertyName: { type: String },
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit' },
    unitNumber: { type: String },
    unitNickname: { type: String },
  },
  toProperty: {
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
    propertyName: { type: String },
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit' },
    unitNumber: { type: String },
    unitNickname: { type: String },
  },
  rentChange: {
    oldRent: { type: Number },
    newRent: { type: Number },
    changeAmount: { type: Number },
    changePercentage: { type: Number },
  },
  reason: { type: String },
  notes: { type: String },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  documents: [{
    type: {
      type: String,
      enum: ['move_in_checklist', 'move_out_checklist', 'transfer_agreement'],
    },
    url: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// Indexes for efficient queries
TenantMovementSchema.index({ tenantId: 1, movementDate: -1 });
TenantMovementSchema.index({ organizationId: 1, movementDate: -1 });
TenantMovementSchema.index({ 'fromProperty.propertyId': 1 });
TenantMovementSchema.index({ 'toProperty.propertyId': 1 });

export default model<ITenantMovement>('TenantMovement', TenantMovementSchema);