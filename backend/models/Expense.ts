import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  _id: string;
  property: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  category: 'maintenance' | 'utilities' | 'insurance' | 'taxes' | 'management' | 'other';
  amount: number;
  description: string;
  date: Date;
  vendor?: string;
  receipt?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>({
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property is required']
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization is required']
  },
  category: {
    type: String,
    enum: ['maintenance', 'utilities', 'insurance', 'taxes', 'management', 'other'],
    required: [true, 'Category is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  vendor: {
    type: String,
    trim: true
  },
  receipt: {
    type: String
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true
});

expenseSchema.index({ organization: 1 });
expenseSchema.index({ property: 1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ date: -1 });

export default mongoose.model<IExpense>('Expense', expenseSchema);