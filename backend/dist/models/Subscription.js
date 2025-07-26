"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SubscriptionSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    planId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Plan', required: true },
    status: {
        type: String,
        enum: ['active', 'inactive', 'canceled', 'past_due', 'expired', 'trialing'],
        default: 'trialing'
    },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    trialStart: { type: Date },
    trialEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    canceledAt: { type: Date },
    endedAt: { type: Date },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
    paymentMethod: { type: String, default: 'card' },
    stripeSubscriptionId: { type: String },
    twocheckoutSubscriptionId: { type: String },
    lastPaymentDate: { type: Date },
    nextBillingDate: { type: Date },
    failedPaymentAttempts: { type: Number, default: 0 },
    isLifetime: { type: Boolean, default: false },
    trialExpiresAt: { type: Date },
    currentPeriodEndsAt: { type: Date },
    currentProperties: { type: Number, default: 0 },
    currentTenants: { type: Number, default: 0 },
    currentAgents: { type: Number, default: 0 },
    currentUsers: { type: Number, default: 0 },
    features: [{ type: String }],
    limits: {
        properties: { type: Number, default: 10 },
        tenants: { type: Number, default: 50 },
        users: { type: Number, default: 5 },
        storage: { type: Number, default: 1000 },
        exports: { type: Number, default: 20 }
    },
    usage: {
        properties: { type: Number, default: 0 },
        tenants: { type: Number, default: 0 },
        users: { type: Number, default: 0 },
        storage: { type: Number, default: 0 },
        exports: { type: Number, default: 0 },
        lastReset: { type: Date, default: Date.now }
    }
}, { timestamps: true });
SubscriptionSchema.index({ organizationId: 1 });
SubscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });
SubscriptionSchema.index({ twocheckoutSubscriptionId: 1 });
exports.default = (0, mongoose_1.model)('Subscription', SubscriptionSchema);
