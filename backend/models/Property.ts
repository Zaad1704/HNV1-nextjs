import mongoose, { Document, Schema } from 'mongoose';

export interface IUnit {
  _id?: string;
  unitNumber: string;
  rent: number;
  deposit: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  status: 'vacant' | 'occupied' | 'maintenance' | 'reserved';
  tenant?: mongoose.Types.ObjectId;
  description?: string;
  amenities?: string[];
  images?: string[];
  lastInspection?: Date;
  nextInspection?: Date;
}

export interface IProperty extends Document {
  _id: string;
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  type: 'apartment' | 'house' | 'commercial' | 'condo' | 'townhouse' | 'other';
  units: IUnit[];
  owner: mongoose.Types.ObjectId;
  organization: mongoose.Types.ObjectId;
  manager?: mongoose.Types.ObjectId;
  images: string[];
  documents: {
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }[];
  amenities: string[];
  policies: {
    petPolicy?: string;
    smokingPolicy?: string;
    guestPolicy?: string;
    parkingPolicy?: string;
  };
  financials: {
    totalRent: number;
    totalDeposit: number;
    monthlyIncome: number;
    yearlyIncome: number;
    expenses: number;
    netIncome: number;
  };
  maintenance: {
    lastInspection?: Date;
    nextInspection?: Date;
    maintenanceRequests: number;
    averageResponseTime?: number;
  };
  analytics: {
    occupancyRate: number;
    averageRent: number;
    turnoverRate: number;
    collectionRate: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  getVacantUnits(): IUnit[];
  getOccupiedUnits(): IUnit[];
  getTotalUnits(): number;
  getOccupancyRate(): number;
}

const unitSchema = new Schema<IUnit>({
  unitNumber: {
    type: String,
    required: [true, 'Unit number is required'],
    trim: true
  },
  rent: {
    type: Number,
    required: [true, 'Rent amount is required'],
    min: [0, 'Rent cannot be negative']
  },
  deposit: {
    type: Number,
    required: [true, 'Deposit amount is required'],
    min: [0, 'Deposit cannot be negative']
  },
  bedrooms: {
    type: Number,
    min: [0, 'Bedrooms cannot be negative'],
    max: [20, 'Bedrooms cannot exceed 20']
  },
  bathrooms: {
    type: Number,
    min: [0, 'Bathrooms cannot be negative'],
    max: [20, 'Bathrooms cannot exceed 20']
  },
  squareFeet: {
    type: Number,
    min: [0, 'Square feet cannot be negative']
  },
  status: {
    type: String,
    enum: ['vacant', 'occupied', 'maintenance', 'reserved'],
    default: 'vacant'
  },
  tenant: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String
  }],
  lastInspection: Date,
  nextInspection: Date
}, {
  timestamps: true
});

const propertySchema = new Schema<IProperty>({
  name: {
    type: String,
    required: [true, 'Property name is required'],
    trim: true,
    maxlength: [100, 'Property name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
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
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  type: {
    type: String,
    enum: ['apartment', 'house', 'commercial', 'condo', 'townhouse', 'other'],
    required: [true, 'Property type is required']
  },
  units: [unitSchema],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Property owner is required']
  },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization is required']
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  images: [{
    type: String
  }],
  documents: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  amenities: [{
    type: String,
    trim: true
  }],
  policies: {
    petPolicy: {
      type: String,
      trim: true
    },
    smokingPolicy: {
      type: String,
      trim: true
    },
    guestPolicy: {
      type: String,
      trim: true
    },
    parkingPolicy: {
      type: String,
      trim: true
    }
  },
  financials: {
    totalRent: {
      type: Number,
      default: 0,
      min: [0, 'Total rent cannot be negative']
    },
    totalDeposit: {
      type: Number,
      default: 0,
      min: [0, 'Total deposit cannot be negative']
    },
    monthlyIncome: {
      type: Number,
      default: 0
    },
    yearlyIncome: {
      type: Number,
      default: 0
    },
    expenses: {
      type: Number,
      default: 0
    },
    netIncome: {
      type: Number,
      default: 0
    }
  },
  maintenance: {
    lastInspection: Date,
    nextInspection: Date,
    maintenanceRequests: {
      type: Number,
      default: 0
    },
    averageResponseTime: Number
  },
  analytics: {
    occupancyRate: {
      type: Number,
      default: 0,
      min: [0, 'Occupancy rate cannot be negative'],
      max: [100, 'Occupancy rate cannot exceed 100']
    },
    averageRent: {
      type: Number,
      default: 0
    },
    turnoverRate: {
      type: Number,
      default: 0
    },
    collectionRate: {
      type: Number,
      default: 100
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
propertySchema.index({ organization: 1 });
propertySchema.index({ owner: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ 'address.city': 1, 'address.state': 1 });
propertySchema.index({ isActive: 1 });
propertySchema.index({ name: 'text', description: 'text' });

// Virtual for full address
propertySchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

// Instance methods
propertySchema.methods.getVacantUnits = function(): IUnit[] {
  return this.units.filter((unit: IUnit) => unit.status === 'vacant');
};

propertySchema.methods.getOccupiedUnits = function(): IUnit[] {
  return this.units.filter((unit: IUnit) => unit.status === 'occupied');
};

propertySchema.methods.getTotalUnits = function(): number {
  return this.units.length;
};

propertySchema.methods.getOccupancyRate = function(): number {
  const totalUnits = this.getTotalUnits();
  if (totalUnits === 0) return 0;
  const occupiedUnits = this.getOccupiedUnits().length;
  return Math.round((occupiedUnits / totalUnits) * 100);
};

// Pre-save middleware to calculate financials and analytics
propertySchema.pre('save', function(next) {
  // Calculate total rent and deposit
  this.financials.totalRent = this.units.reduce((total, unit) => total + unit.rent, 0);
  this.financials.totalDeposit = this.units.reduce((total, unit) => total + unit.deposit, 0);
  
  // Calculate occupancy rate
  this.analytics.occupancyRate = this.getOccupancyRate();
  
  // Calculate average rent
  if (this.units.length > 0) {
    this.analytics.averageRent = this.financials.totalRent / this.units.length;
  }
  
  next();
});

export default mongoose.model<IProperty>('Property', propertySchema);