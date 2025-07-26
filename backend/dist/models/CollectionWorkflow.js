"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CollectionWorkflowSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    triggers: {
        daysLate: [{ type: Number, required: true }],
        conditions: {
            minAmount: Number,
            excludeStatuses: [String],
            propertyTypes: [String]
        }
    },
    actions: [{
            day: { type: Number, required: true },
            type: {
                type: String,
                enum: ['email', 'sms', 'call', 'notice', 'legal'],
                required: true
            },
            template: { type: String, required: true },
            automatic: { type: Boolean, default: false },
            assignTo: {
                type: String,
                enum: ['property_manager', 'collections_specialist', 'owner']
            },
            delay: { type: Number, default: 0 }
        }],
    escalation: {
        enabled: { type: Boolean, default: false },
        afterDays: { type: Number, default: 30 },
        action: {
            type: String,
            enum: ['legal_notice', 'eviction', 'collections_agency']
        },
        assignTo: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
exports.default = (0, mongoose_1.model)('CollectionWorkflow', CollectionWorkflowSchema);
