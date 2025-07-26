import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  permissions: string[];
  organizationId: mongoose.Types.ObjectId;
  isActive: boolean;
}

const RoleSchema: Schema<IRole> = new Schema({
  name: { type: String, required: true },
  permissions: [{ type: String, required: true }],
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IRole>('Role', RoleSchema);