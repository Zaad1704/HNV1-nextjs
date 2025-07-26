import mongoose, { Schema, Document } from 'mongoose';

export interface IIntegration extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  type: 'payment' | 'accounting' | 'crm' | 'email' | 'sms';
  provider: string;
  isActive: boolean;
  config: any;
  credentials: any;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSchema: Schema<IIntegration> = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['payment', 'accounting', 'crm', 'email', 'sms'], required: true },
  provider: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  config: { type: Schema.Types.Mixed },
  credentials: { type: Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.model<IIntegration>('Integration', IntegrationSchema);