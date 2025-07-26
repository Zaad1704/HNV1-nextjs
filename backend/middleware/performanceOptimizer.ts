import { Request, Response, NextFunction } from 'express';

export const performanceOptimizer = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Add performance headers
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} - ${duration}ms`);
    });
    
    next();
  } catch (error) {
    console.error('Performance optimizer error:', error);
    next();
  }
};

export default performanceOptimizer;