"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const EditRequestSchema = new mongoose_1.Schema({
    resourceId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    resourceModel: { type: String, required: true },
    requester: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    approver: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('EditRequest', EditRequestSchema);
