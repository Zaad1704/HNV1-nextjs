"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Property_1 = __importDefault(require("../models/Property"));
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/:propertyId/units/:unitNumber', async (req, res) => {
    try {
        const { propertyId, unitNumber } = req.params;
        const property = await Property_1.default.findOne({
            _id: propertyId,
            organizationId: req.user.organizationId
        });
        if (!property) {
            return res.status(404).json({ success: false, message: 'Property not found' });
        }
        const currentTenant = await Tenant_1.default.findOne({
            propertyId,
            unit: unitNumber,
            organizationId: req.user.organizationId,
            status: 'Active'
        });
        const allTenants = await Tenant_1.default.find({
            propertyId,
            unit: unitNumber,
            organizationId: req.user.organizationId
        });
        const payments = await Payment_1.default.find({
            propertyId,
            organizationId: req.user.organizationId
        }).populate('tenantId', 'name unit');
        const unitPayments = payments.filter(p => {
            const tenant = p.tenantId;
            return tenant?.unit === unitNumber;
        });
        const totalPayments = unitPayments.reduce((sum, p) => sum + p.amount, 0);
        const totalExpenses = 0;
        res.status(200).json({
            success: true,
            data: {
                property,
                unitNumber,
                currentTenant,
                totalTenants: allTenants.length,
                totalPayments,
                totalExpenses
            }
        });
    }
    catch (error) {
        console.error('Unit details error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/:propertyId/units/:unitNumber/tenants', async (req, res) => {
    try {
        const { propertyId, unitNumber } = req.params;
        const tenants = await Tenant_1.default.find({
            propertyId,
            unit: unitNumber,
            organizationId: req.user.organizationId
        }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: tenants });
    }
    catch (error) {
        console.error('Unit tenants error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/:propertyId/units/:unitNumber/payments', async (req, res) => {
    try {
        const { propertyId, unitNumber } = req.params;
        const payments = await Payment_1.default.find({
            propertyId,
            organizationId: req.user.organizationId
        }).populate('tenantId', 'name unit').sort({ paymentDate: -1 });
        const unitPayments = payments.filter(p => {
            const tenant = p.tenantId;
            return tenant?.unit === unitNumber;
        });
        res.status(200).json({ success: true, data: unitPayments });
    }
    catch (error) {
        console.error('Unit payments error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/:propertyId/units/:unitNumber/receipts', async (req, res) => {
    try {
        const { propertyId, unitNumber } = req.params;
        const Receipt = require('../models/Receipt').default;
        const receipts = await Receipt.find({
            propertyId,
            organizationId: req.user.organizationId
        }).sort({ paymentDate: -1 });
        const unitReceipts = receipts.filter((receipt) => receipt.unitNumber === unitNumber);
        res.status(200).json({ success: true, data: unitReceipts });
    }
    catch (error) {
        console.error('Unit receipts error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
