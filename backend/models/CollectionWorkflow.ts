import mongoose, { Schema, Document, model } from 'mongoose';

export interface ICollectionWorkflow extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  isActive: boolean;
  triggers: {
    daysLate: number[];
    conditions: {
      minAmount?: number;
      excludeStatuses?: string[];
      propertyTypes?: string[];
    };
  };
  actions: Array<{
    day: number;
    type: 'email' | 'sms' | 'call' | 'notice' | 'legal';
    template: string;
    automatic: boolean;
    assignTo?: 'property_manager' | 'collections_specialist' | 'owner';
    delay?: number;
  }>;
  escalation: {
    enabled: boolean;
    afterDays: number;
    action: 'legal_notice' | 'eviction' | 'collections_agency';
    assignTo?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
const CollectionWorkflowSchema: Schema<ICollectionWorkflow> = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  triggers: {
    daysLate: [{ type: Number, required: true }],
    conditions: {
      minAmount: Number,
      excludeStatuses: [String],
      propertyTypes: [String]
    }
  },
  actions: [{
    day: { type: Number, required: true },
    type: {
      type: String,
      enum: ['email', 'sms', 'call', 'notice', 'legal'],
      required: true
    },
    template: { type: String, required: true },
    automatic: { type: Boolean, default: false },
    assignTo: {
      type: String,
      enum: ['property_manager', 'collections_specialist', 'owner']
    },
    delay: { type: Number, default: 0 }
  }],
  escalation: {
    enabled: { type: Boolean, default: false },
    afterDays: { type: Number, default: 30 },
    action: {
      type: String,
      enum: ['legal_notice', 'eviction', 'collections_agency']
    },
    assignTo: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
export default model<ICollectionWorkflow>('CollectionWorkflow', CollectionWorkflowSchema);