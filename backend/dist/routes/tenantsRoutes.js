"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const cascadeMiddleware_1 = require("../middleware/cascadeMiddleware");
const rbac_1 = require("../middleware/rbac");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const tenantsController_1 = require("../controllers/tenantsController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/search', tenantsController_1.searchTenants);
router.get('/summary', tenantsController_1.getTenantSummary);
router.post('/bulk-actions', (0, rbac_1.authorize)('Admin', 'Manager'), tenantsController_1.bulkTenantActions);
router.route('/')
    .get(tenantsController_1.getTenants)
    .post(uploadMiddleware_1.default.fields([
    { name: 'tenantImage', maxCount: 1 },
    { name: 'govtIdFront', maxCount: 1 },
    { name: 'govtIdBack', maxCount: 1 },
    { name: 'additionalAdultImage_0', maxCount: 1 },
    { name: 'additionalAdultImage_1', maxCount: 1 },
    { name: 'additionalAdultImage_2', maxCount: 1 },
    { name: 'additionalAdultGovtId_0', maxCount: 1 },
    { name: 'additionalAdultGovtId_1', maxCount: 1 },
    { name: 'additionalAdultGovtId_2', maxCount: 1 }
]), (0, rbac_1.authorize)('Admin', 'Manager', 'Agent'), tenantsController_1.createTenant);
router.route('/:id')
    .get(tenantsController_1.getTenantById)
    .put(uploadMiddleware_1.default.fields([
    { name: 'tenantImage', maxCount: 1 },
    { name: 'govtIdFront', maxCount: 1 },
    { name: 'govtIdBack', maxCount: 1 },
    { name: 'additionalAdultImage_0', maxCount: 1 },
    { name: 'additionalAdultImage_1', maxCount: 1 },
    { name: 'additionalAdultImage_2', maxCount: 1 },
    { name: 'additionalAdultGovtId_0', maxCount: 1 },
    { name: 'additionalAdultGovtId_1', maxCount: 1 },
    { name: 'additionalAdultGovtId_2', maxCount: 1 }
]), (0, rbac_1.authorize)('Admin', 'Manager', 'Agent'), tenantsController_1.updateTenant)
    .delete((0, rbac_1.authorize)('Admin', 'Manager'), async (req, res) => {
    try {
        await (0, cascadeMiddleware_1.cascadeTenantChanges)(req.params.id, 'delete', req.user.organizationId);
        (0, tenantsController_1.deleteTenant)(req, res);
    }
    catch (error) {
        console.error('Cascade tenant deletion error:', error);
        res.status(500).json({ success: false, message: 'Failed to cascade tenant deletion' });
    }
});
router.patch('/:id/archive', (0, rbac_1.authorize)('Admin', 'Manager'), tenantsController_1.archiveTenant);
router.patch('/:id/restore', (0, rbac_1.authorize)('Admin', 'Manager'), tenantsController_1.restoreTenant);
router.get('/:tenantId/data-previews', tenantsController_1.getTenantDataPreviews);
router.get('/:tenantId/stats', tenantsController_1.getTenantStats);
router.get('/:tenantId/analytics', tenantsController_1.getTenantAnalytics);
router.post('/:id/download-pdf', tenantsController_1.downloadTenantPDF);
router.post('/:id/personal-details-pdf', tenantsController_1.downloadPersonalDetailsPDF);
router.post('/:id/download-zip', tenantsController_1.downloadTenantDataZip);
router.use((error, req, res, next) => {
    console.error('Tenant route error:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: Object.values(error.errors).map((err) => err.message)
        });
    }
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        let message = 'Duplicate entry detected';
        if (field === 'email') {
            message = 'A tenant with this email already exists';
        }
        else if (field.includes('propertyId') && field.includes('unit')) {
            message = 'This unit is already occupied';
        }
        return res.status(400).json({
            success: false,
            message
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
