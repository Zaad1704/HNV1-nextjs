import { Request, Response, NextFunction } from 'express';
import subscriptionService from '../services/subscriptionService';

interface AuthRequest extends Request {
  user?: any;
  subscription?: any;
}

// Check if subscription is active
export const checkSubscriptionStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({
        success: false,
        message: 'Organization ID required'
      });
    }

    const statusCheck = await subscriptionService.checkSubscriptionStatus(req.user.organizationId);
    
    if (!statusCheck.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Subscription required',
        reason: statusCheck.reason,
        redirectTo: '/billing'
      });
    }

    // Add subscription info to request
    req.subscription = statusCheck.subscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking subscription status'
    });
  }
};

// Check usage limits for specific actions
export const checkUsageLimit = (limitType: 'properties' | 'tenants' | 'users' | 'exports' | 'storage') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.organizationId) {
        return res.status(401).json({
          success: false,
          message: 'Organization ID required'
        });
      }

      const usageCheck = await subscriptionService.checkUsageLimit(req.user.organizationId, limitType);
      
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
    } catch (error) {
      console.error('Usage limit check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking usage limits'
      });
    }
  };
};

// Update usage after successful action
export const updateUsageCount = (limitType: 'properties' | 'tenants' | 'users' | 'exports' | 'storage', increment: number = 1) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user?.organizationId) {
        await subscriptionService.updateUsage(req.user.organizationId, limitType, increment);
      }
      next();
    } catch (error) {
      console.error('Usage update error:', error);
      next(); // Don't block the request if usage update fails
    }
  };
};