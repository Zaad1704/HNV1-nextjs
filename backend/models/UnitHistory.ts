import { Schema, model, Document } from 'mongoose';

export interface IUnitHistory extends Document {
  unitId: Schema.Types.ObjectId;
  propertyId: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  eventType: 'tenant_moved_in' | 'tenant_moved_out' | 'rent_changed' | 'unit_renovated' | 'status_changed' | 'nickname_changed';
  eventDate: Date;
  previousData?: {
    tenantId?: Schema.Types.ObjectId;
    tenantName?: string;
    rentAmount?: number;
    status?: string;
    nickname?: string;
  };
  newData?: {
    tenantId?: Schema.Types.ObjectId;
    tenantName?: string;
    rentAmount?: number;
    status?: string;
    nickname?: string;
  };
  notes?: string;
  triggeredBy?: Schema.Types.ObjectId;
  createdAt: Date;
}

const UnitHistorySchema = new Schema<IUnitHistory>({
  unitId: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true,
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  eventType: {
    type: String,
    enum: ['tenant_moved_in', 'tenant_moved_out', 'rent_changed', 'unit_renovated', 'status_changed', 'nickname_changed'],
    required: true,
  },
  eventDate: {
    type: Date,
    default: Date.now,
  },
  previousData: {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    tenantName: { type: String },
    rentAmount: { type: Number },
    status: { type: String },
    nickname: { type: String },
  },
  newData: {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    tenantName: { type: String },
    rentAmount: { type: Number },
    status: { type: String },
    nickname: { type: String },
  },
  notes: { type: String },
  triggeredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Indexes for efficient queries
UnitHistorySchema.index({ unitId: 1, eventDate: -1 });
UnitHistorySchema.index({ organizationId: 1, eventDate: -1 });
UnitHistorySchema.index({ propertyId: 1, eventDate: -1 });

export default model<IUnitHistory>('UnitHistory', UnitHistorySchema);