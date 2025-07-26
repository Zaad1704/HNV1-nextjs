import mongoose, { Schema, Document } from 'mongoose';

export interface IExportRequest extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'properties' | 'tenants' | 'payments' | 'expenses';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  filters: any;
  fileUrl?: string;
  fileName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExportRequestSchema: Schema<IExportRequest> = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['properties', 'tenants', 'payments', 'expenses'], required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  filters: { type: Schema.Types.Mixed },
  fileUrl: String,
  fileName: String
}, { timestamps: true });

export default mongoose.model<IExportRequest>('ExportRequest', ExportRequestSchema);