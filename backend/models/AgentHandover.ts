import { Schema, model, Document } from 'mongoose';

export interface IAgentHandover extends Document {
  agentName: string;
  organizationId: Schema.Types.ObjectId;
  collectionDate: Date;
  handoverDate: Date;
  totalAmount: number;
  handoverMethod: 'cash_handover' | 'bank_deposit' | 'bank_transfer' | 'office_deposit';
  bankDetails?: string;
  referenceNumber?: string;
  notes?: string;
  propertyIds: Schema.Types.ObjectId[];
  handoverProofUrl: string;
  collectionSheetUrl?: string;
  recordedBy: Schema.Types.ObjectId;
  status: 'pending' | 'confirmed' | 'disputed';
  createdAt: Date;
  updatedAt: Date;
}

const AgentHandoverSchema = new Schema<IAgentHandover>({
  agentName: { type: String, required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  collectionDate: { type: Date, required: true },
  handoverDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true, min: 0 },
  handoverMethod: { 
    type: String, 
    enum: ['cash_handover', 'bank_deposit', 'bank_transfer', 'office_deposit'],
    required: true 
  },
  bankDetails: { type: String },
  referenceNumber: { type: String },
  notes: { type: String },
  propertyIds: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
  handoverProofUrl: { type: String, required: true },
  collectionSheetUrl: { type: String },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'disputed'], default: 'pending' }
}, { timestamps: true });

// Add indexes for better performance
AgentHandoverSchema.index({ organizationId: 1, collectionDate: -1 });
AgentHandoverSchema.index({ agentName: 1, handoverDate: -1 });

export default model<IAgentHandover>('AgentHandover', AgentHandoverSchema);