"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PaymentScheduleSchema = new mongoose_1.Schema({
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    tenantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
    },
    propertyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
    },
    unitId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Unit',
    },
    scheduleType: {
        type: String,
        enum: ['recurring', 'installment', 'custom'],
        required: true,
    },
    frequency: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
    },
    nextDueDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'paused', 'completed', 'cancelled'],
        default: 'active',
    },
    autoProcess: {
        type: Boolean,
        default: false,
    },
    paymentMethod: {
        type: String,
        enum: ['auto_debit', 'manual', 'online_portal'],
        default: 'manual',
    },
    reminders: {
        enabled: { type: Boolean, default: true },
        daysBefore: [{ type: Number }],
        methods: [{ type: String, enum: ['email', 'sms', 'push'] }],
    },
    installmentPlan: {
        totalAmount: { type: Number },
        installments: { type: Number },
        currentInstallment: { type: Number, default: 1 },
        installmentAmount: { type: Number },
    },
    processedPayments: [{
            paymentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Payment' },
            processedDate: { type: Date },
            amount: { type: Number },
            status: { type: String, enum: ['success', 'failed', 'pending'] },
        }],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });
PaymentScheduleSchema.index({ organizationId: 1, status: 1 });
PaymentScheduleSchema.index({ nextDueDate: 1, status: 1 });
PaymentScheduleSchema.index({ tenantId: 1, status: 1 });
exports.default = (0, mongoose_1.model)('PaymentSchedule', PaymentScheduleSchema);
