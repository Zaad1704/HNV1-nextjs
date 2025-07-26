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
const PaymentSchema = new mongoose_1.Schema({
    tenantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: [true, 'Tenant is required'],
        index: true
    },
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
    amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [0.01, 'Payment amount must be greater than 0'],
        validate: {
            validator: function (v) {
                return Number.isFinite(v) && v > 0;
            },
            message: 'Payment amount must be a valid positive number'
        }
    },
    originalAmount: {
        type: Number,
        min: [0, 'Original amount cannot be negative'],
        validate: {
            validator: function (v) {
                return !v || Number.isFinite(v);
            },
            message: 'Original amount must be a valid number'
        }
    },
    discount: {
        type: {
            type: String,
            enum: {
                values: ['percentage', 'fixed'],
                message: 'Discount type must be percentage or fixed'
            }
        },
        value: {
            type: Number,
            min: [0, 'Discount value cannot be negative'],
            validate: {
                validator: function (v) {
                    if (!v)
                        return true;
                    if (this.discount?.type === 'percentage') {
                        return v >= 0 && v <= 100;
                    }
                    return v >= 0;
                },
                message: 'Invalid discount value'
            }
        },
        amount: {
            type: Number,
            min: [0, 'Discount amount cannot be negative']
        },
        reason: {
            type: String,
            trim: true,
            maxlength: [500, 'Discount reason cannot exceed 500 characters']
        }
    },
    status: {
        type: String,
        enum: {
            values: ['Pending', 'Paid', 'Failed', 'Cancelled', 'Refunded', 'Partial'],
            message: 'Status must be Pending, Paid, Failed, Cancelled, Refunded, or Partial'
        },
        default: 'Pending',
        index: true
    },
    paymentDate: {
        type: Date,
        required: [true, 'Payment date is required'],
        validate: {
            validator: function (v) {
                return v <= new Date();
            },
            message: 'Payment date cannot be in the future'
        },
        index: true
    },
    dueDate: {
        type: Date,
        validate: {
            validator: function (v) {
                return !v || v >= this.paymentDate;
            },
            message: 'Due date must be after payment date'
        }
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    recordedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    paymentMethod: {
        type: String,
        enum: {
            values: ['Cash', 'Bank Transfer', 'Check', 'Credit Card', 'Debit Card', 'Mobile Payment', 'Online', 'Other'],
            message: 'Invalid payment method'
        },
        default: 'Cash',
        required: [true, 'Payment method is required']
    },
    description: {
        type: String,
        default: 'Monthly Rent Payment',
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    rentMonth: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                return !v || /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
            },
            message: 'Rent month must be in YYYY-MM format'
        },
        index: true
    },
    rentYear: {
        type: Number,
        min: [2020, 'Rent year must be 2020 or later'],
        max: [2050, 'Rent year cannot exceed 2050'],
        validate: {
            validator: function (v) {
                return !v || (Number.isInteger(v) && v >= 2020 && v <= 2050);
            },
            message: 'Rent year must be a valid year between 2020 and 2050'
        }
    },
    collectionMethod: {
        type: String,
        trim: true,
        maxlength: [100, 'Collection method cannot exceed 100 characters']
    },
    receivedBy: {
        type: String,
        trim: true,
        maxlength: [100, 'Received by cannot exceed 100 characters']
    },
    agentName: {
        type: String,
        trim: true,
        maxlength: [100, 'Agent name cannot exceed 100 characters']
    },
    handoverDate: {
        type: Date,
        validate: {
            validator: function (v) {
                return !v || v >= this.paymentDate;
            },
            message: 'Handover date must be after payment date'
        }
    },
    referenceNumber: {
        type: String,
        trim: true,
        maxlength: [100, 'Reference number cannot exceed 100 characters'],
        index: { sparse: true }
    },
    transactionId: {
        type: String,
        trim: true,
        maxlength: [100, 'Transaction ID cannot exceed 100 characters'],
        index: { sparse: true }
    },
    receiptNumber: {
        type: String,
        trim: true,
        maxlength: [50, 'Receipt number cannot exceed 50 characters'],
        index: { sparse: true, unique: true }
    },
    bankDetails: {
        bankName: {
            type: String,
            trim: true,
            maxlength: [100, 'Bank name cannot exceed 100 characters']
        },
        accountNumber: {
            type: String,
            trim: true,
            maxlength: [50, 'Account number cannot exceed 50 characters']
        },
        routingNumber: {
            type: String,
            trim: true,
            maxlength: [20, 'Routing number cannot exceed 20 characters']
        },
        checkNumber: {
            type: String,
            trim: true,
            maxlength: [20, 'Check number cannot exceed 20 characters']
        }
    },
    fees: {
        processingFee: {
            type: Number,
            min: [0, 'Processing fee cannot be negative'],
            default: 0
        },
        lateFee: {
            type: Number,
            min: [0, 'Late fee cannot be negative'],
            default: 0
        },
        otherFees: {
            type: Number,
            min: [0, 'Other fees cannot be negative'],
            default: 0
        },
        totalFees: {
            type: Number,
            min: [0, 'Total fees cannot be negative'],
            default: 0
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
        },
        location: {
            type: String,
            trim: true,
            maxlength: [200, 'Location cannot exceed 200 characters']
        }
    },
    attachments: [{
            url: {
                type: String,
                required: true,
                validate: {
                    validator: function (v) {
                        return /^(https?:\/\/)|(\/)/.test(v);
                    },
                    message: 'Attachment URL must be a valid URL or path'
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
                maxlength: [500, 'Attachment description cannot exceed 500 characters']
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
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
        nextPaymentDate: {
            type: Date,
            validate: {
                validator: function (v) {
                    return !v || v > new Date();
                },
                message: 'Next payment date must be in the future'
            }
        },
        endDate: {
            type: Date,
            validate: {
                validator: function (v) {
                    return !v || !this.recurringDetails?.nextPaymentDate || v > this.recurringDetails.nextPaymentDate;
                },
                message: 'Recurring end date must be after next payment date'
            }
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
PaymentSchema.index({ organizationId: 1, paymentDate: -1 });
PaymentSchema.index({ tenantId: 1, status: 1 });
PaymentSchema.index({ propertyId: 1, paymentDate: -1 });
PaymentSchema.index({ organizationId: 1, status: 1, paymentDate: -1 });
PaymentSchema.index({ organizationId: 1, rentMonth: 1 });
PaymentSchema.index({ createdBy: 1, paymentDate: -1 });
PaymentSchema.index({ paymentMethod: 1, organizationId: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ amount: -1, organizationId: 1 });
PaymentSchema.index({
    description: 'text',
    notes: 'text',
    referenceNumber: 'text',
    transactionId: 'text'
});
PaymentSchema.virtual('netAmount').get(function () {
    const totalFees = (this.fees?.totalFees || 0) +
        (this.fees?.processingFee || 0) +
        (this.fees?.lateFee || 0) +
        (this.fees?.otherFees || 0);
    return this.amount - totalFees;
});
PaymentSchema.virtual('effectiveAmount').get(function () {
    if (this.discount?.amount) {
        return this.amount - this.discount.amount;
    }
    return this.amount;
});
PaymentSchema.virtual('statusDisplay').get(function () {
    const statusMap = {
        'Pending': 'Pending Payment',
        'Paid': 'Payment Completed',
        'Failed': 'Payment Failed',
        'Cancelled': 'Payment Cancelled',
        'Refunded': 'Payment Refunded',
        'Partial': 'Partial Payment'
    };
    return statusMap[this.status] || this.status;
});
PaymentSchema.virtual('formattedPaymentDate').get(function () {
    return this.paymentDate.toLocaleDateString();
});
PaymentSchema.virtual('paymentAge').get(function () {
    const now = new Date();
    const paymentDate = new Date(this.paymentDate);
    const diffTime = Math.abs(now.getTime() - paymentDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});
PaymentSchema.pre('save', async function (next) {
    try {
        if (!this.receiptNumber && this.status === 'Paid') {
            const count = await mongoose_1.default.model('Payment').countDocuments({
                organizationId: this.organizationId,
                status: 'Paid'
            });
            this.receiptNumber = `RCP-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
        }
        if (this.rentMonth && !this.rentYear) {
            const year = parseInt(this.rentMonth.split('-')[0]);
            if (!isNaN(year)) {
                this.rentYear = year;
            }
        }
        if (this.fees) {
            this.fees.totalFees = (this.fees.processingFee || 0) +
                (this.fees.lateFee || 0) +
                (this.fees.otherFees || 0);
        }
        if (this.isNew || this.isModified('tenantId') || this.isModified('propertyId')) {
            const Tenant = require('./Tenant').default;
            const tenant = await Tenant.findById(this.tenantId);
            if (!tenant) {
                throw new Error('Tenant not found');
            }
            if (tenant.organizationId.toString() !== this.organizationId.toString()) {
                throw new Error('Tenant does not belong to this organization');
            }
            if (tenant.propertyId.toString() !== this.propertyId.toString()) {
                throw new Error('Tenant does not belong to this property');
            }
        }
        if (this.isNew && this.rentMonth) {
            const existingPayment = await mongoose_1.default.model('Payment').findOne({
                tenantId: this.tenantId,
                rentMonth: this.rentMonth,
                status: 'Paid',
                _id: { $ne: this._id }
            });
            if (existingPayment) {
                throw new Error(`Payment for ${this.rentMonth} already exists for this tenant`);
            }
        }
        if (this.paymentDate > new Date()) {
            throw new Error('Payment date cannot be in the future');
        }
        next();
    }
    catch (error) {
        console.error('Payment pre-save error:', error);
        next(error);
    }
});
PaymentSchema.post('save', async function (doc) {
    try {
        if (doc.status === 'Paid') {
            const Tenant = require('./Tenant').default;
            await Tenant.findByIdAndUpdate(doc.tenantId, {
                $set: { status: 'Active' }
            });
        }
        const Property = require('./Property').default;
        const property = await Property.findById(doc.propertyId);
        if (property) {
            const totalPayments = await mongoose_1.default.model('Payment').aggregate([
                {
                    $match: {
                        propertyId: doc.propertyId,
                        status: 'Paid'
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
            const stats = totalPayments[0] || { totalAmount: 0, count: 0 };
            await Property.findByIdAndUpdate(doc.propertyId, {
                'cashFlow.totalIncome': stats.totalAmount,
                'cashFlow.paymentCount': stats.count
            });
        }
        try {
            const AuditLog = require('./AuditLog').default;
            await AuditLog.create({
                userId: doc.createdBy || doc.recordedBy,
                organizationId: doc.organizationId,
                action: doc.isNew ? 'payment_created' : 'payment_updated',
                resource: 'payment',
                resourceId: doc._id,
                details: {
                    amount: doc.amount,
                    status: doc.status,
                    paymentMethod: doc.paymentMethod,
                    tenantId: doc.tenantId,
                    propertyId: doc.propertyId,
                    rentMonth: doc.rentMonth
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
PaymentSchema.statics.getAnalytics = function (organizationId, startDate, endDate) {
    const matchStage = { organizationId };
    if (startDate || endDate) {
        matchStage.paymentDate = {};
        if (startDate)
            matchStage.paymentDate.$gte = startDate;
        if (endDate)
            matchStage.paymentDate.$lte = endDate;
    }
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: {
                    year: { $year: '$paymentDate' },
                    month: { $month: '$paymentDate' },
                    status: '$status'
                },
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                avgAmount: { $avg: '$amount' }
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);
};
PaymentSchema.statics.checkConflicts = function (tenantId, rentMonth, excludeId) {
    const query = {
        tenantId,
        rentMonth,
        status: 'Paid'
    };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    return this.findOne(query);
};
PaymentSchema.statics.findByTenant = function (tenantId, organizationId) {
    return this.find({ tenantId, organizationId })
        .populate('propertyId', 'name address')
        .sort({ paymentDate: -1 });
};
PaymentSchema.statics.findByProperty = function (propertyId, organizationId) {
    return this.find({ propertyId, organizationId })
        .populate('tenantId', 'name unit')
        .sort({ paymentDate: -1 });
};
PaymentSchema.statics.findByMonth = function (rentMonth, organizationId) {
    return this.find({ rentMonth, organizationId })
        .populate('tenantId', 'name unit')
        .populate('propertyId', 'name')
        .sort({ paymentDate: -1 });
};
PaymentSchema.statics.getPaymentStats = function (organizationId, startDate, endDate) {
    const matchStage = { organizationId };
    if (startDate || endDate) {
        matchStage.paymentDate = {};
        if (startDate)
            matchStage.paymentDate.$gte = startDate;
        if (endDate)
            matchStage.paymentDate.$lte = endDate;
    }
    return this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                avgAmount: { $avg: '$amount' }
            }
        }
    ]);
};
exports.default = mongoose_1.default.model('Payment', PaymentSchema);
