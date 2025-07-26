"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReminderSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['rent_due', 'lease_expiry', 'maintenance_due', 'inspection_due', 'payment_overdue', 'custom'],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    propertyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property' },
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant' },
    frequency: {
        type: String,
        enum: ['once', 'daily', 'weekly', 'monthly', 'yearly'],
        default: 'monthly'
    },
    triggerDate: { type: Date, required: true },
    nextRunDate: { type: Date, required: true },
    lastRunDate: { type: Date },
    status: {
        type: String,
        enum: ['active', 'paused', 'completed', 'cancelled'],
        default: 'active'
    },
    recipients: {
        tenants: { type: Boolean, default: true },
        landlords: { type: Boolean, default: false },
        agents: { type: Boolean, default: false },
        custom: [{ type: String }]
    },
    channels: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        whatsapp: { type: Boolean, default: false },
        inApp: { type: Boolean, default: true }
    },
    conditions: {
        daysBeforeDue: { type: Number },
        amountThreshold: { type: Number },
        propertyStatus: { type: String },
        tenantStatus: { type: String }
    },
    executionCount: { type: Number, default: 0 },
    maxExecutions: { type: Number }
}, { timestamps: true });
ReminderSchema.index({ organizationId: 1, status: 1 });
ReminderSchema.index({ nextRunDate: 1, status: 1 });
ReminderSchema.index({ type: 1, organizationId: 1 });
exports.default = (0, mongoose_1.model)('Reminder', ReminderSchema);
