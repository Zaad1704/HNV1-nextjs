"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const AnalyticsSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    organizationId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Organization' },
    event: { type: String, required: true, index: true },
    category: {
        type: String,
        enum: ['page_view', 'user_action', 'feature_usage', 'error', 'performance'],
        required: true,
        index: true
    },
    properties: { type: mongoose_1.Schema.Types.Mixed },
    sessionId: { type: String, required: true, index: true },
    userAgent: { type: String },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now, index: true }
}, {
    timestamps: false
});
AnalyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });
AnalyticsSchema.index({ userId: 1, timestamp: -1 });
AnalyticsSchema.index({ organizationId: 1, category: 1, timestamp: -1 });
exports.default = mongoose_1.default.model('Analytics', AnalyticsSchema);
