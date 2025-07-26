"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRateLimit = exports.apiRateLimit = exports.authRateLimit = exports.advancedRateLimit = void 0;
const store = new Map();
const advancedRateLimit = (options) => {
    const { windowMs, max, keyGenerator, skipSuccessfulRequests, skipFailedRequests } = options;
    return (req, res, next) => {
        const key = keyGenerator ? keyGenerator(req) : req.ip;
        const now = Date.now();
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
        const shouldCount = () => {
            if (skipSuccessfulRequests && res.statusCode < 400)
                return false;
            if (skipFailedRequests && res.statusCode >= 400)
                return false;
            return true;
        };
        const originalEnd = res.end;
        res.end = function (...args) {
            if (shouldCount()) {
                record.count++;
                store.set(key, record);
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
exports.advancedRateLimit = advancedRateLimit;
exports.authRateLimit = (0, exports.advancedRateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    keyGenerator: (req) => `auth:${req.ip}:${req.body.email || 'unknown'}`
});
exports.apiRateLimit = (0, exports.advancedRateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    skipSuccessfulRequests: true
});
exports.uploadRateLimit = (0, exports.advancedRateLimit)({
    windowMs: 60 * 60 * 1000,
    max: 10,
    keyGenerator: (req) => `upload:${req.ip}`
});
