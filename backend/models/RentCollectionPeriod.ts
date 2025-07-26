import mongoose, { Schema, Document } from 'mongoose';

export interface IRentCollectionPeriod extends Document {
  organizationId: mongoose.Types.ObjectId;
  period: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
}

const RentCollectionPeriodSchema = new Schema<IRentCollectionPeriod>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  period: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IRentCollectionPeriod>('RentCollectionPeriod', RentCollectionPeriodSchema);
