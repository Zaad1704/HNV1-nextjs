import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
};

export const createRateLimit = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests from this IP'
  });
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic input sanitization
  next();
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
};
