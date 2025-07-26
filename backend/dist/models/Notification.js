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
const NotificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    organizationId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Organization',
        index: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        maxlength: 1000
    },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error', 'payment', 'maintenance', 'system'],
        default: 'info',
        index: true
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    readAt: {
        type: Date
    },
    actionUrl: {
        type: String,
        maxlength: 500
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed
    }
}, {
    timestamps: true
});
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ organizationId: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
exports.default = mongoose_1.default.model('Notification', NotificationSchema);
