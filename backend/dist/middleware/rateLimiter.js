"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const requests = new Map();
const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    return (req, res, next) => {
        try {
            const key = req.ip || 'unknown';
            const now = Date.now();
            const requestData = requests.get(key);
            if (!requestData || now > requestData.resetTime) {
                requests.set(key, { count: 1, resetTime: now + windowMs });
                return next();
            }
            if (requestData.count >= maxRequests) {
                return res.status(429).json({
                    success: false,
                    message: 'Too many requests'
                });
            }
            requestData.count++;
            next();
        }
        catch (error) {
            console.error('Rate limiter error:', error);
            next();
        }
    };
};
exports.rateLimiter = rateLimiter;
exports.default = exports.rateLimiter;
