"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = void 0;
const auditLogger = (req, res, next) => {
    try {
        const logData = {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        };
        console.log('Audit Log:', JSON.stringify(logData));
        next();
    }
    catch (error) {
        console.error('Audit logger error:', error);
        next();
    }
};
exports.auditLogger = auditLogger;
exports.default = exports.auditLogger;
