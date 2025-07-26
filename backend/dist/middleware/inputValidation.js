"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = void 0;
const sanitizeInput = (req, res, next) => {
    try {
        if (req.body) {
            req.body = sanitizeObject(req.body);
        }
        if (req.query) {
            req.query = sanitizeObject(req.query);
        }
        next();
    }
    catch (error) {
        console.error('Input validation error:', error);
        next();
    }
};
exports.sanitizeInput = sanitizeInput;
const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
        return obj.trim();
    }
    if (typeof obj === 'object' && obj !== null) {
        const sanitized = {};
        for (const key in obj) {
            sanitized[key] = sanitizeObject(obj[key]);
        }
        return sanitized;
    }
    return obj;
};
exports.default = exports.sanitizeInput;
