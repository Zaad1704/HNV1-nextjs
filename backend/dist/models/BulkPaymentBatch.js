"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BulkPaymentBatchSchema = new mongoose_1.Schema({
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    batchName: {
        type: String,
        required: true,
    },
    batchType: {
        type: String,
        enum: ['rent_collection', 'late_fees', 'deposits', 'custom'],
        required: true,
    },
    status: {
        type: String,
        enum: ['draft', 'processing', 'completed', 'failed', 'partial'],
        default: 'draft',
    },
    totalAmount: {
        type: Number,
        default: 0,
    },
    totalPayments: {
        type: Number,
        default: 0,
    },
    processedPayments: {
        type: Number,
        default: 0,
    },
    successfulPayments: {
        type: Number,
        default: 0,
    },
    failedPayments: {
        type: Number,
        default: 0,
    },
    processingStarted: {
        type: Date,
    },
    processingCompleted: {
        type: Date,
    },
    filters: {
        propertyIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Property' }],
        tenantIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant' }],
        paymentStatus: [{ type: String }],
        dateRange: {
            start: { type: Date },
            end: { type: Date },
        },
    },
    paymentDetails: {
        amount: { type: Number },
        description: { type: String, required: true },
        paymentMethod: { type: String, required: true },
        dueDate: { type: Date, required: true },
        autoProcess: { type: Boolean, default: false },
    },
    payments: [{
            tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true },
            propertyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
            unitId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Unit' },
            amount: { type: Number, required: true },
            status: {
                type: String,
                enum: ['pending', 'processing', 'success', 'failed'],
                default: 'pending',
            },
            paymentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Payment' },
            errorMessage: { type: String },
            processedAt: { type: Date },
        }],
    summary: {
        totalTenants: { type: Number, default: 0 },
        totalProperties: { type: Number, default: 0 },
        avgPaymentAmount: { type: Number, default: 0 },
        successRate: { type: Number, default: 0 },
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });
BulkPaymentBatchSchema.index({ organizationId: 1, status: 1 });
BulkPaymentBatchSchema.index({ organizationId: 1, createdAt: -1 });
BulkPaymentBatchSchema.index({ 'payments.status': 1 });
exports.default = (0, mongoose_1.model)('BulkPaymentBatch', BulkPaymentBatchSchema);
