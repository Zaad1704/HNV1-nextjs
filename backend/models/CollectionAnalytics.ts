import mongoose, { Schema, Document } from 'mongoose';

export interface ICollectionAnalytics extends Document {
  organizationId: mongoose.Types.ObjectId;
  period: string;
  totalCollected: number;
  totalPending: number;
  collectionRate: number;
  createdAt: Date;
}

const CollectionAnalyticsSchema = new Schema<ICollectionAnalytics>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  period: { type: String, required: true },
  totalCollected: { type: Number, default: 0 },
  totalPending: { type: Number, default: 0 },
  collectionRate: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICollectionAnalytics>('CollectionAnalytics', CollectionAnalyticsSchema);
