import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';

interface AuthRequest extends Request {
  user?: any;
}

export const healthCheck = async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };

    res.status(200).json({ success: true, data: health });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const dashboardHealth = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const organizationId = req.user.organizationId;
    const startTime = Date.now();

    // Test basic queries
    const [propertiesCount, tenantsCount, paymentsCount] = await Promise.allSettled([
      Property.countDocuments({ organizationId }).exec(),
      Tenant.countDocuments({ organizationId }).exec(),
      Payment.countDocuments({ organizationId }).exec()
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
        connected: mongoose.connection.readyState === 1,
        state: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      }
    };

    res.status(200).json({ success: true, data: health });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Dashboard health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};