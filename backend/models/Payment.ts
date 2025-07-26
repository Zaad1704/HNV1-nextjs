import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  _id: string;
  tenant: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  unit: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  amount: number;
  type: 'rent' | 'deposit' | 'fee' | 'maintenance' | 'late_fee' | 'other';
  method: 'cash' | 'check' | 'bank_transfer' | 'card' | 'online';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  dueDate: Date;
  paidDate?: Date;
  description?: string;
  reference?: string;
  receiptNumber?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  tenant: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant is required']
  },
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property is required']
  },
  unit: {
    type: Schema.Types.ObjectId,
    required: [true, 'Unit is required']
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  type: {
    type: String,
    enum: ['rent', 'deposit', 'fee', 'maintenance', 'late_fee', 'other'],
    required: [true, 'Payment type is required']
  },
  method: {
    type: String,
    enum: ['cash', 'check', 'bank_transfer', 'card', 'online'],
    required: [true, 'Payment method is required']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  paidDate: Date,
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  reference: {
    type: String,
    trim: true
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true
});

paymentSchema.index({ organization: 1 });
paymentSchema.index({ tenant: 1 });
paymentSchema.index({ property: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ receiptNumber: 1 }, { sparse: true });

export default mongoose.model<IPayment>('Payment', paymentSchema);