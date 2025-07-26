"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/ping', (req, res) => {
    res.json({
        success: true,
        message: 'API is working',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl
    });
});
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});
exports.default = router;
