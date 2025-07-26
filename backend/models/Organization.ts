import mongoose, { Document, Schema } from 'mongoose';

export interface IOrganization extends Document {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  phone?: string;
  email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  settings: {
    currency: string;
    timezone: string;
    dateFormat: string;
    language: string;
    features: {
      analytics: boolean;
      notifications: boolean;
      fileUpload: boolean;
      paymentProcessing: boolean;
      maintenanceTracking: boolean;
      tenantPortal: boolean;
    };
  };
  subscription: {
    plan: string;
    status: 'active' | 'inactive' | 'trial' | 'expired';
    startDate: Date;
    endDate: Date;
    features: string[];
  };
  billing: {
    stripeCustomerId?: string;
    paymentMethod?: string;
    billingAddress?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [100, 'Organization name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  logo: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
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
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      default: 'United States'
    }
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organization owner is required']
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR']
    },
    timezone: {
      type: String,
      default: 'America/New_York'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY',
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
    },
    language: {
      type: String,
      default: 'en'
    },
    features: {
      analytics: {
        type: Boolean,
        default: true
      },
      notifications: {
        type: Boolean,
        default: true
      },
      fileUpload: {
        type: Boolean,
        default: true
      },
      paymentProcessing: {
        type: Boolean,
        default: true
      },
      maintenanceTracking: {
        type: Boolean,
        default: true
      },
      tenantPortal: {
        type: Boolean,
        default: false
      }
    }
  },
  subscription: {
    plan: {
      type: String,
      default: 'basic',
      enum: ['trial', 'basic', 'professional', 'enterprise']
    },
    status: {
      type: String,
      default: 'trial',
      enum: ['active', 'inactive', 'trial', 'expired']
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: function() {
        // Default to 30 days from now for trial
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
    },
    features: [{
      type: String
    }]
  },
  billing: {
    stripeCustomerId: String,
    paymentMethod: String,
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
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
organizationSchema.index({ owner: 1 });
organizationSchema.index({ 'subscription.status': 1 });
organizationSchema.index({ isActive: 1 });
organizationSchema.index({ name: 'text', description: 'text' });

// Virtual for full address
organizationSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Method to check if organization has feature
organizationSchema.methods.hasFeature = function(feature: string): boolean {
  return this.settings.features[feature] === true;
};

// Method to check if subscription is active
organizationSchema.methods.isSubscriptionActive = function(): boolean {
  return this.subscription.status === 'active' && this.subscription.endDate > new Date();
};

export default mongoose.model<IOrganization>('Organization', organizationSchema);