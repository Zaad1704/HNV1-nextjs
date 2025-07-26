import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user?: any;
}

// Safe wrapper for async controllers
export const safeAsync = (fn: (req: AuthRequest, res: Response) => Promise<any>) => {
  return async (req: AuthRequest, res: Response) => {
    try {
      await fn(req, res);
    } catch (error) {
      console.error('Controller error:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          message: 'Internal server error',
          data: [] 
        });
      }
    }
  };
};

// Safe data fetcher with fallbacks
export const safeDataFetch = async <T>(
  fetchFn: () => Promise<T>,
  fallback: T,
  errorMessage: string = 'Data fetch failed'
): Promise<T> => {
  try {
    const result = await fetchFn();
    return result || fallback;
  } catch (error) {
    console.error(errorMessage, error);
    return fallback;
  }
};