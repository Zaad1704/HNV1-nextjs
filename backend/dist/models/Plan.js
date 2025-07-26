"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PlanSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    billingCycle: { type: String, enum: ['monthly', 'yearly'], required: true },
    duration: { type: String, required: true },
    features: [{ type: String }],
    limits: {
        properties: { type: Number, required: true },
        tenants: { type: Number, required: true },
        users: { type: Number, required: true },
        storage: { type: Number, required: true },
        exports: { type: Number, required: true }
    },
    twocheckoutProductId: { type: String },
    stripeProductId: { type: String },
    stripePriceId: { type: String },
    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 }
}, { timestamps: true });
PlanSchema.index({ isActive: 1, sortOrder: 1 });
exports.default = (0, mongoose_1.model)('Plan', PlanSchema);
