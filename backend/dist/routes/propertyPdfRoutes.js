"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Property_1 = __importDefault(require("../models/Property"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Expense_1 = __importDefault(require("../models/Expense"));
const propertyPdfGenerator_1 = require("../utils/propertyPdfGenerator");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/:id/details-pdf', async (req, res) => {
    try {
        const propertyId = req.params.id;
        if (!propertyId || !propertyId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid property ID format' });
        }
        const property = await Property_1.default.findById(propertyId)
            .populate('createdBy', 'name')
            .populate('managedByAgentId', 'name')
            .lean();
        if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        const tenants = await Tenant_1.default.find({
            propertyId: propertyId,
            organizationId: req.user.organizationId
        }).lean();
        const recentPayments = await Payment_1.default.find({
            propertyId: propertyId,
            organizationId: req.user.organizationId
        })
            .populate('tenantId', 'name')
            .sort({ paymentDate: -1 })
            .limit(10)
            .lean();
        const propertyData = {
            ...property,
            tenants,
            recentPayments
        };
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Property_Details_${property.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
        (0, propertyPdfGenerator_1.generatePropertyDetailsPdf)(propertyData, res, req.user?.language || 'en');
    }
    catch (error) {
        console.error('Property PDF generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate property PDF',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
router.get('/:id/financial-pdf', async (req, res) => {
    try {
        const propertyId = req.params.id;
        if (!propertyId || !propertyId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid property ID format' });
        }
        const property = await Property_1.default.findById(propertyId).lean();
        if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        const tenants = await Tenant_1.default.find({
            propertyId: propertyId,
            organizationId: req.user.organizationId,
            status: 'Active'
        }).lean();
        const payments = await Payment_1.default.find({
            propertyId: propertyId,
            organizationId: req.user.organizationId,
            paymentDate: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
        }).lean();
        const expenses = await Expense_1.default.find({
            propertyId: propertyId,
            organizationId: req.user.organizationId,
            date: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
        }).lean();
        const propertyData = {
            ...property,
            tenants,
            payments,
            expenses
        };
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Property_Financial_${property.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
        (0, propertyPdfGenerator_1.generatePropertyFinancialSummary)(propertyData, res, req.user?.language || 'en');
    }
    catch (error) {
        console.error('Property financial PDF generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate property financial PDF',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.default = router;
