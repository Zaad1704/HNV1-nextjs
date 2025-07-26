import { Request, Response, NextFunction } from 'express';

export const orgContext = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Add organization context to request
    const user = (req as any).user;
    if (user && user.organizationId) {
      (req as any).organizationId = user.organizationId;
    }
    next();
  } catch (error) {
    console.error('Organization context error:', error);
    next();
  }
};

export default orgContext;