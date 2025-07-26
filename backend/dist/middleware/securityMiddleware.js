"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.sanitizeInput = exports.createRateLimit = exports.securityHeaders = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
};
exports.securityHeaders = securityHeaders;
const createRateLimit = (windowMs, max) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        message: 'Too many requests from this IP'
    });
};
exports.createRateLimit = createRateLimit;
const sanitizeInput = (req, res, next) => {
    next();
};
exports.sanitizeInput = sanitizeInput;
const requestLogger = (req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
};
exports.requestLogger = requestLogger;
