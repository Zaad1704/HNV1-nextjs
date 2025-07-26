import { Request, Response, NextFunction } from 'express';

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Basic input sanitization
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    next();
  } catch (error) {
    console.error('Input validation error:', error);
    next();
  }
};

const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return obj.trim();
  }
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
};

export default sanitizeInput;