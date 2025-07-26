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
const ExpenseSchema = new mongoose_1.Schema({
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        index: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than 0'],
        validate: {
            validator: function (v) {
                return Number.isFinite(v) && v > 0;
            },
            message: 'Amount must be a valid positive number'
        }
    },
    category: {
        type: String,
        enum: {
            values: ['Repairs', 'Utilities', 'Management Fees', 'Insurance', 'Taxes', 'Salary', 'Other'],
            message: 'Invalid expense category'
        },
        required: [true, 'Category is required'],
        index: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: [true, 'Date is required'],
        validate: {
            validator: function (v) {
                return v <= new Date();
            },
            message: 'Expense date cannot be in the future'
        },
        index: true
    },
    propertyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Property',
        index: true
    },
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: [true, 'Organization is required'],
        index: true
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['Active', 'Archived'],
            message: 'Status must be Active or Archived'
        },
        default: 'Active',
        index: true
    },
    vendor: {
        name: {
            type: String,
            trim: true,
            maxlength: [100, 'Vendor name cannot exceed 100 characters']
        },
        phone: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    return !v || /^[\+]?[1-9][\d]{1,14}$/.test(v.replace(/[\s\-\(\)]/g, ''));
                },
                message: 'Please enter a valid phone number'
            }
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
        }
    },
    receiptNumber: {
        type: String,
        trim: true,
        maxlength: [50, 'Receipt number cannot exceed 50 characters'],
        index: { sparse: true }
    },
    paymentMethod: {
        type: String,
        trim: true,
        maxlength: [50, 'Payment method cannot exceed 50 characters']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    documentUrl: {
        type: String,
        validate: {
            validator: function (v) {
                return !v || /^(https?:\/\/)|(\/)/.test(v);
            },
            message: 'Document URL must be a valid URL or path'
        }
    },
    paidToAgentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringDetails: {
        frequency: {
            type: String,
            enum: {
                values: ['Monthly', 'Quarterly', 'Yearly'],
                message: 'Recurring frequency must be Monthly, Quarterly, or Yearly'
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
        },
        endDate: {
            type: Date,
            validate: {
                validator: function (v) {
                    return !v || !this.recurringDetails?.nextDate || v > this.recurringDetails.nextDate;
                },
                message: 'Recurring end date must be after next date'
            }
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
ExpenseSchema.index({ organizationId: 1, date: -1 });
ExpenseSchema.index({ propertyId: 1, date: -1 });
ExpenseSchema.index({ organizationId: 1, category: 1 });
ExpenseSchema.index({ organizationId: 1, status: 1, date: -1 });
ExpenseSchema.index({ createdBy: 1, date: -1 });
ExpenseSchema.index({ amount: -1, organizationId: 1 });
ExpenseSchema.index({ createdAt: -1 });
ExpenseSchema.index({
    description: 'text',
    notes: 'text',
    'vendor.name': 'text'
});
ExpenseSchema.virtual('formattedAmount').get(function () {
    return `$${this.amount.toLocaleString()}`;
});
ExpenseSchema.virtual('expenseAge').get(function () {
    const now = new Date();
    const expenseDate = new Date(this.date);
    const diffTime = Math.abs(now.getTime() - expenseDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});
ExpenseSchema.pre('save', async function (next) {
    try {
        if (this.propertyId && (this.isNew || this.isModified('propertyId'))) {
            const Property = require('./Property').default;
            const property = await Property.findById(this.propertyId);
            if (!property) {
                throw new Error('Property not found');
            }
            if (property.organizationId.toString() !== this.organizationId.toString()) {
                throw new Error('Property does not belong to this organization');
            }
        }
        if (!this.receiptNumber && this.isNew) {
            const count = await mongoose_1.default.model('Expense').countDocuments({
                organizationId: this.organizationId
            });
            this.receiptNumber = `EXP-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
        }
        next();
    }
    catch (error) {
        console.error('Expense pre-save error:', error);
        next(error);
    }
});
ExpenseSchema.post('save', async function (doc) {
    try {
        if (doc.propertyId) {
            const Property = require('./Property').default;
            const totalExpenses = await mongoose_1.default.model('Expense').aggregate([
                {
                    $match: {
                        propertyId: doc.propertyId,
                        status: 'Active'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                }
            ]);
            const stats = totalExpenses[0] || { totalAmount: 0, count: 0 };
            await Property.findByIdAndUpdate(doc.propertyId, {
                'cashFlow.totalExpenses': stats.totalAmount,
                'cashFlow.expenseCount': stats.count
            });
        }
        try {
            const AuditLog = require('./AuditLog').default;
            await AuditLog.create({
                userId: doc.createdBy,
                organizationId: doc.organizationId,
                action: doc.isNew ? 'expense_created' : 'expense_updated',
                resource: 'expense',
                resourceId: doc._id,
                details: {
                    amount: doc.amount,
                    category: doc.category,
                    description: doc.description,
                    propertyId: doc.propertyId
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
ExpenseSchema.statics.findByProperty = function (propertyId, organizationId) {
    return this.find({ propertyId, organizationId, status: 'Active' })
        .populate('createdBy', 'name')
        .sort({ date: -1 });
};
ExpenseSchema.statics.findByCategory = function (category, organizationId) {
    return this.find({ category, organizationId, status: 'Active' })
        .populate('propertyId', 'name')
        .sort({ date: -1 });
};
ExpenseSchema.statics.getExpenseStats = function (organizationId, startDate, endDate) {
    const matchStage = { organizationId, status: 'Active' };
    if (startDate || endDate) {
        matchStage.date = {};
        if (startDate)
            matchStage.date.$gte = startDate;
        if (endDate)
            matchStage.date.$lte = endDate;
    }
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                avgAmount: { $avg: '$amount' }
            }
        },
        { $sort: { totalAmount: -1 } }
    ]);
};
exports.default = mongoose_1.default.model('Expense', ExpenseSchema);
