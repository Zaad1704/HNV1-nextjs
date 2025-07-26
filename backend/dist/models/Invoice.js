"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const InvoiceSchema = new mongoose_1.Schema({
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
    leaseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Lease',
        index: true
    },
    invoiceNumber: {
        type: String,
        required: [true, 'Invoice number is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Invoice number cannot exceed 50 characters'],
        index: true
    },
    title: {
        type: String,
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    subtotal: {
        type: Number,
        required: [true, 'Subtotal is required'],
        min: [0, 'Subtotal cannot be negative']
    },
    taxAmount: {
        type: Number,
        min: [0, 'Tax amount cannot be negative'],
        default: 0
    },
    discountAmount: {
        type: Number,
        min: [0, 'Discount amount cannot be negative'],
        default: 0
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    issueDate: {
        type: Date,
        required: [true, 'Issue date is required'],
        default: Date.now,
        index: true
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required'],
        validate: {
            validator: function (v) {
                return v >= this.issueDate;
            },
            message: 'Due date must be after issue date'
        },
        index: true
    },
    status: {
        type: String,
        default: 'Draft',
        enum: {
            values: ['Draft', 'Sent', 'Viewed', 'Paid', 'Overdue', 'Cancelled', 'Refunded'],
            message: 'Invalid status value'
        },
        index: true
    },
    priority: {
        type: String,
        enum: {
            values: ['Low', 'Medium', 'High', 'Urgent'],
            message: 'Priority must be Low, Medium, High, or Urgent'
        },
        default: 'Medium'
    },
    category: {
        type: String,
        enum: {
            values: ['Rent', 'Utilities', 'Maintenance', 'Late Fee', 'Security Deposit', 'Other'],
            message: 'Invalid category'
        },
        required: [true, 'Category is required'],
        index: true
    },
    lineItems: [{
            description: {
                type: String,
                required: [true, 'Line item description is required'],
                trim: true,
                maxlength: [500, 'Description cannot exceed 500 characters']
            },
            quantity: {
                type: Number,
                required: [true, 'Quantity is required'],
                min: [0, 'Quantity cannot be negative'],
                default: 1
            },
            unitPrice: {
                type: Number,
                required: [true, 'Unit price is required'],
                min: [0, 'Unit price cannot be negative']
            },
            amount: {
                type: Number,
                required: [true, 'Line item amount is required'],
                min: [0, 'Amount cannot be negative']
            },
            taxRate: {
                type: Number,
                min: [0, 'Tax rate cannot be negative'],
                max: [100, 'Tax rate cannot exceed 100%'],
                default: 0
            }
        }],
    paymentTerms: {
        type: String,
        trim: true,
        maxlength: [500, 'Payment terms cannot exceed 500 characters']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    paidAt: { type: Date },
    sentAt: { type: Date },
    viewedAt: { type: Date },
    transactionId: {
        type: String,
        trim: true,
        maxlength: [100, 'Transaction ID cannot exceed 100 characters']
    },
    paymentMethod: {
        type: String,
        enum: {
            values: ['Cash', 'Bank Transfer', 'Check', 'Credit Card', 'Debit Card', 'Mobile Payment', 'Online', 'Other'],
            message: 'Invalid payment method'
        }
    },
    recurringInfo: {
        isRecurring: {
            type: Boolean,
            default: false
        },
        frequency: {
            type: String,
            enum: {
                values: ['Monthly', 'Quarterly', 'Yearly'],
                message: 'Frequency must be Monthly, Quarterly, or Yearly'
            }
        },
        nextInvoiceDate: {
            type: Date,
            validate: {
                validator: function (v) {
                    return !v || v > new Date();
                },
                message: 'Next invoice date must be in the future'
            }
        },
        endDate: {
            type: Date,
            validate: {
                validator: function (v) {
                    return !v || !this.recurringInfo?.nextInvoiceDate || v > this.recurringInfo.nextInvoiceDate;
                },
                message: 'End date must be after next invoice date'
            }
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
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator is required'],
        index: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
InvoiceSchema.index({ organizationId: 1, status: 1, dueDate: 1 });
InvoiceSchema.index({ tenantId: 1, status: 1 });
InvoiceSchema.index({ propertyId: 1, issueDate: -1 });
InvoiceSchema.index({ organizationId: 1, category: 1 });
InvoiceSchema.index({ createdAt: -1 });
InvoiceSchema.index({ invoiceNumber: 1, organizationId: 1 }, { unique: true });
InvoiceSchema.index({
    invoiceNumber: 'text',
    title: 'text',
    notes: 'text'
});
InvoiceSchema.virtual('daysOverdue').get(function () {
    if (this.status === 'Paid' || !this.dueDate)
        return 0;
    const now = new Date();
    const due = new Date(this.dueDate);
    return Math.max(0, Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
});
InvoiceSchema.virtual('isOverdue').get(function () {
    return this.status !== 'Paid' && this.dueDate && new Date() > this.dueDate;
});
InvoiceSchema.virtual('formattedAmount').get(function () {
    return `$${this.totalAmount.toFixed(2)}`;
});
InvoiceSchema.pre('save', async function (next) {
    try {
        this.subtotal = this.lineItems.reduce((sum, item) => sum + item.amount, 0);
        this.totalAmount = this.subtotal + (this.taxAmount || 0) - (this.discountAmount || 0);
        this.amount = this.totalAmount;
        if (this.status !== 'Paid' && this.status !== 'Cancelled' && this.dueDate && new Date() > this.dueDate) {
            this.status = 'Overdue';
        }
        if (this.isModified('status') && this.status === 'Sent' && !this.sentAt) {
            this.sentAt = new Date();
        }
        if (this.isModified('status') && this.status === 'Viewed' && !this.viewedAt) {
            this.viewedAt = new Date();
        }
        if (this.isModified('status') && this.status === 'Paid' && !this.paidAt) {
            this.paidAt = new Date();
        }
        if (this.isNew || this.isModified('tenantId') || this.isModified('propertyId')) {
            const Tenant = require('./Tenant').default;
            const tenant = await Tenant.findById(this.tenantId);
            if (!tenant || tenant.organizationId.toString() !== this.organizationId.toString()) {
                throw new Error('Tenant does not belong to this organization');
            }
            if (tenant.propertyId.toString() !== this.propertyId.toString()) {
                throw new Error('Tenant does not belong to this property');
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
InvoiceSchema.statics.findByTenant = function (tenantId, organizationId) {
    return this.find({ tenantId, organizationId })
        .populate('propertyId', 'name address')
        .sort({ issueDate: -1 });
};
InvoiceSchema.statics.findOverdue = function (organizationId) {
    return this.find({
        organizationId,
        dueDate: { $lt: new Date() },
        status: { $nin: ['Paid', 'Cancelled'] }
    }).populate('tenantId', 'name email').populate('propertyId', 'name');
};
InvoiceSchema.statics.findByStatus = function (status, organizationId) {
    return this.find({ status, organizationId })
        .populate('tenantId', 'name email')
        .populate('propertyId', 'name')
        .sort({ issueDate: -1 });
};
exports.default = (0, mongoose_1.model)('Invoice', InvoiceSchema);
