import { Request, Response, NextFunction } from 'express';

const requests = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = req.ip || 'unknown';
      const now = Date.now();
      
      const requestData = requests.get(key);
      
      if (!requestData || now > requestData.resetTime) {
        requests.set(key, { count: 1, resetTime: now + windowMs });
        return next();
      }
      
      if (requestData.count >= maxRequests) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests'
        });
      }
      
      requestData.count++;
      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next();
    }
  };
};

export default rateLimiter;