"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const Payment_1 = __importDefault(require("../models/Payment"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const paymentPdfGenerator_1 = require("../utils/paymentPdfGenerator");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/:id/receipt-pdf', async (req, res) => {
    try {
        const paymentId = req.params.id;
        if (!paymentId || !paymentId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid payment ID format' });
        }
        const payment = await Payment_1.default.findById(paymentId)
            .populate('tenantId', 'name email phone unit rentAmount')
            .populate('propertyId', 'name address')
            .populate('organizationId', 'name')
            .lean();
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        if (req.user.role !== 'Super Admin' &&
            payment.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this payment' });
        }
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Payment_Receipt_${payment._id}.pdf"`);
        (0, paymentPdfGenerator_1.generatePaymentReceiptPdf)(payment, res, req.user?.language || 'en');
    }
    catch (error) {
        console.error('Payment receipt PDF generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate payment receipt PDF',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
router.get('/tenant/:tenantId/statement-pdf', async (req, res) => {
    try {
        const tenantId = req.params.tenantId;
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
        if (req.user.role !== 'Super Admin' &&
            tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this tenant' });
        }
        const payments = await Payment_1.default.find({
            tenantId: tenantId,
            organizationId: req.user.organizationId
        })
            .sort({ paymentDate: -1 })
            .lean();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Payment_Statement_${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
        (0, paymentPdfGenerator_1.generatePaymentStatementPdf)(tenant, payments, res, req.user?.language || 'en');
    }
    catch (error) {
        console.error('Payment statement PDF generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate payment statement PDF',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
exports.default = router;
