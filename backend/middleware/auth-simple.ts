import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.user = {
    _id: 'user123',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    organization: 'org123'
  } as any;
  next();
};

export const requireOrganization = (req: Request, res: Response, next: NextFunction) => {
  req.user = {
    _id: 'user123',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    organization: 'org123'
  } as any;
  next();
};