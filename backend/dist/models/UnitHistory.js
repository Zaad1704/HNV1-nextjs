"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UnitHistorySchema = new mongoose_1.Schema({
    unitId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Unit',
        required: true,
    },
    propertyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
    },
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    eventType: {
        type: String,
        enum: ['tenant_moved_in', 'tenant_moved_out', 'rent_changed', 'unit_renovated', 'status_changed', 'nickname_changed'],
        required: true,
    },
    eventDate: {
        type: Date,
        default: Date.now,
    },
    previousData: {
        tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant' },
        tenantName: { type: String },
        rentAmount: { type: Number },
        status: { type: String },
        nickname: { type: String },
    },
    newData: {
        tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant' },
        tenantName: { type: String },
        rentAmount: { type: Number },
        status: { type: String },
        nickname: { type: String },
    },
    notes: { type: String },
    triggeredBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });
UnitHistorySchema.index({ unitId: 1, eventDate: -1 });
UnitHistorySchema.index({ organizationId: 1, eventDate: -1 });
UnitHistorySchema.index({ propertyId: 1, eventDate: -1 });
exports.default = (0, mongoose_1.model)('UnitHistory', UnitHistorySchema);
