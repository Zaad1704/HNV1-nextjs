"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const reportController_1 = require("../controllers/reportController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/financial-summary', (0, rbac_1.authorize)('Admin', 'Manager'), reportController_1.getFinancialSummary);
router.get('/collection-sheet', reportController_1.getCollectionSheet);
router.get('/property-performance', reportController_1.getPropertyPerformance);
router.get('/tenant-report', reportController_1.getTenantReport);
router.get('/maintenance-report', reportController_1.getMaintenanceReport);
router.use((error, req, res, next) => {
    console.error('Report route error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});
exports.default = router;
