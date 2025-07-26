"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const MaintenanceRequestSchema = new mongoose_1.Schema({
    propertyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'Property is required'],
        index: true
    },
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: [true, 'Organization is required'],
        index: true
    },
    requestedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Requester is required'],
        index: true
    },
    tenantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Tenant',
        index: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    priority: {
        type: String,
        enum: {
            values: ['Low', 'Medium', 'High', 'Urgent', 'Emergency'],
            message: 'Priority must be Low, Medium, High, Urgent, or Emergency'
        },
        default: 'Medium',
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['Open', 'Assigned', 'In Progress', 'On Hold', 'Completed', 'Cancelled', 'Rejected'],
            message: 'Invalid status value'
        },
        default: 'Open',
        index: true
    },
    category: {
        type: String,
        enum: {
            values: ['Plumbing', 'Electrical', 'HVAC', 'Appliance', 'Structural', 'Cleaning', 'Landscaping', 'Security', 'Other'],
            message: 'Invalid category'
        },
        required: [true, 'Category is required'],
        index: true
    },
    location: {
        type: String,
        trim: true,
        maxlength: [200, 'Location cannot exceed 200 characters']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    estimatedCost: {
        type: Number,
        min: [0, 'Estimated cost cannot be negative']
    },
    actualCost: {
        type: Number,
        min: [0, 'Actual cost cannot be negative']
    },
    estimatedDuration: {
        type: Number,
        min: [0, 'Estimated duration cannot be negative']
    },
    actualDuration: {
        type: Number,
        min: [0, 'Actual duration cannot be negative']
    },
    scheduledDate: {
        type: Date,
        validate: {
            validator: function (v) {
                return !v || v >= new Date();
            },
            message: 'Scheduled date cannot be in the past'
        }
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    dueDate: {
        type: Date,
        validate: {
            validator: function (v) {
                return !v || v >= new Date();
            },
            message: 'Due date cannot be in the past'
        }
    },
    images: [{
            type: String,
            validate: {
                validator: function (v) {
                    return /^(https?:\/\/)|(\/)/.test(v);
                },
                message: 'Image must be a valid URL or path'
            }
        }],
    attachments: [{
            url: {
                type: String,
                required: true,
                validate: {
                    validator: function (v) {
                        return /^(https?:\/\/)|(\/)/.test(v);
                    },
                    message: 'Attachment URL must be valid'
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
                maxlength: [500, 'Description cannot exceed 500 characters']
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
    workLog: [{
            userId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            action: {
                type: String,
                required: true,
                trim: true,
                maxlength: [100, 'Action cannot exceed 100 characters']
            },
            description: {
                type: String,
                required: true,
                trim: true,
                maxlength: [1000, 'Description cannot exceed 1000 characters']
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            images: [{
                    type: String,
                    validate: {
                        validator: function (v) {
                            return /^(https?:\/\/)|(\/)/.test(v);
                        },
                        message: 'Work log image must be a valid URL or path'
                    }
                }]
        }],
    materials: [{
            name: {
                type: String,
                required: true,
                trim: true,
                maxlength: [200, 'Material name cannot exceed 200 characters']
            },
            quantity: {
                type: Number,
                required: true,
                min: [0, 'Quantity cannot be negative']
            },
            cost: {
                type: Number,
                required: true,
                min: [0, 'Cost cannot be negative']
            },
            supplier: {
                type: String,
                trim: true,
                maxlength: [200, 'Supplier name cannot exceed 200 characters']
            }
        }],
    vendorInfo: {
        name: {
            type: String,
            trim: true,
            maxlength: [200, 'Vendor name cannot exceed 200 characters']
        },
        contact: {
            type: String,
            trim: true,
            maxlength: [50, 'Contact cannot exceed 50 characters']
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            validate: {
                validator: function (v) {
                    return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: 'Please enter a valid email address'
            }
        },
        cost: {
            type: Number,
            min: [0, 'Vendor cost cannot be negative']
        }
    },
    urgencyLevel: {
        type: Number,
        min: [1, 'Urgency level must be between 1 and 10'],
        max: [10, 'Urgency level must be between 1 and 10']
    },
    satisfactionRating: {
        type: Number,
        min: [1, 'Rating must be between 1 and 5'],
        max: [5, 'Rating must be between 1 and 5']
    },
    tenantFeedback: {
        type: String,
        trim: true,
        maxlength: [1000, 'Feedback cannot exceed 1000 characters']
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringSchedule: {
        frequency: {
            type: String,
            enum: {
                values: ['Weekly', 'Monthly', 'Quarterly', 'Yearly'],
                message: 'Frequency must be Weekly, Monthly, Quarterly, or Yearly'
            }
        },
        nextDate: {
            type: Date,
            validate: {
                validator: function (v) {
                    return !v || v > new Date();
                },
                message: 'Next recurring date must be in the future'
            }
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
MaintenanceRequestSchema.index({ organizationId: 1, status: 1, priority: -1 });
MaintenanceRequestSchema.index({ propertyId: 1, createdAt: -1 });
MaintenanceRequestSchema.index({ assignedTo: 1, status: 1 });
MaintenanceRequestSchema.index({ tenantId: 1, status: 1 });
MaintenanceRequestSchema.index({ organizationId: 1, category: 1 });
MaintenanceRequestSchema.index({ createdAt: -1 });
MaintenanceRequestSchema.index({ dueDate: 1, status: 1 });
MaintenanceRequestSchema.index({ scheduledDate: 1 });
MaintenanceRequestSchema.index({
    title: 'text',
    description: 'text',
    location: 'text'
});
MaintenanceRequestSchema.virtual('ageInDays').get(function () {
    const now = new Date();
    const created = new Date(this.createdAt);
    return Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
});
MaintenanceRequestSchema.virtual('totalMaterialCost').get(function () {
    return this.materials?.reduce((sum, material) => sum + (material.cost * material.quantity), 0) || 0;
});
MaintenanceRequestSchema.virtual('isOverdue').get(function () {
    return this.dueDate && new Date() > this.dueDate && this.status !== 'Completed';
});
MaintenanceRequestSchema.pre('save', async function (next) {
    try {
        if (!this.urgencyLevel) {
            const urgencyMap = {
                'Low': 2,
                'Medium': 5,
                'High': 7,
                'Urgent': 9,
                'Emergency': 10
            };
            this.urgencyLevel = urgencyMap[this.priority] || 5;
        }
        if (this.isModified('status')) {
            if (this.status === 'In Progress' && !this.startedAt) {
                this.startedAt = new Date();
            }
            if (this.status === 'Completed' && !this.completedAt) {
                this.completedAt = new Date();
                if (this.startedAt) {
                    this.actualDuration = Math.ceil((this.completedAt.getTime() - this.startedAt.getTime()) / (1000 * 60 * 60));
                }
            }
        }
        if (this.isNew || this.isModified('propertyId')) {
            const Property = require('./Property').default;
            const property = await Property.findById(this.propertyId);
            if (!property || property.organizationId.toString() !== this.organizationId.toString()) {
                throw new Error('Property does not belong to this organization');
            }
        }
        if (this.tenantId && (this.isNew || this.isModified('tenantId'))) {
            const Tenant = require('./Tenant').default;
            const tenant = await Tenant.findById(this.tenantId);
            if (!tenant || tenant.propertyId.toString() !== this.propertyId.toString()) {
                throw new Error('Tenant does not belong to this property');
            }
        }
        if (!this.dueDate && this.isNew) {
            const now = new Date();
            const dueDateMap = {
                'Emergency': 1,
                'Urgent': 3,
                'High': 7,
                'Medium': 14,
                'Low': 30
            };
            const daysToAdd = dueDateMap[this.priority] || 14;
            this.dueDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
        }
        next();
    }
    catch (error) {
        console.error('Maintenance pre-save error:', error);
        next(error);
    }
});
MaintenanceRequestSchema.post('save', async function (doc) {
    try {
        try {
            const AuditLog = require('./AuditLog').default;
            await AuditLog.create({
                userId: doc.requestedBy,
                organizationId: doc.organizationId,
                action: doc.isNew ? 'maintenance_created' : 'maintenance_updated',
                resource: 'maintenance',
                resourceId: doc._id,
                details: {
                    title: doc.title,
                    status: doc.status,
                    priority: doc.priority,
                    category: doc.category,
                    propertyId: doc.propertyId,
                    tenantId: doc.tenantId
                },
                timestamp: new Date()
            });
        }
        catch (auditError) {
            console.error('Audit log error (non-critical):', auditError);
        }
    }
    catch (error) {
        console.error('Post-save middleware error:', error);
    }
});
MaintenanceRequestSchema.statics.findByProperty = function (propertyId, organizationId) {
    return this.find({ propertyId, organizationId })
        .populate('tenantId', 'name unit')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });
};
MaintenanceRequestSchema.statics.findByTenant = function (tenantId, organizationId) {
    return this.find({ tenantId, organizationId })
        .populate('propertyId', 'name address')
        .sort({ createdAt: -1 });
};
MaintenanceRequestSchema.statics.findOverdue = function (organizationId) {
    return this.find({
        organizationId,
        dueDate: { $lt: new Date() },
        status: { $nin: ['Completed', 'Cancelled'] }
    }).populate('propertyId', 'name').populate('assignedTo', 'name');
};
MaintenanceRequestSchema.statics.calculatePriorityScore = function (priority, urgencyLevel, ageInDays) {
    const priorityWeights = {
        'Emergency': 100,
        'Urgent': 80,
        'High': 60,
        'Medium': 40,
        'Low': 20
    };
    const baseScore = priorityWeights[priority] || 40;
    const urgencyScore = (urgencyLevel || 5) * 5;
    const ageScore = Math.min(ageInDays * 2, 50);
    return baseScore + urgencyScore + ageScore;
};
MaintenanceRequestSchema.statics.getAnalytics = function (organizationId, startDate, endDate) {
    const matchStage = { organizationId };
    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate)
            matchStage.createdAt.$gte = startDate;
        if (endDate)
            matchStage.createdAt.$lte = endDate;
    }
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    status: '$status',
                    priority: '$priority',
                    category: '$category'
                },
                count: { $sum: 1 },
                avgCost: { $avg: { $ifNull: ['$actualCost', '$estimatedCost'] } },
                totalCost: { $sum: { $ifNull: ['$actualCost', '$estimatedCost'] } }
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);
};
exports.default = mongoose_1.default.model('MaintenanceRequest', MaintenanceRequestSchema);
