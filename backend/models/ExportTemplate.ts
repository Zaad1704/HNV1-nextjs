import mongoose, { Schema, Document } from 'mongoose';

export interface IExportTemplate extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  type: 'properties' | 'tenants' | 'payments' | 'expenses';
  fields: string[];
  filters: any;
  isDefault: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExportTemplateSchema: Schema<IExportTemplate> = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['properties', 'tenants', 'payments', 'expenses'], required: true },
  fields: [{ type: String, required: true }],
  filters: { type: Schema.Types.Mixed },
  isDefault: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IExportTemplate>('ExportTemplate', ExportTemplateSchema);