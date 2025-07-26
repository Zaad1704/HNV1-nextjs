import mongoose, { Schema, Document } from 'mongoose';

export interface IShareableLink extends Document {
  organizationId: mongoose.Types.ObjectId;
  resourceType: 'property' | 'tenant' | 'payment' | 'report';
  resourceId: mongoose.Types.ObjectId;
  token: string;
  expiresAt?: Date;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ShareableLinkSchema: Schema<IShareableLink> = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  resourceType: { type: String, enum: ['property', 'tenant', 'payment', 'report'], required: true },
  resourceId: { type: Schema.Types.ObjectId, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: Date,
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IShareableLink>('ShareableLink', ShareableLinkSchema);