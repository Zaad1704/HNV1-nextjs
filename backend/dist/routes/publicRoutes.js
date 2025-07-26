"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publicController_1 = require("../controllers/publicController");
const router = (0, express_1.Router)();
router.get('/stats', publicController_1.getPublicStats);
router.get('/site-settings', publicController_1.getSiteSettings);
router.get('/plans', publicController_1.getPublicPlans);
router.get('/data', publicController_1.getPublicData);
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
