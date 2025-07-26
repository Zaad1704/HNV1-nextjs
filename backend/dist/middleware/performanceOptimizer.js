"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceOptimizer = void 0;
const performanceOptimizer = (req, res, next) => {
    try {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`${req.method} ${req.originalUrl} - ${duration}ms`);
        });
        next();
    }
    catch (error) {
        console.error('Performance optimizer error:', error);
        next();
    }
};
exports.performanceOptimizer = performanceOptimizer;
exports.default = exports.performanceOptimizer;
