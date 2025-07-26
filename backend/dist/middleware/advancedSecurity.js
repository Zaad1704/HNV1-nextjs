"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedSecurity = void 0;
const advancedSecurity = (req, res, next) => {
    try {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    }
    catch (error) {
        console.error('Advanced security middleware error:', error);
        next();
    }
};
exports.advancedSecurity = advancedSecurity;
exports.default = exports.advancedSecurity;
