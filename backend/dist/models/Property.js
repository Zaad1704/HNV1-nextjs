"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PropertySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Property name is required'],
        trim: true,
        maxlength: [100, 'Property name cannot exceed 100 characters'],
        index: true
    },
    address: {
        street: {
            type: String,
            required: [true, 'Street address is required'],
            trim: true,
            maxlength: [200, 'Street address cannot exceed 200 characters']
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true,
            maxlength: [50, 'City name cannot exceed 50 characters'],
            index: true
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true,
            maxlength: [50, 'State name cannot exceed 50 characters'],
            index: true
        },
        zipCode: {
            type: String,
            required: [true, 'Zip code is required'],
            trim: true,
            maxlength: [20, 'Zip code cannot exceed 20 characters']
        },
        country: {
            type: String,
            default: 'United States',
            trim: true
        },
        formattedAddress: String,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            index: '2dsphere',
            default: [-74.0060, 40.7128]
        },
    },
    numberOfUnits: {
        type: Number,
        required: [true, 'Number of units is required'],
        min: [1, 'Property must have at least 1 unit'],
        max: [10000, 'Number of units cannot exceed 10,000'],
        default: 1,
    },
    totalUnits: {
        type: Number,
        min: [1, 'Total units must be at least 1']
    },
    rentAmount: {
        type: Number,
        min: [0, 'Rent amount cannot be negative'],
        default: 0,
    },
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: [true, 'Organization ID is required'],
        index: true
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Created by user ID is required'],
        index: true
    },
    managedByAgentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['Active', 'Inactive', 'Under Renovation', 'Archived'],
            message: 'Status must be Active, Inactive, Under Renovation, or Archived'
        },
        default: 'Active',
        index: true
    },
    occupancyRate: {
        type: Number,
        min: [0, 'Occupancy rate cannot be negative'],
        max: [100, 'Occupancy rate cannot exceed 100%'],
        default: 0
    },
    cashFlow: {
        income: { type: Number, default: 0, min: [0, 'Income cannot be negative'] },
        expenses: { type: Number, default: 0, min: [0, 'Expenses cannot be negative'] },
        netIncome: { type: Number, default: 0 }
    },
    maintenanceStatus: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
        default: 'good'
    },
    imageUrl: {
        type: String,
        validate: {
            validator: function (v) {
                if (!v)
                    return true;
                return /^(https?:\/\/)|(\/)/.test(v);
            },
            message: 'Image URL must be a valid URL or path'
        }
    },
    propertyType: {
        type: String,
        enum: {
            values: ['Apartment', 'House', 'Commercial', 'Condo', 'Townhouse', 'Other'],
            message: 'Property type must be Apartment, House, Commercial, Condo, Townhouse, or Other'
        },
        required: [true, 'Property type is required'],
        default: 'Apartment',
        index: true
    },
    description: {
        type: String,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    amenities: [{
            type: String,
            trim: true,
            maxlength: [50, 'Amenity name cannot exceed 50 characters']
        }],
    yearBuilt: {
        type: Number,
        min: [1800, 'Year built cannot be before 1800'],
        max: [new Date().getFullYear() + 5, 'Year built cannot be more than 5 years in the future']
    },
    squareFootage: {
        type: Number,
        min: [1, 'Square footage must be at least 1']
    },
    parkingSpaces: {
        type: Number,
        min: [0, 'Parking spaces cannot be negative'],
        default: 0
    },
    petPolicy: {
        type: String,
        enum: ['Allowed', 'Not Allowed', 'Conditional'],
        default: 'Conditional'
    },
    utilities: {
        water: { type: Boolean, default: true },
        electricity: { type: Boolean, default: true },
        gas: { type: Boolean, default: false },
        internet: { type: Boolean, default: false },
        cable: { type: Boolean, default: false }
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
PropertySchema.index({ organizationId: 1, status: 1 });
PropertySchema.index({ organizationId: 1, propertyType: 1 });
PropertySchema.index({ organizationId: 1, createdAt: -1 });
PropertySchema.index({ 'address.city': 1, 'address.state': 1 });
PropertySchema.index({ name: 'text', description: 'text' });
PropertySchema.virtual('netIncome').get(function () {
    if (this.cashFlow) {
        return (this.cashFlow.income || 0) - (this.cashFlow.expenses || 0);
    }
    return 0;
});
PropertySchema.virtual('fullAddress').get(function () {
    const { street, city, state, zipCode, country } = this.address;
    return `${street}, ${city}, ${state} ${zipCode}${country && country !== 'United States' ? `, ${country}` : ''}`;
});
PropertySchema.pre('save', async function (next) {
    try {
        this.address.formattedAddress = `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
        if (!this.totalUnits) {
            this.totalUnits = this.numberOfUnits;
        }
        if (this.cashFlow) {
            this.cashFlow.netIncome = (this.cashFlow.income || 0) - (this.cashFlow.expenses || 0);
        }
        if (!this.location || !this.location.coordinates || this.location.coordinates.length !== 2) {
            this.location = {
                type: 'Point',
                coordinates: [
                    -74.0060 + (Math.random() - 0.5) * 0.1,
                    40.7128 + (Math.random() - 0.5) * 0.1
                ]
            };
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
PropertySchema.post('save', async function (doc) {
    try {
        const Unit = require('./Unit').default;
        const existingUnits = await Unit.countDocuments({ propertyId: doc._id });
        if (existingUnits === 0 && doc.numberOfUnits > 0) {
            const units = [];
            for (let i = 1; i <= doc.numberOfUnits; i++) {
                units.push({
                    propertyId: doc._id,
                    organizationId: doc.organizationId,
                    unitNumber: i.toString().padStart(3, '0'),
                    status: 'Available',
                    rentAmount: doc.rentAmount || 0,
                    historyTracking: {
                        totalTenants: 0,
                        averageStayDuration: 0,
                        rentHistory: [{
                                amount: doc.rentAmount || 0,
                                effectiveDate: new Date(),
                                tenantId: null
                            }]
                    }
                });
            }
            await Unit.insertMany(units, { ordered: false });
            console.log(`Created ${units.length} units for property ${doc.name}`);
        }
        else if (existingUnits > 0 && existingUnits !== doc.numberOfUnits) {
            if (doc.numberOfUnits > existingUnits) {
                const newUnits = [];
                for (let i = existingUnits + 1; i <= doc.numberOfUnits; i++) {
                    newUnits.push({
                        propertyId: doc._id,
                        organizationId: doc.organizationId,
                        unitNumber: i.toString().padStart(3, '0'),
                        status: 'Available',
                        rentAmount: doc.rentAmount || 0,
                        historyTracking: {
                            totalTenants: 0,
                            averageStayDuration: 0,
                            rentHistory: [{
                                    amount: doc.rentAmount || 0,
                                    effectiveDate: new Date(),
                                    tenantId: null
                                }]
                        }
                    });
                }
                await Unit.insertMany(newUnits, { ordered: false });
            }
            else if (doc.numberOfUnits < existingUnits) {
                await Unit.updateMany({
                    propertyId: doc._id,
                    unitNumber: { $gt: doc.numberOfUnits.toString().padStart(3, '0') }
                }, { status: 'Maintenance' });
            }
        }
    }
    catch (error) {
        console.error('Error managing units for property:', error);
    }
});
PropertySchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    try {
        const Unit = require('./Unit').default;
        const Tenant = require('./Tenant').default;
        const Payment = require('./Payment').default;
        const Expense = require('./Expense').default;
        const MaintenanceRequest = require('./MaintenanceRequest').default;
        const activeTenants = await Tenant.countDocuments({
            propertyId: this._id,
            status: 'Active'
        });
        if (activeTenants > 0) {
            throw new Error(`Cannot delete property with ${activeTenants} active tenant(s). Please move or deactivate tenants first.`);
        }
        const archiveOperations = [
            Unit.updateMany({ propertyId: this._id }, {
                status: 'Archived',
                $unset: { tenantId: 1 }
            }),
            Tenant.updateMany({ propertyId: this._id }, {
                status: 'Archived',
                isActive: false
            }),
            Payment.updateMany({ propertyId: this._id }, {
                status: 'Archived'
            }),
            Expense.updateMany({ propertyId: this._id }, {
                status: 'Archived'
            }),
            MaintenanceRequest.updateMany({ propertyId: this._id }, {
                status: 'Archived'
            })
        ];
        await Promise.allSettled(archiveOperations);
        console.log(`Archived all related data for property ${this.name}`);
        next();
    }
    catch (error) {
        console.error('Error in property pre-delete middleware:', error);
        next(error);
    }
});
PropertySchema.methods.restore = async function () {
    try {
        const Unit = require('./Unit').default;
        const Tenant = require('./Tenant').default;
        this.status = 'Active';
        this.isActive = true;
        await this.save();
        await Unit.updateMany({ propertyId: this._id, status: 'Archived' }, { status: 'Available' });
        console.log(`Restored property ${this.name} and its units`);
        return this;
    }
    catch (error) {
        console.error('Error restoring property:', error);
        throw error;
    }
};
exports.default = (0, mongoose_1.model)('Property', PropertySchema);
