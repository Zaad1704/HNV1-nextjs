import { Request, Response } from 'express';
import auditService from '../services/auditService';

interface AuthRequest extends Request {
  user?: any;
}

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    // Only landlords and super admins can view audit logs
    if (req.user.role !== 'Landlord' && req.user.role !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only landlords can view audit logs.'
      });
    }

    const {
      category,
      severity,
      startDate,
      endDate,
      tenantId,
      resourceId,
      limit = 100,
      skip = 0
    } = req.query;

    const filters: any = {};
    if (category) filters.category = category;
    if (severity) filters.severity = severity;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (tenantId) filters.tenantId = tenantId;
    if (resourceId) filters.resourceId = resourceId;
    if (limit) filters.limit = parseInt(limit as string);
    if (skip) filters.skip = parseInt(skip as string);

    const logs = await auditService.getLogs(req.user.organizationId, filters);

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs'
    });
  }
};

export const getAuditStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    // Only landlords and super admins can view audit stats
    if (req.user.role !== 'Landlord' && req.user.role !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only landlords can view audit statistics.'
      });
    }

    const { days = 30 } = req.query;
    const stats = await auditService.getStats(req.user.organizationId, parseInt(days as string));

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit statistics'
    });
  }
};

export const createAuditLog = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    const {
      action,
      resource,
      resourceId,
      description,
      severity = 'low',
      category,
      metadata
    } = req.body;

    if (!action || !resource || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Action, resource, description, and category are required'
      });
    }

    const log = await auditService.log({
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
  } catch (error) {
    console.error('Create audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create audit log'
    });
  }
};