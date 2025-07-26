import { Schema, model, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  propertyId?: Schema.Types.ObjectId;
  organizationId: Schema.Types.ObjectId;
  createdBy?: Schema.Types.ObjectId;
  unit: string;
  unitNickname?: string;
  status: 'Active' | 'Inactive' | 'Late' | 'Archived';
  leaseStartDate?: Date;
  leaseEndDate?: Date;
  leaseDuration?: number;
  rentAmount: number;
  securityDeposit?: number;
  advanceRent?: number;
  imageUrl?: string;
  tenantImage?: string;
  govtIdNumber?: string;
  govtIdFront?: string;
  govtIdBack?: string;
  fatherName?: string;
  motherName?: string;
  presentAddress?: string;
  permanentAddress?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  occupation?: string;
  monthlyIncome?: number;
  previousAddress?: string;
  reasonForMoving?: string;
  petDetails?: string;
  vehicleDetails?: string;
  specialInstructions?: string;
  numberOfOccupants?: number;
  reference?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    relation?: string;
    govtIdNumber?: string;
  };
  additionalAdults: Array<{
    name?: string;
    phone?: string;
    fatherName?: string;
    motherName?: string;
    permanentAddress?: string;
    govtIdNumber?: string;
    govtIdImageUrl?: string;
    imageUrl?: string;
  }>;
  discountAmount: number;
  discountExpiresAt?: Date;
  documents?: Array<{
    url: string;
    filename: string;
    description: string;
    uploadedAt: Date;
  }>;
  uploadedImages?: Array<{
    url: string;
    description: string;
    uploadedAt: Date;
  }>;
  lastRentIncrease?: {
    date: Date;
    oldAmount: number;
    newAmount: number;
    type: 'percentage' | 'fixed';
    value: number;
    reason: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>({
  name: { 
    type: String, 
    required: [true, 'Tenant name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
    index: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    },
    index: true
  },
  phone: { 
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[\+]?[1-9][\d]{1,14}$/.test(v.replace(/[\s\-\(\)]/g, ''));
      },
      message: 'Please enter a valid phone number'
    }
  },
  whatsappNumber: { 
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^[\+]?[1-9][\d]{1,14}$/.test(v.replace(/[\s\-\(\)]/g, ''));
      },
      message: 'Please enter a valid WhatsApp number'
    }
  },
  propertyId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Property',
    required: [true, 'Property is required'],
    index: true
  },
  organizationId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Organization', 
    required: [true, 'Organization is required'],
    index: true
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    index: true
  },
  unit: { 
    type: String,
    required: [true, 'Unit number is required'],
    trim: true,
    maxlength: [20, 'Unit number cannot exceed 20 characters']
  },
  unitNickname: { 
    type: String,
    trim: true,
    maxlength: [50, 'Unit nickname cannot exceed 50 characters']
  },
  status: { 
    type: String, 
    enum: {
      values: ['Active', 'Inactive', 'Late', 'Archived', 'Pending', 'Terminated'],
      message: 'Status must be Active, Inactive, Late, Archived, Pending, or Terminated'
    },
    default: 'Active',
    index: true
  },
  leaseStartDate: { 
    type: Date,
    validate: {
      validator: function(v: Date) {
        return !v || v <= new Date();
      },
      message: 'Lease start date cannot be in the future'
    }
  },
  leaseEndDate: { 
    type: Date,
    validate: {
      validator: function(this: ITenant, v: Date) {
        return !v || !this.leaseStartDate || v > this.leaseStartDate;
      },
      message: 'Lease end date must be after lease start date'
    }
  },
  leaseDuration: { 
    type: Number, 
    default: 12,
    min: [1, 'Lease duration must be at least 1 month'],
    max: [120, 'Lease duration cannot exceed 120 months']
  },
  rentAmount: { 
    type: Number, 
    required: [true, 'Rent amount is required'],
    min: [0, 'Rent amount cannot be negative'],
    index: true
  },
  securityDeposit: { 
    type: Number, 
    default: 0,
    min: [0, 'Security deposit cannot be negative']
  },
  advanceRent: { 
    type: Number, 
    default: 0,
    min: [0, 'Advance rent cannot be negative']
  },
  imageUrl: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^(https?:\/\/)|(\/)/.test(v);
      },
      message: 'Image URL must be a valid URL or path'
    }
  },
  tenantImage: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^(https?:\/\/)|(\/)/.test(v);
      },
      message: 'Tenant image must be a valid URL or path'
    }
  },
  govtIdNumber: { 
    type: String,
    trim: true,
    maxlength: [50, 'Government ID number cannot exceed 50 characters']
  },
  govtIdFront: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^(https?:\/\/)|(\/)/.test(v);
      },
      message: 'Government ID front image must be a valid URL or path'
    }
  },
  govtIdBack: { 
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^(https?:\/\/)|(\/)/.test(v);
      },
      message: 'Government ID back image must be a valid URL or path'
    }
  },
  fatherName: { 
    type: String,
    trim: true,
    maxlength: [100, 'Father name cannot exceed 100 characters']
  },
  motherName: { 
    type: String,
    trim: true,
    maxlength: [100, 'Mother name cannot exceed 100 characters']
  },
  presentAddress: { 
    type: String,
    trim: true,
    maxlength: [500, 'Present address cannot exceed 500 characters']
  },
  permanentAddress: { 
    type: String,
    trim: true,
    maxlength: [500, 'Permanent address cannot exceed 500 characters']
  },
  emergencyContact: {
    name: { 
      type: String,
      trim: true,
      maxlength: [100, 'Emergency contact name cannot exceed 100 characters']
    },
    phone: { 
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^[\+]?[1-9][\d]{1,14}$/.test(v.replace(/[\s\-\(\)]/g, ''));
        },
        message: 'Please enter a valid emergency contact phone number'
      }
    },
    relation: { 
      type: String,
      trim: true,
      maxlength: [50, 'Emergency contact relation cannot exceed 50 characters']
    }
  },
  occupation: { 
    type: String,
    trim: true,
    maxlength: [100, 'Occupation cannot exceed 100 characters']
  },
  monthlyIncome: { 
    type: Number,
    min: [0, 'Monthly income cannot be negative']
  },
  previousAddress: { 
    type: String,
    trim: true,
    maxlength: [500, 'Previous address cannot exceed 500 characters']
  },
  reasonForMoving: { 
    type: String,
    trim: true,
    maxlength: [500, 'Reason for moving cannot exceed 500 characters']
  },
  petDetails: { 
    type: String,
    trim: true,
    maxlength: [500, 'Pet details cannot exceed 500 characters']
  },
  vehicleDetails: { 
    type: String,
    trim: true,
    maxlength: [500, 'Vehicle details cannot exceed 500 characters']
  },
  specialInstructions: { 
    type: String,
    trim: true,
    maxlength: [1000, 'Special instructions cannot exceed 1000 characters']
  },
  numberOfOccupants: { 
    type: Number, 
    default: 1,
    min: [1, 'Number of occupants must be at least 1'],
    max: [20, 'Number of occupants cannot exceed 20']
  },
  reference: {
    name: { 
      type: String,
      trim: true,
      maxlength: [100, 'Reference name cannot exceed 100 characters']
    },
    phone: { 
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^[\+]?[1-9][\d]{1,14}$/.test(v.replace(/[\s\-\(\)]/g, ''));
        },
        message: 'Please enter a valid reference phone number'
      }
    },
    email: { 
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v: string) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid reference email address'
      }
    },
    address: { 
      type: String,
      trim: true,
      maxlength: [500, 'Reference address cannot exceed 500 characters']
    },
    relation: { 
      type: String,
      trim: true,
      maxlength: [50, 'Reference relation cannot exceed 50 characters']
    },
    govtIdNumber: { 
      type: String,
      trim: true,
      maxlength: [50, 'Reference government ID cannot exceed 50 characters']
    },
  },
  additionalAdults: [{
    name: { 
      type: String,
      trim: true,
      maxlength: [100, 'Additional adult name cannot exceed 100 characters']
    },
    phone: { 
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          return !v || /^[\+]?[1-9][\d]{1,14}$/.test(v.replace(/[\s\-\(\)]/g, ''));
        },
        message: 'Please enter a valid phone number for additional adult'
      }
    },
    relation: { 
      type: String,
      trim: true,
      maxlength: [50, 'Additional adult relation cannot exceed 50 characters']
    },
    fatherName: { 
      type: String,
      trim: true,
      maxlength: [100, 'Additional adult father name cannot exceed 100 characters']
    },
    motherName: { 
      type: String,
      trim: true,
      maxlength: [100, 'Additional adult mother name cannot exceed 100 characters']
    },
    permanentAddress: { 
      type: String,
      trim: true,
      maxlength: [500, 'Additional adult permanent address cannot exceed 500 characters']
    },
    govtIdNumber: { 
      type: String,
      trim: true,
      maxlength: [50, 'Additional adult government ID cannot exceed 50 characters']
    },
    govtIdImageUrl: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^(https?:\/\/)|(\/)/.test(v);
        },
        message: 'Additional adult government ID image must be a valid URL or path'
      }
    },
    imageUrl: { 
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^(https?:\/\/)|(\/)/.test(v);
        },
        message: 'Additional adult image must be a valid URL or path'
      }
    },
  }],
  discountAmount: { 
    type: Number, 
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },
  discountExpiresAt: { 
    type: Date,
    validate: {
      validator: function(v: Date) {
        return !v || v > new Date();
      },
      message: 'Discount expiry date must be in the future'
    }
  },
  documents: [{
    url: { 
      type: String,
      required: true,
      validate: {
        validator: function(v: string) {
          return /^(https?:\/\/)|(\/)/.test(v);
        },
        message: 'Document URL must be a valid URL or path'
      }
    },
    filename: { 
      type: String,
      required: true,
      trim: true,
      maxlength: [255, 'Filename cannot exceed 255 characters']
    },
    description: { 
      type: String,
      trim: true,
      maxlength: [500, 'Document description cannot exceed 500 characters']
    },
    uploadedAt: { type: Date, default: Date.now }
  }],
  uploadedImages: [{
    url: { 
      type: String,
      required: true,
      validate: {
        validator: function(v: string) {
          return /^(https?:\/\/)|(\/)/.test(v);
        },
        message: 'Image URL must be a valid URL or path'
      }
    },
    description: { 
      type: String,
      trim: true,
      maxlength: [500, 'Image description cannot exceed 500 characters']
    },
    uploadedAt: { type: Date, default: Date.now }
  }],
  lastRentIncrease: {
    date: { type: Date },
    oldAmount: { 
      type: Number,
      min: [0, 'Old rent amount cannot be negative']
    },
    newAmount: { 
      type: Number,
      min: [0, 'New rent amount cannot be negative']
    },
    type: { 
      type: String, 
      enum: {
        values: ['percentage', 'fixed'],
        message: 'Rent increase type must be percentage or fixed'
      }
    },
    value: { 
      type: Number,
      min: [0, 'Rent increase value cannot be negative']
    },
    reason: { 
      type: String,
      trim: true,
      maxlength: [500, 'Rent increase reason cannot exceed 500 characters']
    }
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for efficient queries
TenantSchema.index({ organizationId: 1, status: 1 });
TenantSchema.index({ propertyId: 1, unit: 1 }, { unique: true });
TenantSchema.index({ organizationId: 1, propertyId: 1 });
TenantSchema.index({ email: 1, organizationId: 1 }, { unique: true });
TenantSchema.index({ phone: 1, organizationId: 1 }, { sparse: true });
TenantSchema.index({ createdAt: -1 });
TenantSchema.index({ leaseEndDate: 1 }, { sparse: true });
TenantSchema.index({ name: 'text', email: 'text' });

// Virtual for lease status
TenantSchema.virtual('leaseStatus').get(function() {
  if (!this.leaseEndDate) return 'No End Date';
  
  const now = new Date();
  const endDate = new Date(this.leaseEndDate);
  const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'Expired';
  if (daysUntilExpiry <= 30) return 'Expiring Soon';
  if (daysUntilExpiry <= 90) return 'Expiring';
  return 'Active';
});

// Virtual for full name display
TenantSchema.virtual('displayName').get(function() {
  return this.name;
});

// Virtual for contact info
TenantSchema.virtual('primaryContact').get(function() {
  return this.phone || this.whatsappNumber || this.email;
});

// Virtual for effective rent (after discount)
TenantSchema.virtual('effectiveRent').get(function() {
  const baseRent = this.rentAmount || 0;
  const discount = this.discountAmount || 0;
  const now = new Date();
  
  if (this.discountExpiresAt && now > this.discountExpiresAt) {
    return baseRent;
  }
  
  return Math.max(0, baseRent - discount);
});

// Enhanced pre-save middleware
TenantSchema.pre('save', async function(next) {
  try {
    // Validate email uniqueness within organization
    if (this.isModified('email') || this.isNew) {
      const existingTenant = await (this.constructor as any).findOne({
        email: this.email,
        organizationId: this.organizationId,
        _id: { $ne: this._id },
        status: { $ne: 'Archived' }
      });
      
      if (existingTenant) {
        throw new Error(`A tenant with email ${this.email} already exists`);
      }
    }
    
    // Validate unit availability
    if (this.isModified('propertyId') || this.isModified('unit') || this.isNew) {
      const existingTenant = await (this.constructor as any).findOne({
        propertyId: this.propertyId,
        unit: this.unit,
        organizationId: this.organizationId,
        _id: { $ne: this._id },
        status: 'Active'
      });
      
      if (existingTenant) {
        throw new Error(`Unit ${this.unit} is already occupied by another tenant`);
      }
    }
    
    // Update unit status when tenant is created/updated
    if (this.isNew || this.isModified('status') || this.isModified('propertyId') || this.isModified('unit')) {
      const Unit = require('./Unit').default;
      
      if (this.propertyId && this.unit) {
        const unitStatus = this.status === 'Active' ? 'Occupied' : 'Available';
        const tenantId = this.status === 'Active' ? this._id : null;
        
        // Update current unit
        await Unit.findOneAndUpdate(
          { propertyId: this.propertyId, unitNumber: this.unit },
          { 
            status: unitStatus,
            tenantId: tenantId,
            rentAmount: this.rentAmount || 0
          },
          { upsert: false }
        );
        
        // If unit changed, free up the old unit
        if (this.isModified('unit') && !this.isNew) {
          const originalUnit = this.getChanges().$set?.unit;
          if (originalUnit && originalUnit !== this.unit) {
            await Unit.findOneAndUpdate(
              { propertyId: this.propertyId, unitNumber: originalUnit },
              { 
                status: 'Available',
                tenantId: null
              }
            );
          }
        }
      }
    }
    
    // Auto-calculate lease end date if not provided
    if (this.leaseStartDate && this.leaseDuration && !this.leaseEndDate) {
      const startDate = new Date(this.leaseStartDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + this.leaseDuration);
      this.leaseEndDate = endDate;
    }
    
    // Validate lease dates
    if (this.leaseStartDate && this.leaseEndDate) {
      if (new Date(this.leaseEndDate) <= new Date(this.leaseStartDate)) {
        throw new Error('Lease end date must be after lease start date');
      }
    }
    
    // Update discount expiry validation
    if (this.discountExpiresAt && new Date(this.discountExpiresAt) <= new Date()) {
      this.discountAmount = 0;
      this.discountExpiresAt = undefined;
    }
    
    next();
  } catch (error) {
    console.error('Tenant pre-save error:', error);
    next(error as Error);
  }
});

// Post-save middleware for property synchronization
TenantSchema.post('save', async function(doc) {
  try {
    // Update property occupancy statistics
    const Property = require('./Property').default;
    const activeTenants = await (this.constructor as any).countDocuments({
      propertyId: doc.propertyId,
      status: 'Active'
    });
    
    const property = await Property.findById(doc.propertyId);
    if (property) {
      const occupancyRate = property.numberOfUnits > 0 
        ? Math.round((activeTenants / property.numberOfUnits) * 100)
        : 0;
      
      await Property.findByIdAndUpdate(doc.propertyId, {
        occupancyRate,
        'cashFlow.activeTenants': activeTenants
      });
    }
  } catch (error) {
    console.error('Tenant post-save sync error:', error);
    // Don't throw error to prevent tenant save failure
  }
});

// Enhanced pre-remove middleware
TenantSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    // Check for active payments or leases before deletion
    const Payment = require('./Payment').default;
    const activePayments = await Payment.countDocuments({
      tenantId: this._id,
      status: { $in: ['Pending', 'Processing'] }
    });
    
    if (activePayments > 0) {
      throw new Error(`Cannot delete tenant with ${activePayments} active payment(s). Please complete or cancel payments first.`);
    }
    
    // Update unit status when tenant is deleted
    if (this.propertyId && this.unit) {
      const Unit = require('./Unit').default;
      await Unit.findOneAndUpdate(
        { propertyId: this.propertyId, unitNumber: this.unit },
        { 
          status: 'Available',
          tenantId: null,
          lastVacatedDate: new Date()
        }
      );
    }
    
    // Archive related data instead of deleting
    await Promise.allSettled([
      Payment.updateMany(
        { tenantId: this._id, status: { $ne: 'Paid' } },
        { status: 'Cancelled', cancelledAt: new Date() }
      )
    ]);
    
    next();
  } catch (error) {
    console.error('Tenant pre-delete error:', error);
    next(error as Error);
  }
});

// Add method to safely archive tenant
TenantSchema.methods.archive = async function() {
  try {
    this.status = 'Archived';
    this.archivedAt = new Date();
    await this.save();
    
    // Update unit status
    if (this.propertyId && this.unit) {
      const Unit = require('./Unit').default;
      await Unit.findOneAndUpdate(
        { propertyId: this.propertyId, unitNumber: this.unit },
        { 
          status: 'Available',
          tenantId: null,
          lastVacatedDate: new Date()
        }
      );
    }
    
    return this;
  } catch (error) {
    console.error('Error archiving tenant:', error);
    throw error;
  }
};

// Add method to restore archived tenant
TenantSchema.methods.restore = async function() {
  try {
    // Check if unit is still available
    const Unit = require('./Unit').default;
    const unit = await Unit.findOne({
      propertyId: this.propertyId,
      unitNumber: this.unit
    });
    
    if (!unit) {
      throw new Error(`Unit ${this.unit} no longer exists`);
    }
    
    if (unit.status === 'Occupied' || unit.tenantId) {
      throw new Error(`Unit ${this.unit} is currently occupied`);
    }
    
    this.status = 'Active';
    this.archivedAt = undefined;
    await this.save();
    
    return this;
  } catch (error) {
    console.error('Error restoring tenant:', error);
    throw error;
  }
};

// Static methods
TenantSchema.statics.findByProperty = function(propertyId: string, organizationId: string) {
  return this.find({ propertyId, organizationId }).populate('propertyId', 'name address');
};

TenantSchema.statics.findActive = function(organizationId: string) {
  return this.find({ organizationId, status: 'Active' }).populate('propertyId', 'name');
};

TenantSchema.statics.findExpiring = function(organizationId: string, days: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    organizationId,
    status: 'Active',
    leaseEndDate: { $lte: futureDate, $gte: new Date() }
  }).populate('propertyId', 'name');
};

TenantSchema.statics.findLate = function(organizationId: string) {
  return this.find({ organizationId, status: 'Late' }).populate('propertyId', 'name');
};

export default model<ITenant>('Tenant', TenantSchema);