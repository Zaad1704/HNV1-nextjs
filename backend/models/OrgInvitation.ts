import mongoose, { Schema, Document } from 'mongoose';

export interface IOrgInvitation extends Document {
  organizationId: mongoose.Types.ObjectId;
  email: string;
  role: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrgInvitationSchema: Schema<IOrgInvitation> = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
  invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model<IOrgInvitation>('OrgInvitation', OrgInvitationSchema);