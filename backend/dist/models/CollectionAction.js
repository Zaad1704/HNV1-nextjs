"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CollectionActionSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    periodId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'RentCollectionPeriod', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    type: {
        type: String,
        enum: ['call', 'email', 'visit', 'notice', 'payment_received', 'payment_plan'],
        required: true
    },
    details: {
        timestamp: { type: Date, default: Date.now },
        method: {
            type: String,
            enum: ['phone', 'email', 'in_person', 'mail']
        },
        outcome: {
            type: String,
            enum: ['contacted', 'no_answer', 'promised_payment', 'dispute', 'payment_plan', 'completed'],
            required: true
        },
        notes: { type: String, required: true },
        followUpDate: Date
    },
    paymentInfo: {
        amountPromised: Number,
        promisedDate: Date,
        paymentMethod: {
            type: String,
            enum: ['check', 'cash', 'online', 'money_order']
        },
        actualAmount: Number,
        actualDate: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
exports.default = (0, mongoose_1.model)('CollectionAction', CollectionActionSchema);
