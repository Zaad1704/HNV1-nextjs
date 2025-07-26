import mongoose, { Schema, Document, model } from 'mongoose';

export interface ICollectionSheet extends Document {
  organizationId: mongoose.Types.ObjectId;
  periodId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  format: {
    type: 'printable' | 'digital';
    layout: 'compact' | 'detailed';
    groupBy: 'property' | 'dueDate' | 'amount' | 'none';
  };
  sections: {
    header: {
      showLogo: boolean;
      showPeriod: boolean;
      showSummary: boolean;
      customText?: string;
    };
    tenantList: {
      showCheckboxes: boolean;
      showContactInfo: boolean;
      showPaymentHistory: boolean;
      showNotes: boolean;
      sortBy: 'property' | 'name' | 'amount' | 'dueDate';
    };
    footer: {
      showTotals: boolean;
      showSignature: boolean;
      showDate: boolean;
    };
  };
  customization: {
    fieldsToShow: string[];
    checkboxStyle: 'square' | 'circle';
    fontSize: 'small' | 'medium' | 'large';
  };
  result?: {
    fileUrl?: string;
    fileName?: string;
    generatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSheetSchema: Schema<ICollectionSheet> = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  periodId: { type: Schema.Types.ObjectId, ref: 'RentCollectionPeriod', required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  format: {
    type: { type: String, enum: ['printable', 'digital'], default: 'printable' },
    layout: { type: String, enum: ['compact', 'detailed'], default: 'compact' },
    groupBy: { type: String, enum: ['property', 'dueDate', 'amount', 'none'], default: 'property' }
  },
  sections: {
    header: {
      showLogo: { type: Boolean, default: true },
      showPeriod: { type: Boolean, default: true },
      showSummary: { type: Boolean, default: true },
      customText: String
    },
    tenantList: {
      showCheckboxes: { type: Boolean, default: true },
      showContactInfo: { type: Boolean, default: true },
      showPaymentHistory: { type: Boolean, default: false },
      showNotes: { type: Boolean, default: true },
      sortBy: { type: String, enum: ['property', 'name', 'amount', 'dueDate'], default: 'property' }
    },
    footer: {
      showTotals: { type: Boolean, default: true },
      showSignature: { type: Boolean, default: true },
      showDate: { type: Boolean, default: true }
    }
  },
  customization: {
    fieldsToShow: {
      type: [String],
      default: ['tenant_name', 'property', 'unit', 'rent_due', 'late_fees', 'total_owed', 'due_date', 'contact_phone']
    },
    checkboxStyle: { type: String, enum: ['square', 'circle'], default: 'square' },
    fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' }
  },
  result: {
    fileUrl: String,
    fileName: String,
    generatedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default model<ICollectionSheet>('CollectionSheet', CollectionSheetSchema);