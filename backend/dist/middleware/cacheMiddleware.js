"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCacheStats = exports.clearCache = exports.cacheMiddleware = void 0;
const cache = new Map();
const cacheMiddleware = (options = {}) => {
    const { ttl = 300, condition } = options;
    return (req, res, next) => {
        if (condition && !condition(req)) {
            return next();
        }
        const cacheKey = options.key || `${req.method}:${req.originalUrl}`;
        const cached = cache.get(cacheKey);
        if (cached && cached.expires > Date.now()) {
            res.set('X-Cache', 'HIT');
            return res.json(cached.data);
        }
        const originalJson = res.json;
        res.json = function (data) {
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
exports.cacheMiddleware = cacheMiddleware;
const clearCache = (pattern) => {
    if (pattern) {
        const regex = new RegExp(pattern);
        for (const key of cache.keys()) {
            if (regex.test(key)) {
                cache.delete(key);
            }
        }
    }
    else {
        cache.clear();
    }
};
exports.clearCache = clearCache;
const getCacheStats = () => {
    const now = Date.now();
    let active = 0;
    let expired = 0;
    for (const [key, value] of cache.entries()) {
        if (value.expires > now) {
            active++;
        }
        else {
            expired++;
            cache.delete(key);
        }
    }
    return {
        total: cache.size,
        active,
        expired,
        memoryUsage: JSON.stringify([...cache.entries()]).length
    };
};
exports.getCacheStats = getCacheStats;
