"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const propertyController_1 = require("../controllers/propertyController");
const unitController_1 = require("../controllers/unitController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const cascadeMiddleware_1 = require("../middleware/cascadeMiddleware");
const rbac_1 = require("../middleware/rbac");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/search', propertyController_1.searchProperties);
router.get('/summary', propertyController_1.getPropertySummary);
router.get('/validate/data-integrity', propertyController_1.validateDataIntegrity);
router.patch('/bulk-update', (0, rbac_1.authorize)('Admin', 'Manager'), propertyController_1.bulkUpdateProperties);
router.route('/')
    .get(propertyController_1.getProperties)
    .post(uploadMiddleware_1.default.single('image'), (0, rbac_1.authorize)('Admin', 'Manager'), propertyController_1.createProperty);
router.route('/:id')
    .get(propertyController_1.getPropertyById)
    .put(uploadMiddleware_1.default.single('image'), (0, rbac_1.authorize)('Admin', 'Manager', 'Agent'), propertyController_1.updateProperty)
    .delete((0, rbac_1.authorize)('Admin', 'Manager'), async (req, res) => {
    try {
        await (0, cascadeMiddleware_1.cascadePropertyChanges)(req.params.id, 'delete', req.user?.organizationId?.toString());
        (0, propertyController_1.deleteProperty)(req, res);
    }
    catch (error) {
        console.error('Cascade property deletion error:', error);
        res.status(500).json({ success: false, message: 'Failed to cascade property deletion' });
    }
});
router.patch('/:id/archive', (0, rbac_1.authorize)('Admin', 'Manager'), async (req, res) => {
    try {
        await (0, cascadeMiddleware_1.cascadePropertyChanges)(req.params.id, 'archive', req.user?.organizationId?.toString());
        (0, propertyController_1.deleteProperty)(req, res);
    }
    catch (error) {
        console.error('Archive property error:', error);
        res.status(500).json({ success: false, message: 'Failed to archive property' });
    }
});
router.patch('/:id/restore', (0, rbac_1.authorize)('Admin', 'Manager'), propertyController_1.restoreProperty);
router.put('/:id/regenerate-description', (0, rbac_1.authorize)('Admin', 'Manager', 'Agent'), propertyController_1.regenerateDescription);
router.get('/:propertyId/analytics', propertyController_1.getPropertyAnalytics);
router.get('/:propertyId/data-previews', propertyController_1.getPropertyDataPreviews);
router.get('/:propertyId/units', propertyController_1.getPropertyUnits);
router.get('/:propertyId/units/:unitNumber/data', propertyController_1.getUnitData);
router.get('/:propertyId/vacant-units', unitController_1.getVacantUnits);
router.use((error, req, res, next) => {
    console.error('Property route error:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: Object.values(error.errors).map((err) => err.message)
        });
    }
    if (error.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate entry detected'
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
