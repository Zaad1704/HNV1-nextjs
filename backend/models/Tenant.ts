import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth?: Date;
  socialSecurityNumber?: string; // Encrypted
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  employment: {
    employer?: string;
    position?: string;
    income?: number;
    startDate?: Date;
    contactInfo?: {
      phone?: string;
      email?: string;
    };
  };
  unit: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  lease: {
    startDate: Date;
    endDate: Date;
    rentAmount: number;
    depositAmount: number;
    securityDeposit: number;
    petDeposit?: number;
    leaseDocument?: string;
    renewalOptions?: {
      autoRenew: boolean;
      renewalPeriod?: number; // months
      rentIncrease?: number; // percentage
    };
  };
  status: 'active' | 'inactive' | 'pending' | 'terminated' | 'evicted';
  moveInDate?: Date;
  moveOutDate?: Date;
  documents: {
    name: string;
    type: 'lease' | 'id' | 'income' | 'reference' | 'other';
    url: string;
    uploadedAt: Date;
  }[];
  paymentHistory: {
    totalPaid: number;
    lastPaymentDate?: Date;
    lastPaymentAmount?: number;
    outstandingBalance: number;
    latePayments: number;
    paymentScore: number; // 0-100
  };
  preferences: {
    communicationMethod: 'email' | 'sms' | 'phone' | 'mail';
    language: string;
    notifications: {
      rentReminders: boolean;
      maintenanceUpdates: boolean;
      generalAnnouncements: boolean;
    };
  };
  notes: {
    content: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    isPrivate: boolean;
  }[];
  tags: string[];
  rating: {
    overall: number; // 1-5
    cleanliness: number;
    communication: number;
    paymentHistory: number;
    propertyRespect: number;
    notes?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  getFullName(): string;
  getAge(): number;
  isLeaseActive(): boolean;
  getDaysUntilLeaseExpiry(): number;
}

const tenantSchema = new Schema<ITenant>({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  alternatePhone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  dateOfBirth: Date,
  socialSecurityNumber: {
    type: String,
    select: false // Don't include in queries by default
  },
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'Emergency contact name is required'],
      trim: true
    },
    relationship: {
      type: String,
      required: [true, 'Emergency contact relationship is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Emergency contact phone is required'],
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  employment: {
    employer: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      trim: true
    },
    income: {
      type: Number,
      min: [0, 'Income cannot be negative']
    },
    startDate: Date,
    contactInfo: {
      phone: {
        type: String,
        trim: true,
        match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
      }
    }
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref: 'Property.units',
    required: [true, 'Unit is required']
  },
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
  lease: {
    startDate: {
      type: Date,
      required: [true, 'Lease start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'Lease end date is required']
    },
    rentAmount: {
      type: Number,
      required: [true, 'Rent amount is required'],
      min: [0, 'Rent amount cannot be negative']
    },
    depositAmount: {
      type: Number,
      required: [true, 'Deposit amount is required'],
      min: [0, 'Deposit amount cannot be negative']
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: [0, 'Security deposit cannot be negative']
    },
    petDeposit: {
      type: Number,
      default: 0,
      min: [0, 'Pet deposit cannot be negative']
    },
    leaseDocument: String,
    renewalOptions: {
      autoRenew: {
        type: Boolean,
        default: false
      },
      renewalPeriod: {
        type: Number,
        min: [1, 'Renewal period must be at least 1 month'],
        max: [24, 'Renewal period cannot exceed 24 months']
      },
      rentIncrease: {
        type: Number,
        min: [0, 'Rent increase cannot be negative'],
        max: [50, 'Rent increase cannot exceed 50%']
      }
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'terminated', 'evicted'],
    default: 'pending'
  },
  moveInDate: Date,
  moveOutDate: Date,
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['lease', 'id', 'income', 'reference', 'other'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  paymentHistory: {
    totalPaid: {
      type: Number,
      default: 0,
      min: [0, 'Total paid cannot be negative']
    },
    lastPaymentDate: Date,
    lastPaymentAmount: {
      type: Number,
      min: [0, 'Last payment amount cannot be negative']
    },
    outstandingBalance: {
      type: Number,
      default: 0
    },
    latePayments: {
      type: Number,
      default: 0,
      min: [0, 'Late payments cannot be negative']
    },
    paymentScore: {
      type: Number,
      default: 100,
      min: [0, 'Payment score cannot be less than 0'],
      max: [100, 'Payment score cannot exceed 100']
    }
  },
  preferences: {
    communicationMethod: {
      type: String,
      enum: ['email', 'sms', 'phone', 'mail'],
      default: 'email'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      rentReminders: {
        type: Boolean,
        default: true
      },
      maintenanceUpdates: {
        type: Boolean,
        default: true
      },
      generalAnnouncements: {
        type: Boolean,
        default: true
      }
    }
  },
  notes: [{
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Note content cannot exceed 1000 characters']
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  rating: {
    overall: {
      type: Number,
      min: [1, 'Overall rating must be at least 1'],
      max: [5, 'Overall rating cannot exceed 5']
    },
    cleanliness: {
      type: Number,
      min: [1, 'Cleanliness rating must be at least 1'],
      max: [5, 'Cleanliness rating cannot exceed 5']
    },
    communication: {
      type: Number,
      min: [1, 'Communication rating must be at least 1'],
      max: [5, 'Communication rating cannot exceed 5']
    },
    paymentHistory: {
      type: Number,
      min: [1, 'Payment history rating must be at least 1'],
      max: [5, 'Payment history rating cannot exceed 5']
    },
    propertyRespect: {
      type: Number,
      min: [1, 'Property respect rating must be at least 1'],
      max: [5, 'Property respect rating cannot exceed 5']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Rating notes cannot exceed 500 characters']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
tenantSchema.index({ organization: 1 });
tenantSchema.index({ property: 1 });
tenantSchema.index({ unit: 1 });
tenantSchema.index({ status: 1 });
tenantSchema.index({ email: 1 });
tenantSchema.index({ 'lease.endDate': 1 });
tenantSchema.index({ isActive: 1 });
tenantSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

// Instance methods
tenantSchema.methods.getFullName = function(): string {
  return `${this.firstName} ${this.lastName}`.trim();
};

tenantSchema.methods.getAge = function(): number {
  if (!this.dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

tenantSchema.methods.isLeaseActive = function(): boolean {
  const now = new Date();
  return this.lease.startDate <= now && this.lease.endDate >= now && this.status === 'active';
};

tenantSchema.methods.getDaysUntilLeaseExpiry = function(): number {
  const now = new Date();
  const leaseEnd = new Date(this.lease.endDate);
  const diffTime = leaseEnd.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Pre-save middleware to validate lease dates
tenantSchema.pre('save', function(next) {
  if (this.lease.startDate >= this.lease.endDate) {
    return next(new Error('Lease start date must be before end date'));
  }
  next();
});

export default mongoose.model<ITenant>('Tenant', tenantSchema);