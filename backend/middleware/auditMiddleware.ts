import { Request, Response, NextFunction } from 'express';
import auditService from '../services/auditService';

interface AuthRequest extends Request {
  user?: any;
}

// Middleware to automatically log API requests
export const auditLogger = (category: 'auth' | 'property' | 'tenant' | 'payment' | 'user' | 'system' | 'security') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the request after response is sent
      if (req.user?.organizationId) {
        const action = `${req.method.toLowerCase()}_${req.route?.path || req.path}`;
        const success = res.statusCode < 400;
        
        auditService.log({
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

// Middleware to log specific actions
export const logAction = (action: string, resource: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'low') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.organizationId) {
      auditService.log({
        organizationId: req.user.organizationId,
        userId: req.user._id,
        action,
        resource,
        description: `${action} on ${resource}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        severity,
        category: resource as any,
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

// Alias for backward compatibility
export const auditLog = auditLogger;