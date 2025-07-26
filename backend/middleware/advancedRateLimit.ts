import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Simple in-memory store
const store = new Map<string, { count: number; resetTime: number }>();

export const advancedRateLimit = (options: RateLimitOptions) => {
  const { windowMs, max, keyGenerator, skipSuccessfulRequests, skipFailedRequests } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator ? keyGenerator(req) : req.ip;
    const now = Date.now();
    
    // Clean expired entries
    for (const [k, v] of store.entries()) {
      if (v.resetTime < now) {
        store.delete(k);
      }
    }

    let record = store.get(key);
    if (!record || record.resetTime < now) {
      record = { count: 0, resetTime: now + windowMs };
      store.set(key, record);
    }

    // Check if request should be counted
    const shouldCount = () => {
      if (skipSuccessfulRequests && res.statusCode < 400) return false;
      if (skipFailedRequests && res.statusCode >= 400) return false;
      return true;
    };

    // Override res.end to count after response
    const originalEnd = res.end;
    res.end = function(...args: any[]) {
      if (shouldCount()) {
        record!.count++;
        store.set(key, record!);
      }
      return originalEnd.apply(this, args);
    };

    if (record.count >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    record.count++;
    store.set(key, record);

    res.set({
      'X-RateLimit-Limit': max.toString(),
      'X-RateLimit-Remaining': Math.max(0, max - record.count).toString(),
      'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
    });

    next();
  };
};

// Specific rate limiters
export const authRateLimit = advancedRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  keyGenerator: (req) => `auth:${req.ip}:${req.body.email || 'unknown'}`
});

export const apiRateLimit = advancedRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skipSuccessfulRequests: true
});

export const uploadRateLimit = advancedRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  keyGenerator: (req) => `upload:${req.ip}`
});