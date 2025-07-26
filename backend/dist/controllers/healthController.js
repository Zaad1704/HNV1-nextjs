"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardHealth = exports.healthCheck = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Property_1 = __importDefault(require("../models/Property"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const healthCheck = async (req, res) => {
    try {
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version || '1.0.0'
        };
        res.status(200).json({ success: true, data: health });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.healthCheck = healthCheck;
const dashboardHealth = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const organizationId = req.user.organizationId;
        const startTime = Date.now();
        const [propertiesCount, tenantsCount, paymentsCount] = await Promise.allSettled([
            Property_1.default.countDocuments({ organizationId }).exec(),
            Tenant_1.default.countDocuments({ organizationId }).exec(),
            Payment_1.default.countDocuments({ organizationId }).exec()
        ]);
        const queryTime = Date.now() - startTime;
        const health = {
            status: 'ok',
            organizationId,
            queryTime: `${queryTime}ms`,
            collections: {
                properties: {
                    status: propertiesCount.status,
                    count: propertiesCount.status === 'fulfilled' ? propertiesCount.value : 0,
                    error: propertiesCount.status === 'rejected' ? propertiesCount.reason?.message : null
                },
                tenants: {
                    status: tenantsCount.status,
                    count: tenantsCount.status === 'fulfilled' ? tenantsCount.value : 0,
                    error: tenantsCount.status === 'rejected' ? tenantsCount.reason?.message : null
                },
                payments: {
                    status: paymentsCount.status,
                    count: paymentsCount.status === 'fulfilled' ? paymentsCount.value : 0,
                    error: paymentsCount.status === 'rejected' ? paymentsCount.reason?.message : null
                }
            },
            database: {
                connected: mongoose_1.default.connection.readyState === 1,
                state: mongoose_1.default.connection.readyState,
                host: mongoose_1.default.connection.host,
                name: mongoose_1.default.connection.name
            }
        };
        res.status(200).json({ success: true, data: health });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Dashboard health check failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.dashboardHealth = dashboardHealth;
