import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  userId?: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  event: string;
  category: 'page_view' | 'user_action' | 'feature_usage' | 'error' | 'performance';
  properties: any;
  sessionId: string;
  userAgent: string;
  ipAddress: string;
  timestamp: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  event: { type: String, required: true, index: true },
  category: { 
    type: String, 
    enum: ['page_view', 'user_action', 'feature_usage', 'error', 'performance'],
    required: true,
    index: true
  },
  properties: { type: Schema.Types.Mixed },
  sessionId: { type: String, required: true, index: true },
  userAgent: { type: String },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: false
});

// TTL index - auto-delete after 90 days
AnalyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

// Compound indexes for common queries
AnalyticsSchema.index({ userId: 1, timestamp: -1 });
AnalyticsSchema.index({ organizationId: 1, category: 1, timestamp: -1 });

export default mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);