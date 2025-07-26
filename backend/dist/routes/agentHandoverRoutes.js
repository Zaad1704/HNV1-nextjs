"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/', async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: [],
            message: 'Agent handover feature coming soon'
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post('/', async (req, res) => {
    try {
        res.status(201).json({
            success: true,
            data: {},
            message: 'Agent handover submitted successfully'
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
