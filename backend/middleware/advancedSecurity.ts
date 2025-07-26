import { Request, Response, NextFunction } from 'express';

export const advancedSecurity = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Basic security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  } catch (error) {
    console.error('Advanced security middleware error:', error);
    next();
  }
};

export default advancedSecurity;