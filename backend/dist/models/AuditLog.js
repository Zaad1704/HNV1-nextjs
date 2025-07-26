"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AuditLogSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: mongoose_1.Schema.Types.ObjectId },
    description: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    category: {
        type: String,
        enum: ['auth', 'property', 'tenant', 'payment', 'user', 'system', 'security'],
        required: true
    },
    oldValues: { type: mongoose_1.Schema.Types.Mixed },
    newValues: { type: mongoose_1.Schema.Types.Mixed },
    metadata: { type: mongoose_1.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
    success: { type: Boolean, default: true },
    errorMessage: { type: String }
}, { timestamps: true });
AuditLogSchema.index({ organizationId: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ category: 1, severity: 1 });
AuditLogSchema.index({ resource: 1, action: 1 });
exports.default = (0, mongoose_1.model)('AuditLog', AuditLogSchema);
