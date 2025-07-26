import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment' | 'maintenance' | 'system';
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    index: true
  },
  title: { 
    type: String, 
    required: true,
    maxlength: 200
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 1000
  },
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'error', 'payment', 'maintenance', 'system'],
    default: 'info',
    index: true
  },
  isRead: { 
    type: Boolean, 
    default: false,
    index: true
  },
  readAt: { 
    type: Date 
  },
  actionUrl: { 
    type: String,
    maxlength: 500
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ organizationId: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

export default mongoose.model<INotification>('Notification', NotificationSchema);