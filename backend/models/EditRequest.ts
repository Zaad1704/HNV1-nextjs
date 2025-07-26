import mongoose, { Schema, Document, model, Types } from 'mongoose';

export interface IEditRequest extends Document {
  resourceId: Types.ObjectId;
  resourceModel: string;
  requester: Types.ObjectId;
  approver?: Types.ObjectId;
  organizationId: Types.ObjectId;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const EditRequestSchema: Schema<IEditRequest> = new Schema({
  resourceId: { type: Schema.Types.ObjectId, required: true },
  resourceModel: { type: String, required: true },
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approver: { type: Schema.Types.ObjectId, ref: 'User' },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

export default model<IEditRequest>('EditRequest', EditRequestSchema);