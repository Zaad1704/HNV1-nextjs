import { Request, Response, NextFunction } from 'express';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string;
  condition?: (req: Request) => boolean;
}

// Simple in-memory cache
const cache = new Map<string, { data: any; expires: number }>();

export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttl = 300, condition } = options; // Default 5 minutes

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip cache if condition is not met
    if (condition && !condition(req)) {
      return next();
    }

    const cacheKey = options.key || `${req.method}:${req.originalUrl}`;
    const cached = cache.get(cacheKey);

    // Return cached response if valid
    if (cached && cached.expires > Date.now()) {
      res.set('X-Cache', 'HIT');
      return res.json(cached.data);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data: any) {
      // Cache successful responses only
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, {
          data,
          expires: Date.now() + (ttl * 1000)
        });
      }
      
      res.set('X-Cache', 'MISS');
      return originalJson.call(this, data);
    };

    next();
  };
};

// Clear cache utility
export const clearCache = (pattern?: string) => {
  if (pattern) {
    const regex = new RegExp(pattern);
    for (const key of cache.keys()) {
      if (regex.test(key)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

// Cache stats
export const getCacheStats = () => {
  const now = Date.now();
  let active = 0;
  let expired = 0;

  for (const [key, value] of cache.entries()) {
    if (value.expires > now) {
      active++;
    } else {
      expired++;
      cache.delete(key); // Clean up expired entries
    }
  }

  return {
    total: cache.size,
    active,
    expired,
    memoryUsage: JSON.stringify([...cache.entries()]).length
  };
};