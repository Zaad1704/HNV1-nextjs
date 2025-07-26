"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireApproval = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const APPROVAL_REQUIRED_ACTIONS = {
    expense: ['create', 'update', 'delete'],
    maintenance: ['update', 'delete'],
    payment: ['delete'],
    tenant: ['delete'],
    property: ['delete']
};
const ApprovalSchema = new mongoose_1.default.Schema({
    organizationId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Organization', required: true },
    requestedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    resourceId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    action: { type: String, required: true },
    data: { type: mongoose_1.default.Schema.Types.Mixed },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });
const Approval = mongoose_1.default.models.Approval || mongoose_1.default.model('Approval', ApprovalSchema);
const requireApproval = (resourceType) => {
    return async (req, res, next) => {
        try {
            if (req.user?.role === 'Landlord' || req.user?.role === 'Super Admin') {
                return next();
            }
            if (req.method === 'GET') {
                return next();
            }
            const action = req.method === 'POST' ? 'create' :
                req.method === 'PUT' ? 'update' :
                    req.method === 'DELETE' ? 'delete' : 'unknown';
            const requiredActions = APPROVAL_REQUIRED_ACTIONS[resourceType];
            if (!requiredActions || !requiredActions.includes(action)) {
                return next();
            }
            if (resourceType === 'expense' && action === 'create') {
                const amount = parseFloat(req.body.amount);
                if (amount < 500) {
                    return next();
                }
            }
            const approval = await Approval.create({
                organizationId: req.user.organizationId,
                requestedBy: req.user._id,
                type: resourceType,
                resourceId: req.params.id || 'new',
                action,
                data: req.body,
                status: 'pending'
            });
            return res.status(202).json({
                success: true,
                message: 'Request submitted for approval',
                approvalId: approval._id,
                requiresApproval: true
            });
        }
        catch (error) {
            console.error('Approval middleware error:', error);
            next();
        }
    };
};
exports.requireApproval = requireApproval;
exports.default = exports.requireApproval;
