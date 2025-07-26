import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Subscription from '../models/Subscription';

interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // Check for token in Authorization header or query parameter
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.query.token) {
    token = req.query.token as string;
  }

  if (token) {
    try {
      
      const secret = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
      const decoded = jwt.verify(token, secret) as any;
      const foundUser = await User.findById(decoded.id).select("-password");
      
      // Populate subscription data if user has organization
      if (foundUser && foundUser.organizationId) {
        const subscription = await Subscription.findOne({ 
          organizationId: foundUser.organizationId 
        }).populate('planId');
        
        if (subscription) {
          (foundUser as any).subscription = subscription;
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

      // Allow Super Admin access regardless of verification/subscription
      if (req.user.role === 'Super Admin') {
        return next();
      }

      // Check email verification status (24-hour grace period)
      const isEmailVerificationExpired = !req.user.isEmailVerified && req.user.createdAt && 
        new Date() > new Date(req.user.createdAt.getTime() + 24 * 60 * 60 * 1000);

      // For regular users, check organization and subscription
      if (req.user.organizationId) {
        const subscription = await Subscription.findOne({ 
          organizationId: req.user.organizationId 
        });
        
        const isSubscriptionInactive = subscription && subscription.status !== 'active' && subscription.status !== 'trialing';
        
        // If either email verification expired OR subscription inactive, restrict to view-only
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
      } else {
        // Users without organization - still check email verification
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

    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
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

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user?.role} is not authorized to access this route`
      });
    }
    next();
  };
};