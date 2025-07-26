"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    else if (req.query.token) {
        token = req.query.token;
    }
    if (token) {
        try {
            const secret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            const foundUser = await User_1.default.findById(decoded.id).select("-password");
            if (foundUser && foundUser.organizationId) {
                const subscription = await Subscription_1.default.findOne({
                    organizationId: foundUser.organizationId
                }).populate('planId');
                if (subscription) {
                    foundUser.subscription = subscription;
                }
            }
            req.user = foundUser;
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized, user not found"
                });
            }
            if (req.user.status === "suspended") {
                return res.status(401).json({
                    success: false,
                    message: "User account is suspended."
                });
            }
            if (req.user.role === 'Super Admin') {
                return next();
            }
            const isEmailVerificationExpired = !req.user.isEmailVerified && req.user.createdAt &&
                new Date() > new Date(req.user.createdAt.getTime() + 24 * 60 * 60 * 1000);
            if (req.user.organizationId) {
                const subscription = await Subscription_1.default.findOne({
                    organizationId: req.user.organizationId
                });
                const isSubscriptionInactive = subscription && subscription.status !== 'active' && subscription.status !== 'trialing';
                if (isEmailVerificationExpired || isSubscriptionInactive) {
                    const viewOnlyRoutes = ['/api/dashboard', '/api/properties', '/api/tenants', '/api/payments', '/api/expenses', '/api/maintenance'];
                    const isViewOnlyRoute = viewOnlyRoutes.some(route => req.originalUrl.startsWith(route));
                    const isGetRequest = req.method === 'GET';
                    if (isViewOnlyRoute && isGetRequest) {
                        return next();
                    }
                    const restrictionMessage = isEmailVerificationExpired
                        ? "Please verify your email address to restore full functionality. You can view existing data but cannot add, edit, or delete items."
                        : "Your subscription has expired. You can view existing data but cannot add, edit, or delete items. Please reactivate your subscription to restore full functionality.";
                    return res.status(403).json({
                        success: false,
                        message: restrictionMessage,
                        action: isEmailVerificationExpired ? "verify_email" : "renew_subscription",
                        upgradeUrl: isEmailVerificationExpired ? "/dashboard/settings" : "/billing"
                    });
                }
                return next();
            }
            else {
                if (isEmailVerificationExpired) {
                    const viewOnlyRoutes = ['/api/dashboard', '/api/auth'];
                    const isViewOnlyRoute = viewOnlyRoutes.some(route => req.originalUrl.startsWith(route));
                    const isGetRequest = req.method === 'GET';
                    if (isViewOnlyRoute && isGetRequest) {
                        return next();
                    }
                    return res.status(403).json({
                        success: false,
                        message: "Please verify your email address to restore full functionality.",
                        action: "verify_email",
                        upgradeUrl: "/dashboard/settings"
                    });
                }
                return next();
            }
            return next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized, invalid token."
                });
            }
            console.error("Authentication error:", error);
            return res.status(500).json({
                success: false,
                message: "Server Error during authentication."
            });
        }
    }
    return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided."
    });
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user?.role} is not authorized to access this route`
            });
        }
        next();
    };
};
exports.authorize = authorize;
