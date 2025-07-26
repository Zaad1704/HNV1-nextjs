"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AgentHandoverSchema = new mongoose_1.Schema({
    agentName: { type: String, required: true },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    collectionDate: { type: Date, required: true },
    handoverDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    handoverMethod: {
        type: String,
        enum: ['cash_handover', 'bank_deposit', 'bank_transfer', 'office_deposit'],
        required: true
    },
    bankDetails: { type: String },
    referenceNumber: { type: String },
    notes: { type: String },
    propertyIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Property' }],
    handoverProofUrl: { type: String, required: true },
    collectionSheetUrl: { type: String },
    recordedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'disputed'], default: 'pending' }
}, { timestamps: true });
AgentHandoverSchema.index({ organizationId: 1, collectionDate: -1 });
AgentHandoverSchema.index({ agentName: 1, handoverDate: -1 });
exports.default = (0, mongoose_1.model)('AgentHandover', AgentHandoverSchema);
