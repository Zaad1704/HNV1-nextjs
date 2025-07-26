import { Request, Response, NextFunction } from 'express';

export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  try {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    console.log('Audit Log:', JSON.stringify(logData));
    next();
  } catch (error) {
    console.error('Audit logger error:', error);
    next();
  }
};

export default auditLogger;