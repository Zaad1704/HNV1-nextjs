"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const crypto_1 = __importDefault(require("crypto"));
const AgentInvitationSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    inviterId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientEmail: { type: String, required: true },
    role: { type: String, required: true, default: 'Agent', enum: ['Agent'] },
    status: { type: String, required: true, default: 'pending', enum: ['pending', 'accepted', 'expired'] },
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true }
}, { timestamps: true });
AgentInvitationSchema.pre('validate', function (next) {
    if (!this.token) {
        this.token = crypto_1.default.randomBytes(32).toString('hex');
        this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    next();
});
exports.default = (0, mongoose_1.model)('AgentInvitation', AgentInvitationSchema);
