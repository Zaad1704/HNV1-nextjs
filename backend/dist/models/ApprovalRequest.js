"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ApprovalRequestSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: {
            values: ['property_edit', 'tenant_delete', 'payment_modify', 'expense_add', 'maintenance_close', 'other'],
            message: 'Invalid approval request type'
        },
        required: [true, 'Type is required'],
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
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    requestedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Requester is required'],
        index: true
    },
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
    tenantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Tenant',
        index: true
    },
    paymentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Payment',
        index: true
    },
    expenseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Expense',
        index: true
    },
    maintenanceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MaintenanceRequest',
        index: true
    },
    requestData: {
        type: mongoose_1.Schema.Types.Mixed,
        required: [true, 'Request data is required']
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'approved', 'rejected'],
            message: 'Status must be pending, approved, or rejected'
        },
        default: 'pending',
        index: true
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    approvedAt: { type: Date },
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: [500, 'Rejection reason cannot exceed 500 characters']
    },
    priority: {
        type: String,
        enum: {
            values: ['low', 'medium', 'high', 'urgent'],
            message: 'Priority must be low, medium, high, or urgent'
        },
        default: 'medium',
        index: true
    },
    dueDate: {
        type: Date,
        validate: {
            validator: function (v) {
                return !v || v >= new Date();
            },
            message: 'Due date cannot be in the past'
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
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
    comments: [{
            userId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            message: {
                type: String,
                required: true,
                trim: true,
                maxlength: [1000, 'Comment cannot exceed 1000 characters']
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
ApprovalRequestSchema.index({ organizationId: 1, status: 1, priority: -1 });
ApprovalRequestSchema.index({ requestedBy: 1, createdAt: -1 });
ApprovalRequestSchema.index({ type: 1, organizationId: 1 });
ApprovalRequestSchema.index({ dueDate: 1, status: 1 });
ApprovalRequestSchema.index({ createdAt: -1 });
ApprovalRequestSchema.index({
    title: 'text',
    description: 'text'
});
ApprovalRequestSchema.virtual('ageInDays').get(function () {
    const now = new Date();
    const created = new Date(this.createdAt);
    return Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
});
ApprovalRequestSchema.virtual('isOverdue').get(function () {
    return this.dueDate && new Date() > this.dueDate && this.status === 'pending';
});
ApprovalRequestSchema.pre('save', async function (next) {
    try {
        if (!this.dueDate && this.isNew) {
            const now = new Date();
            const dueDateMap = {
                'urgent': 1,
                'high': 3,
                'medium': 7,
                'low': 14
            };
            const daysToAdd = dueDateMap[this.priority] || 7;
            this.dueDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
        }
        if (this.isModified('status') && (this.status === 'approved' || this.status === 'rejected')) {
            if (!this.approvedAt) {
                this.approvedAt = new Date();
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
ApprovalRequestSchema.post('save', async function (doc) {
    try {
        const AuditLog = require('./AuditLog').default;
        await AuditLog.create({
            userId: doc.requestedBy,
            organizationId: doc.organizationId,
            action: doc.isNew ? 'approval_request_created' : 'approval_request_updated',
            resource: 'approval_request',
            resourceId: doc._id,
            details: {
                type: doc.type,
                status: doc.status,
                priority: doc.priority,
                title: doc.title
            },
            timestamp: new Date()
        });
    }
    catch (error) {
        console.error('Audit log error (non-critical):', error);
    }
});
ApprovalRequestSchema.statics.findPending = function (organizationId) {
    return this.find({ organizationId, status: 'pending' })
        .populate('requestedBy', 'name email')
        .sort({ priority: -1, createdAt: -1 });
};
ApprovalRequestSchema.statics.findOverdue = function (organizationId) {
    return this.find({
        organizationId,
        status: 'pending',
        dueDate: { $lt: new Date() }
    }).populate('requestedBy', 'name email');
};
exports.default = (0, mongoose_1.model)('ApprovalRequest', ApprovalRequestSchema);
