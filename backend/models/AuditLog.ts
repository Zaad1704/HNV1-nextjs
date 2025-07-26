import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  organizationId: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: Schema.Types.ObjectId;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'property' | 'tenant' | 'payment' | 'user' | 'system' | 'security';
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

const AuditLogSchema = new Schema<IAuditLog>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: Schema.Types.ObjectId },
  description: { type: String, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low' 
  },
  category: { 
    type: String, 
    enum: ['auth', 'property', 'tenant', 'payment', 'user', 'system', 'security'],
    required: true 
  },
  oldValues: { type: Schema.Types.Mixed },
  newValues: { type: Schema.Types.Mixed },
  metadata: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
  success: { type: Boolean, default: true },
  errorMessage: { type: String }
}, { timestamps: true });

// Add indexes for better performance
AuditLogSchema.index({ organizationId: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ category: 1, severity: 1 });
AuditLogSchema.index({ resource: 1, action: 1 });

export default model<IAuditLog>('AuditLog', AuditLogSchema);