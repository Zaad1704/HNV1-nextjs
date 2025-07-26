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
const CashFlowSchema = new mongoose_1.Schema({
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: [true, 'Organization is required'],
        index: true
    },
    propertyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Property',
        index: true
    },
    fromUser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'From user is required'],
        index: true
    },
    toUser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
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
    type: {
        type: String,
        enum: {
            values: ['income', 'expense', 'transfer', 'cash_handover', 'bank_deposit', 'refund'],
            message: 'Invalid cash flow type'
        },
        required: [true, 'Type is required'],
        index: true
    },
    category: {
        type: String,
        enum: {
            values: ['rent', 'utilities', 'maintenance', 'management_fee', 'other'],
            message: 'Invalid category'
        },
        required: [true, 'Category is required'],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'completed', 'cancelled'],
            message: 'Status must be pending, completed, or cancelled'
        },
        default: 'pending',
        index: true
    },
    transactionDate: {
        type: Date,
        default: Date.now,
        required: [true, 'Transaction date is required'],
        validate: {
            validator: function (v) {
                return v <= new Date();
            },
            message: 'Transaction date cannot be in the future'
        },
        index: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    referenceNumber: {
        type: String,
        trim: true,
        maxlength: [50, 'Reference number cannot exceed 50 characters'],
        index: { sparse: true }
    },
    documentUrl: {
        type: String,
        validate: {
            validator: function (v) {
                return !v || /^(https?:\/\/)|(\/)/.test(v);
            },
            message: 'Document URL must be valid'
        }
    },
    recordedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Recorder is required'],
        index: true
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    approvedAt: { type: Date },
    paymentMethod: {
        type: String,
        trim: true,
        maxlength: [50, 'Payment method cannot exceed 50 characters']
    },
    bankDetails: {
        accountName: {
            type: String,
            trim: true,
            maxlength: [100, 'Account name cannot exceed 100 characters']
        },
        accountNumber: {
            type: String,
            trim: true,
            maxlength: [50, 'Account number cannot exceed 50 characters']
        },
        bankName: {
            type: String,
            trim: true,
            maxlength: [100, 'Bank name cannot exceed 100 characters']
        },
        routingNumber: {
            type: String,
            trim: true,
            maxlength: [20, 'Routing number cannot exceed 20 characters']
        }
    },
    metadata: {
        source: {
            type: String,
            trim: true,
            maxlength: [50, 'Source cannot exceed 50 characters']
        },
        ipAddress: {
            type: String,
            validate: {
                validator: function (v) {
                    return !v || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/.test(v);
                },
                message: 'Invalid IP address format'
            }
        },
        userAgent: {
            type: String,
            trim: true,
            maxlength: [500, 'User agent cannot exceed 500 characters']
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
CashFlowSchema.index({ organizationId: 1, transactionDate: -1 });
CashFlowSchema.index({ propertyId: 1, transactionDate: -1 });
CashFlowSchema.index({ organizationId: 1, type: 1, status: 1 });
CashFlowSchema.index({ fromUser: 1, transactionDate: -1 });
CashFlowSchema.index({ toUser: 1, transactionDate: -1 });
CashFlowSchema.index({ createdAt: -1 });
CashFlowSchema.index({
    description: 'text',
    notes: 'text',
    referenceNumber: 'text'
});
CashFlowSchema.virtual('formattedAmount').get(function () {
    return `$${this.amount.toFixed(2)}`;
});
CashFlowSchema.virtual('ageInDays').get(function () {
    const now = new Date();
    const transactionDate = new Date(this.transactionDate);
    return Math.ceil((now.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
});
CashFlowSchema.pre('save', async function (next) {
    try {
        if (!this.referenceNumber && this.isNew) {
            const count = await mongoose_1.default.model('CashFlow').countDocuments({
                organizationId: this.organizationId
            });
            this.referenceNumber = `CF-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
        }
        if (this.isModified('status') && this.status === 'completed' && !this.approvedAt) {
            this.approvedAt = new Date();
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
CashFlowSchema.post('save', async function (doc) {
    try {
        const AuditLog = require('./AuditLog').default;
        await AuditLog.create({
            userId: doc.recordedBy,
            organizationId: doc.organizationId,
            action: doc.isNew ? 'cashflow_created' : 'cashflow_updated',
            resource: 'cashflow',
            resourceId: doc._id,
            details: {
                amount: doc.amount,
                type: doc.type,
                category: doc.category,
                status: doc.status,
                fromUser: doc.fromUser,
                toUser: doc.toUser
            },
            timestamp: new Date()
        });
    }
    catch (error) {
        console.error('Audit log error (non-critical):', error);
    }
});
CashFlowSchema.statics.findByProperty = function (propertyId, organizationId) {
    return this.find({ propertyId, organizationId })
        .populate('fromUser', 'name')
        .populate('toUser', 'name')
        .sort({ transactionDate: -1 });
};
CashFlowSchema.statics.getFlowSummary = function (organizationId, startDate, endDate) {
    const matchStage = { organizationId };
    if (startDate || endDate) {
        matchStage.transactionDate = {};
        if (startDate)
            matchStage.transactionDate.$gte = startDate;
        if (endDate)
            matchStage.transactionDate.$lte = endDate;
    }
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$type',
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 },
                avgAmount: { $avg: '$amount' }
            }
        }
    ]);
};
exports.default = mongoose_1.default.model('CashFlow', CashFlowSchema);
