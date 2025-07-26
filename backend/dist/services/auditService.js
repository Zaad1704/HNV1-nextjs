"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
class AuditService {
    async log(data) {
        try {
            const auditLog = new AuditLog_1.default({
                ...data,
                timestamp: new Date(),
                severity: data.severity || 'low',
                success: data.success !== false
            });
            await auditLog.save();
            return auditLog;
        }
        catch (error) {
            console.error('Audit log error:', error);
        }
    }
    async logAuth(organizationId, userId, action, success, ipAddress, userAgent, errorMessage) {
        return this.log({
            organizationId,
            userId,
            action,
            resource: 'authentication',
            description: `User ${action}`,
            ipAddress,
            userAgent,
            severity: success ? 'low' : 'medium',
            category: 'auth',
            success,
            errorMessage
        });
    }
    async logProperty(organizationId, userId, action, propertyId, oldValues, newValues) {
        return this.log({
            organizationId,
            userId,
            action,
            resource: 'property',
            resourceId: propertyId,
            description: `Property ${action}`,
            severity: action.includes('delete') ? 'high' : 'low',
            category: 'property',
            oldValues,
            newValues
        });
    }
    async logTenant(organizationId, userId, action, tenantId, oldValues, newValues) {
        return this.log({
            organizationId,
            userId,
            action,
            resource: 'tenant',
            resourceId: tenantId,
            description: `Tenant ${action}`,
            severity: action.includes('delete') ? 'high' : 'low',
            category: 'tenant',
            oldValues,
            newValues
        });
    }
    async logPayment(organizationId, userId, action, paymentId, amount, metadata) {
        return this.log({
            organizationId,
            userId,
            action,
            resource: 'payment',
            resourceId: paymentId,
            description: `Payment ${action}${amount ? ` - $${amount}` : ''}`,
            severity: 'medium',
            category: 'payment',
            metadata
        });
    }
    async logUser(organizationId, userId, action, targetUserId, oldValues, newValues) {
        return this.log({
            organizationId,
            userId,
            action,
            resource: 'user',
            resourceId: targetUserId,
            description: `User ${action}`,
            severity: action.includes('delete') ? 'high' : 'medium',
            category: 'user',
            oldValues,
            newValues
        });
    }
    async logSecurity(organizationId, userId, action, description, severity = 'high', metadata) {
        return this.log({
            organizationId,
            userId,
            action,
            resource: 'security',
            description,
            severity,
            category: 'security',
            metadata
        });
    }
    async logSystem(organizationId, action, description, metadata) {
        return this.log({
            organizationId,
            action,
            resource: 'system',
            description,
            severity: 'low',
            category: 'system',
            metadata
        });
    }
    async getLogs(organizationId, filters = {}) {
        try {
            const query = { organizationId };
            if (filters.userId)
                query.userId = filters.userId;
            if (filters.category)
                query.category = filters.category;
            if (filters.severity)
                query.severity = filters.severity;
            if (filters.startDate || filters.endDate) {
                query.timestamp = {};
                if (filters.startDate)
                    query.timestamp.$gte = filters.startDate;
                if (filters.endDate)
                    query.timestamp.$lte = filters.endDate;
            }
            const logs = await AuditLog_1.default.find(query)
                .populate('userId', 'name email')
                .sort({ timestamp: -1 })
                .limit(filters.limit || 100)
                .skip(filters.skip || 0);
            return logs;
        }
        catch (error) {
            console.error('Get audit logs error:', error);
            return [];
        }
    }
    async getStats(organizationId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const stats = await AuditLog_1.default.aggregate([
                {
                    $match: {
                        organizationId: organizationId,
                        timestamp: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            category: '$category',
                            severity: '$severity'
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: '$_id.category',
                        severities: {
                            $push: {
                                severity: '$_id.severity',
                                count: '$count'
                            }
                        },
                        total: { $sum: '$count' }
                    }
                }
            ]);
            return stats;
        }
        catch (error) {
            console.error('Get audit stats error:', error);
            return [];
        }
    }
    async cleanOldLogs(retentionDays = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
            const result = await AuditLog_1.default.deleteMany({
                timestamp: { $lt: cutoffDate },
                severity: { $in: ['low', 'medium'] }
            });
            console.log(`Cleaned ${result.deletedCount} old audit logs`);
            return result.deletedCount;
        }
        catch (error) {
            console.error('Clean audit logs error:', error);
            return 0;
        }
    }
}
exports.default = new AuditService();
