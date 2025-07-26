"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TenantMovementSchema = new mongoose_1.Schema({
    tenantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
    },
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
    },
    movementType: {
        type: String,
        enum: ['move_in', 'move_out', 'transfer', 'eviction'],
        required: true,
    },
    movementDate: {
        type: Date,
        default: Date.now,
    },
    fromProperty: {
        propertyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property' },
        propertyName: { type: String },
        unitId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Unit' },
        unitNumber: { type: String },
        unitNickname: { type: String },
    },
    toProperty: {
        propertyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property' },
        propertyName: { type: String },
        unitId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Unit' },
        unitNumber: { type: String },
        unitNickname: { type: String },
    },
    rentChange: {
        oldRent: { type: Number },
        newRent: { type: Number },
        changeAmount: { type: Number },
        changePercentage: { type: Number },
    },
    reason: { type: String },
    notes: { type: String },
    processedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    documents: [{
            type: {
                type: String,
                enum: ['move_in_checklist', 'move_out_checklist', 'transfer_agreement'],
            },
            url: { type: String },
            filename: { type: String },
            uploadedAt: { type: Date, default: Date.now },
        }],
}, { timestamps: true });
TenantMovementSchema.index({ tenantId: 1, movementDate: -1 });
TenantMovementSchema.index({ organizationId: 1, movementDate: -1 });
TenantMovementSchema.index({ 'fromProperty.propertyId': 1 });
TenantMovementSchema.index({ 'toProperty.propertyId': 1 });
exports.default = (0, mongoose_1.model)('TenantMovement', TenantMovementSchema);
