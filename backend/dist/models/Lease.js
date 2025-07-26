"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const LeaseSchema = new mongoose_1.Schema({
    propertyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true },
    unitId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Unit' },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rentAmount: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['active', 'expired', 'terminated', 'pending_renewal', 'renewed'],
        default: 'active'
    },
    leaseType: {
        type: String,
        enum: ['fixed', 'month_to_month', 'yearly'],
        default: 'yearly'
    },
    autoRenewal: {
        enabled: { type: Boolean, default: false },
        renewalPeriod: { type: Number, default: 12 },
        rentIncrease: {
            type: { type: String, enum: ['percentage', 'fixed'] },
            value: { type: Number, default: 0 }
        },
        notificationDays: { type: Number, default: 30 }
    },
    renewalHistory: [{
            renewedAt: { type: Date },
            previousEndDate: { type: Date },
            newEndDate: { type: Date },
            oldRent: { type: Number },
            newRent: { type: Number },
            renewalType: { type: String, enum: ['auto', 'manual'] }
        }],
    documents: [{
            type: {
                type: String,
                enum: ['lease_agreement', 'renewal', 'termination', 'amendment']
            },
            url: { type: String },
            filename: { type: String },
            generatedAt: { type: Date, default: Date.now },
            templateUsed: { type: String }
        }],
    terms: {
        lateFeeDays: { type: Number, default: 5 },
        lateFeeAmount: { type: Number, default: 50 },
        petPolicy: { type: String },
        maintenanceResponsibility: { type: String },
        utilitiesIncluded: [{ type: String }],
        parkingSpaces: { type: Number, default: 0 },
        specialClauses: [{ type: String }]
    },
    notifications: [{
            type: {
                type: String,
                enum: ['renewal_reminder', 'expiry_warning', 'auto_renewed']
            },
            sentAt: { type: Date },
            daysBeforeExpiry: { type: Number }
        }]
}, { timestamps: true });
LeaseSchema.index({ organizationId: 1, status: 1 });
LeaseSchema.index({ endDate: 1, status: 1 });
LeaseSchema.index({ 'autoRenewal.enabled': 1, endDate: 1 });
exports.default = (0, mongoose_1.model)('Lease', LeaseSchema);
