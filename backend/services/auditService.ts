import AuditLog from '../models/AuditLog';

interface AuditLogData {
  organizationId: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'property' | 'tenant' | 'payment' | 'user' | 'system' | 'security';
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  success?: boolean;
  errorMessage?: string;
}

class AuditService {
  
  // Log an audit event
  async log(data: AuditLogData) {
    try {
      const auditLog = new AuditLog({
        ...data,
        timestamp: new Date(),
        severity: data.severity || 'low',
        success: data.success !== false
      });
      
      await auditLog.save();
      return auditLog;
    } catch (error) {
      console.error('Audit log error:', error);
      // Don't throw error to avoid breaking main functionality
    }
  }

  // Log authentication events
  async logAuth(organizationId: string, userId: string, action: string, success: boolean, ipAddress?: string, userAgent?: string, errorMessage?: string) {
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

  // Log property changes
  async logProperty(organizationId: string, userId: string, action: string, propertyId: string, oldValues?: any, newValues?: any) {
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

  // Log tenant changes
  async logTenant(organizationId: string, userId: string, action: string, tenantId: string, oldValues?: any, newValues?: any) {
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

  // Log payment activities
  async logPayment(organizationId: string, userId: string, action: string, paymentId: string, amount?: number, metadata?: any) {
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

  // Log user management
  async logUser(organizationId: string, userId: string, action: string, targetUserId: string, oldValues?: any, newValues?: any) {
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

  // Log security events
  async logSecurity(organizationId: string, userId: string, action: string, description: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'high', metadata?: any) {
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

  // Log system events
  async logSystem(organizationId: string, action: string, description: string, metadata?: any) {
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

  // Get audit logs with filtering
  async getLogs(organizationId: string, filters: {
    userId?: string;
    category?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    skip?: number;
  } = {}) {
    try {
      const query: any = { organizationId };
      
      if (filters.userId) query.userId = filters.userId;
      if (filters.category) query.category = filters.category;
      if (filters.severity) query.severity = filters.severity;
      
      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = filters.startDate;
        if (filters.endDate) query.timestamp.$lte = filters.endDate;
      }

      const logs = await AuditLog.find(query)
        .populate('userId', 'name email')
        .sort({ timestamp: -1 })
        .limit(filters.limit || 100)
        .skip(filters.skip || 0);

      return logs;
    } catch (error) {
      console.error('Get audit logs error:', error);
      return [];
    }
  }

  // Get audit log statistics
  async getStats(organizationId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await AuditLog.aggregate([
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
    } catch (error) {
      console.error('Get audit stats error:', error);
      return [];
    }
  }

  // Clean old audit logs (retention policy)
  async cleanOldLogs(retentionDays: number = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await AuditLog.deleteMany({
        timestamp: { $lt: cutoffDate },
        severity: { $in: ['low', 'medium'] } // Keep high and critical logs longer
      });

      console.log(`Cleaned ${result.deletedCount} old audit logs`);
      return result.deletedCount;
    } catch (error) {
      console.error('Clean audit logs error:', error);
      return 0;
    }
  }
}

export default new AuditService();