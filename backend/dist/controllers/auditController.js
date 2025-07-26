"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = exports.getAuditStats = exports.getAuditLogs = void 0;
const auditService_1 = __importDefault(require("../services/auditService"));
const getAuditLogs = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(400).json({
                success: false,
                message: 'Organization ID is required'
            });
        }
        if (req.user.role !== 'Landlord' && req.user.role !== 'Super Admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only landlords can view audit logs.'
            });
        }
        const { category, severity, startDate, endDate, tenantId, resourceId, limit = 100, skip = 0 } = req.query;
        const filters = {};
        if (category)
            filters.category = category;
        if (severity)
            filters.severity = severity;
        if (startDate)
            filters.startDate = new Date(startDate);
        if (endDate)
            filters.endDate = new Date(endDate);
        if (tenantId)
            filters.tenantId = tenantId;
        if (resourceId)
            filters.resourceId = resourceId;
        if (limit)
            filters.limit = parseInt(limit);
        if (skip)
            filters.skip = parseInt(skip);
        const logs = await auditService_1.default.getLogs(req.user.organizationId, filters);
        res.status(200).json({
            success: true,
            data: logs
        });
    }
    catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit logs'
        });
    }
};
exports.getAuditLogs = getAuditLogs;
const getAuditStats = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(400).json({
                success: false,
                message: 'Organization ID is required'
            });
        }
        if (req.user.role !== 'Landlord' && req.user.role !== 'Super Admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only landlords can view audit statistics.'
            });
        }
        const { days = 30 } = req.query;
        const stats = await auditService_1.default.getStats(req.user.organizationId, parseInt(days));
        res.status(200).json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Get audit stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit statistics'
        });
    }
};
exports.getAuditStats = getAuditStats;
const createAuditLog = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(400).json({
                success: false,
                message: 'Organization ID is required'
            });
        }
        const { action, resource, resourceId, description, severity = 'low', category, metadata } = req.body;
        if (!action || !resource || !description || !category) {
            return res.status(400).json({
                success: false,
                message: 'Action, resource, description, and category are required'
            });
        }
        const log = await auditService_1.default.log({
            organizationId: req.user.organizationId,
            userId: req.user._id,
            action,
            resource,
            resourceId,
            description,
            severity,
            category,
            metadata,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.status(201).json({
            success: true,
            data: log
        });
    }
    catch (error) {
        console.error('Create audit log error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create audit log'
        });
    }
};
exports.createAuditLog = createAuditLog;
