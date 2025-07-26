"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUsageCount = exports.checkUsageLimit = exports.checkSubscriptionStatus = void 0;
const subscriptionService_1 = __importDefault(require("../services/subscriptionService"));
const checkSubscriptionStatus = async (req, res, next) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({
                success: false,
                message: 'Organization ID required'
            });
        }
        const statusCheck = await subscriptionService_1.default.checkSubscriptionStatus(req.user.organizationId);
        if (!statusCheck.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Subscription required',
                reason: statusCheck.reason,
                redirectTo: '/billing'
            });
        }
        req.subscription = statusCheck.subscription;
        next();
    }
    catch (error) {
        console.error('Subscription check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking subscription status'
        });
    }
};
exports.checkSubscriptionStatus = checkSubscriptionStatus;
const checkUsageLimit = (limitType) => {
    return async (req, res, next) => {
        try {
            if (!req.user?.organizationId) {
                return res.status(401).json({
                    success: false,
                    message: 'Organization ID required'
                });
            }
            const usageCheck = await subscriptionService_1.default.checkUsageLimit(req.user.organizationId, limitType);
            if (!usageCheck.allowed) {
                return res.status(403).json({
                    success: false,
                    message: `${limitType} limit exceeded`,
                    reason: usageCheck.reason,
                    currentUsage: usageCheck.currentUsage,
                    limit: usageCheck.limit,
                    redirectTo: '/billing'
                });
            }
            next();
        }
        catch (error) {
            console.error('Usage limit check error:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking usage limits'
            });
        }
    };
};
exports.checkUsageLimit = checkUsageLimit;
const updateUsageCount = (limitType, increment = 1) => {
    return async (req, res, next) => {
        try {
            if (req.user?.organizationId) {
                await subscriptionService_1.default.updateUsage(req.user.organizationId, limitType, increment);
            }
            next();
        }
        catch (error) {
            console.error('Usage update error:', error);
            next();
        }
    };
};
exports.updateUsageCount = updateUsageCount;
