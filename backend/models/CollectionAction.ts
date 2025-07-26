import mongoose, { Schema, Document, model } from 'mongoose';

export interface ICollectionAction extends Document {
  tenantId: mongoose.Types.ObjectId;
  periodId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  type: 'call' | 'email' | 'visit' | 'notice' | 'payment_received' | 'payment_plan';
  details: {
    timestamp: Date;
    method?: 'phone' | 'email' | 'in_person' | 'mail';
    outcome: 'contacted' | 'no_answer' | 'promised_payment' | 'dispute' | 'payment_plan' | 'completed';
    notes: string;
    followUpDate?: Date;
  };
  paymentInfo?: {
    amountPromised?: number;
    promisedDate?: Date;
    paymentMethod?: 'check' | 'cash' | 'online' | 'money_order';
    actualAmount?: number;
    actualDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
const CollectionActionSchema: Schema<ICollectionAction> = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  periodId: { type: Schema.Types.ObjectId, ref: 'RentCollectionPeriod', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  type: {
    type: String,
    enum: ['call', 'email', 'visit', 'notice', 'payment_received', 'payment_plan'],
    required: true
  },
  details: {
    timestamp: { type: Date, default: Date.now },
    method: {
      type: String,
      enum: ['phone', 'email', 'in_person', 'mail']
    },
    outcome: {
      type: String,
      enum: ['contacted', 'no_answer', 'promised_payment', 'dispute', 'payment_plan', 'completed'],
      required: true
    },
    notes: { type: String, required: true },
    followUpDate: Date
  },
  paymentInfo: {
    amountPromised: Number,
    promisedDate: Date,
    paymentMethod: {
      type: String,
      enum: ['check', 'cash', 'online', 'money_order']
    },
    actualAmount: Number,
    actualDate: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
export default model<ICollectionAction>('CollectionAction', CollectionActionSchema);