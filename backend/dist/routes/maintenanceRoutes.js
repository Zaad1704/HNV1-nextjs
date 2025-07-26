"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const maintenanceController_1 = require("../controllers/maintenanceController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/search', maintenanceController_1.searchMaintenanceRequests);
router.get('/summary', maintenanceController_1.getMaintenanceSummary);
router.post('/bulk-actions', (0, rbac_1.authorize)('Admin', 'Manager'), maintenanceController_1.bulkMaintenanceActions);
router.route('/')
    .get(maintenanceController_1.getMaintenanceRequests)
    .post(uploadMiddleware_1.default.fields([
    { name: 'images', maxCount: 5 },
    { name: 'attachments', maxCount: 3 }
]), (0, rbac_1.authorize)('Admin', 'Manager', 'Agent', 'Tenant'), maintenanceController_1.createMaintenanceRequest);
router.route('/:id')
    .get(maintenanceController_1.getMaintenanceRequestById)
    .put(uploadMiddleware_1.default.fields([
    { name: 'images', maxCount: 5 },
    { name: 'attachments', maxCount: 3 }
]), (0, rbac_1.authorize)('Admin', 'Manager', 'Agent'), maintenanceController_1.updateMaintenanceRequest)
    .delete((0, rbac_1.authorize)('Admin', 'Manager'), maintenanceController_1.deleteMaintenanceRequest);
router.use((error, req, res, next) => {
    console.error('Maintenance route error:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: Object.values(error.errors).map((err) => err.message)
        });
    }
    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});
exports.default = router;
