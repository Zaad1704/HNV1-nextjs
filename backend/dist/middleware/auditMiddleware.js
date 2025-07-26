"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = exports.logAction = exports.auditLogger = void 0;
const auditService_1 = __importDefault(require("../services/auditService"));
const auditLogger = (category) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        res.send = function (data) {
            if (req.user?.organizationId) {
                const action = `${req.method.toLowerCase()}_${req.route?.path || req.path}`;
                const success = res.statusCode < 400;
                auditService_1.default.log({
                    organizationId: req.user.organizationId,
                    userId: req.user._id,
                    action,
                    resource: category,
                    description: `${req.method} ${req.originalUrl}`,
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                    severity: success ? 'low' : 'medium',
                    category,
                    success,
                    errorMessage: success ? undefined : 'Request failed',
                    metadata: {
                        method: req.method,
                        url: req.originalUrl,
                        statusCode: res.statusCode,
                        body: req.method !== 'GET' ? req.body : undefined
                    }
                }).catch(console.error);
            }
            return originalSend.call(this, data);
        };
        next();
    };
};
exports.auditLogger = auditLogger;
const logAction = (action, resource, severity = 'low') => {
    return async (req, res, next) => {
        if (req.user?.organizationId) {
            auditService_1.default.log({
                organizationId: req.user.organizationId,
                userId: req.user._id,
                action,
                resource,
                description: `${action} on ${resource}`,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                severity,
                category: resource,
                metadata: {
                    method: req.method,
                    url: req.originalUrl,
                    body: req.body
                }
            }).catch(console.error);
        }
        next();
    };
};
exports.logAction = logAction;
exports.auditLog = exports.auditLogger;
