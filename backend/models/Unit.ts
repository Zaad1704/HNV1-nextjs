import { Schema, model, Document } from 'mongoose';

export interface IUnit extends Document {
  propertyId: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  unitNumber: string;
  nickname?: string;
  alternativeName?: string;
  floor?: string;
  description?: string;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved' | 'Archived';
  tenantId?: Schema.Types.ObjectId;
  rentAmount?: number;
  size?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  historyTracking: {
    totalTenants: number;
    averageStayDuration: number; // in months
    lastOccupiedDate?: Date;
    lastVacatedDate?: Date;
    rentHistory: Array<{
      amount: number;
      effectiveDate: Date;
      tenantId?: Schema.Types.ObjectId;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
}

const UnitSchema = new Schema<IUnit>({
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property ID is required'],
    index: true
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization ID is required'],
    index: true
  },
  unitNumber: {
    type: String,
    required: [true, 'Unit number is required'],
    trim: true,
    maxlength: [20, 'Unit number cannot exceed 20 characters']
  },
  nickname: {
    type: String,
    trim: true,
    maxlength: [50, 'Nickname cannot exceed 50 characters']
  },
  alternativeName: {
    type: String,
    trim: true,
    maxlength: [100, 'Alternative name cannot exceed 100 characters']
  },
  floor: {
    type: String,
    trim: true,
    maxlength: [10, 'Floor cannot exceed 10 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['Available', 'Occupied', 'Maintenance', 'Reserved', 'Archived'],
      message: 'Status must be Available, Occupied, Maintenance, Reserved, or Archived'
    },
    default: 'Available',
    index: true
  },
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    index: true
  },
  rentAmount: {
    type: Number,
    min: [0, 'Rent amount cannot be negative'],
    default: 0,
  },
  size: {
    type: Number,
    min: [1, 'Size must be at least 1 square foot']
  },
  bedrooms: {
    type: Number,
    min: [0, 'Bedrooms cannot be negative'],
    max: [20, 'Bedrooms cannot exceed 20'],
    default: 1,
  },
  bathrooms: {
    type: Number,
    min: [0, 'Bathrooms cannot be negative'],
    max: [20, 'Bathrooms cannot exceed 20'],
    default: 1,
  },
  amenities: [{
    type: String,
    trim: true,
    maxlength: [50, 'Amenity name cannot exceed 50 characters']
  }],
  historyTracking: {
    totalTenants: { 
      type: Number, 
      default: 0,
      min: [0, 'Total tenants cannot be negative']
    },
    averageStayDuration: { 
      type: Number, 
      default: 0,
      min: [0, 'Average stay duration cannot be negative']
    },
    lastOccupiedDate: { type: Date },
    lastVacatedDate: { type: Date },
    rentHistory: [{
      amount: { 
        type: Number,
        required: true,
        min: [0, 'Rent amount cannot be negative']
      },
      effectiveDate: { 
        type: Date,
        required: true
      },
      tenantId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Tenant'
      },
    }],
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
UnitSchema.index({ propertyId: 1, unitNumber: 1 }, { unique: true });
UnitSchema.index({ organizationId: 1, status: 1 });
UnitSchema.index({ propertyId: 1, status: 1 });
UnitSchema.index({ tenantId: 1 }, { sparse: true });
UnitSchema.index({ propertyId: 1, tenantId: 1 }, { sparse: true });

// Virtual for display name
UnitSchema.virtual('displayName').get(function() {
  if (this.nickname) {
    return `${this.unitNumber} (${this.nickname})`;
  }
  if (this.alternativeName) {
    return `${this.unitNumber} - ${this.alternativeName}`;
  }
  return this.unitNumber;
});

// Virtual for current rent
UnitSchema.virtual('currentRent').get(function() {
  if (this.historyTracking?.rentHistory?.length > 0) {
    const sortedHistory = this.historyTracking.rentHistory.sort(
      (a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
    );
    return sortedHistory[0].amount;
  }
  return this.rentAmount || 0;
});

// Virtual for occupancy status
UnitSchema.virtual('isOccupied').get(function() {
  return this.status === 'Occupied' && !!this.tenantId;
});

// Enhanced pre-save middleware
UnitSchema.pre('save', async function(next) {
  try {
    // Initialize history tracking if not exists
    if (!this.historyTracking) {
      this.historyTracking = {
        totalTenants: 0,
        averageStayDuration: 0,
        rentHistory: []
      };
    }
    
    // Update rent history when rent amount changes
    if (this.isModified('rentAmount') && this.rentAmount > 0) {
      const lastRent = this.historyTracking.rentHistory?.[this.historyTracking.rentHistory.length - 1];
      if (!lastRent || lastRent.amount !== this.rentAmount) {
        this.historyTracking.rentHistory.push({
          amount: this.rentAmount,
          effectiveDate: new Date(),
          tenantId: this.tenantId || null
        });
        
        // Keep only last 50 rent history entries to prevent bloat
        if (this.historyTracking.rentHistory.length > 50) {
          this.historyTracking.rentHistory = this.historyTracking.rentHistory.slice(-50);
        }
      }
    }
    
    // Enhanced occupancy tracking
    if (this.isModified('tenantId')) {
      const wasOccupied = this.historyTracking.lastOccupiedDate && !this.historyTracking.lastVacatedDate;
      
      if (this.tenantId && !wasOccupied) {
        // Unit is being occupied
        this.historyTracking.lastOccupiedDate = new Date();
        this.historyTracking.totalTenants = (this.historyTracking.totalTenants || 0) + 1;
        this.status = 'Occupied';
        
        // Clear last vacated date if exists
        if (this.historyTracking.lastVacatedDate) {
          delete this.historyTracking.lastVacatedDate;
        }
      } else if (!this.tenantId && wasOccupied) {
        // Unit is being vacated
        this.historyTracking.lastVacatedDate = new Date();
        this.status = 'Available';
        
        // Calculate stay duration if we have both dates
        if (this.historyTracking.lastOccupiedDate) {
          const stayDuration = Math.floor(
            (this.historyTracking.lastVacatedDate.getTime() - this.historyTracking.lastOccupiedDate.getTime()) 
            / (1000 * 60 * 60 * 24 * 30) // Convert to months
          );
          
          // Update average stay duration
          const totalStays = this.historyTracking.totalTenants;
          const currentAvg = this.historyTracking.averageStayDuration || 0;
          this.historyTracking.averageStayDuration = 
            ((currentAvg * (totalStays - 1)) + stayDuration) / totalStays;
        }
      }
    }
    
    // Validate status consistency
    if (this.status === 'Occupied' && !this.tenantId) {
      this.status = 'Available';
    } else if (this.status === 'Available' && this.tenantId) {
      this.status = 'Occupied';
    }
    
    next();
  } catch (error) {
    console.error('Unit pre-save middleware error:', error);
    next(error as Error);
  }
});

// Post-save middleware for property synchronization
UnitSchema.post('save', async function(doc) {
  try {
    // Update property occupancy rate
    const Property = require('./Property').default;
    const totalUnits = await (this.constructor as any).countDocuments({ propertyId: doc.propertyId });
    const occupiedUnits = await (this.constructor as any).countDocuments({ 
      propertyId: doc.propertyId, 
      status: 'Occupied' 
    });
    
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    
    await Property.findByIdAndUpdate(doc.propertyId, {
      occupancyRate,
      'cashFlow.occupiedUnits': occupiedUnits,
      'cashFlow.vacantUnits': totalUnits - occupiedUnits
    });
  } catch (error) {
    console.error('Unit post-save sync error:', error);
    // Don't throw error to prevent unit save failure
  }
});

// Enhanced pre-remove middleware
UnitSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Check if unit is currently occupied
    if (this.status === 'Occupied' || this.tenantId) {
      return next(new Error('Cannot delete occupied unit. Please move or remove tenant first.'));
    }
    
    // Archive instead of delete if unit has history
    if (this.historyTracking?.totalTenants > 0) {
      this.status = 'Archived';
      (this as any).archivedAt = new Date();
      await this.save();
      return next(new Error('Unit archived instead of deleted due to existing history'));
    }
    
    // Clean up any orphaned references
    const Tenant = require('./Tenant').default;
    await Tenant.updateMany(
      { propertyId: this.propertyId, unit: this.unitNumber },
      { status: 'Inactive', unit: null }
    );
    
    next();
  } catch (error) {
    console.error('Unit pre-delete error:', error);
    next(error as Error);
  }
});

// Static methods
UnitSchema.statics.findByProperty = function(propertyId: string, organizationId: string) {
  return this.find({ propertyId, organizationId }).populate('tenantId', 'name email phone status');
};

UnitSchema.statics.findVacant = function(propertyId: string, organizationId: string) {
  return this.find({ 
    propertyId, 
    organizationId, 
    status: 'Available',
    tenantId: { $exists: false }
  });
};

UnitSchema.statics.findOccupied = function(propertyId: string, organizationId: string) {
  return this.find({ 
    propertyId, 
    organizationId, 
    status: 'Occupied',
    tenantId: { $exists: true }
  }).populate('tenantId', 'name email phone status rentAmount');
};

export default model<IUnit>('Unit', UnitSchema);