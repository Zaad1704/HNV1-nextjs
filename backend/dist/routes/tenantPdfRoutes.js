"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const tenantPdfGenerator_1 = require("../utils/tenantPdfGenerator");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/:id/details-pdf', async (req, res) => {
    try {
        const tenantId = req.params.id;
        if (!tenantId || !tenantId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid tenant ID format' });
        }
        const tenant = await Tenant_1.default.findById(tenantId)
            .populate('propertyId', 'name address')
            .populate('organizationId', 'name')
            .lean();
        if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }
        const payments = await Payment_1.default.find({
            tenantId: tenantId,
            organizationId: req.user.organizationId
        })
            .sort({ paymentDate: -1 })
            .limit(20)
            .lean();
        const tenantData = {
            ...tenant,
            payments
        };
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Tenant_Details_${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
        (0, tenantPdfGenerator_1.generateTenantDetailsPdf)(tenantData, res, req.user?.language || 'en');
    }
    catch (error) {
        console.error('Tenant PDF generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate tenant PDF',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
router.get('/:id/lease-pdf', async (req, res) => {
    try {
        const tenantId = req.params.id;
        if (!tenantId || !tenantId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid tenant ID format' });
        }
        const tenant = await Tenant_1.default.findById(tenantId)
            .populate('propertyId', 'name address')
            .populate('organizationId', 'name')
            .lean();
        if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Lease_Agreement_${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
        (0, tenantPdfGenerator_1.generateTenantLeaseAgreement)(tenant, res, req.user?.language || 'en');
    }
    catch (error) {
        console.error('Tenant lease PDF generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate tenant lease PDF',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
router.get('/:id/complete-package', async (req, res) => {
    try {
        const tenantId = req.params.id;
        if (!tenantId || !tenantId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid tenant ID format' });
        }
        const tenant = await Tenant_1.default.findById(tenantId)
            .populate('propertyId', 'name address')
            .populate('organizationId', 'name')
            .lean();
        if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }
        const payments = await Payment_1.default.find({
            tenantId: tenantId,
            organizationId: req.user.organizationId
        })
            .sort({ paymentDate: -1 })
            .lean();
        const tenantData = {
            ...tenant,
            payments
        };
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Complete_Tenant_Package_${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
        await (0, tenantPdfGenerator_1.generateComprehensiveTenantPdf)(tenantData, res, req.user?.language || 'en');
    }
    catch (error) {
        console.error('Tenant package generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate tenant package',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
router.get('/:id/personal-details-pdf', async (req, res) => {
    try {
        const tenantId = req.params.id;
        if (!tenantId || !tenantId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid tenant ID format' });
        }
        const tenant = await Tenant_1.default.findById(tenantId)
            .populate('propertyId', 'name address')
            .populate('organizationId', 'name')
            .lean();
        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }
        if (tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Personal_Details_${(tenant.name || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.on('error', (error) => {
            console.error('Response stream error:', error);
        });
        (0, tenantPdfGenerator_1.generatePersonalDetailsPdf)(tenant, res, req.user?.language || 'en');
    }
    catch (error) {
        console.error('Personal details PDF generation error:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Failed to generate personal details PDF',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
});
exports.default = router;
