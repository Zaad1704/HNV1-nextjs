import { Request, Response, NextFunction } from 'express';

export const twoFactorAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip 2FA for now - implement later if needed
    next();
  } catch (error) {
    console.error('Two factor auth error:', error);
    next();
  }
};

export default twoFactorAuth;