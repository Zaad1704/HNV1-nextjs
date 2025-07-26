"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'subscriptions routes working',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
