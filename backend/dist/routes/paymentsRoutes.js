"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const auditMiddleware_1 = require("../middleware/auditMiddleware");
const paymentsController_1 = require("../controllers/paymentsController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/search', paymentsController_1.searchPayments);
router.get('/summary', paymentsController_1.getPaymentSummary);
router.get('/analytics', paymentsController_1.getPaymentAnalytics);
router.post('/bulk-actions', (0, rbac_1.authorize)('Admin', 'Manager'), paymentsController_1.bulkPaymentActions);
router.get('/property/:propertyId/month/:month', async (req, res) => {
    try {
        const { propertyId, month } = req.params;
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        if (req.user.role === 'Agent') {
            const Property = require('../models/Property').default;
            const property = await Property.findById(propertyId);
            if (!property || property.managedByAgentId?.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: 'Agents can only view payments from properties they manage' });
            }
        }
        const Payment = require('../models/Payment').default;
        const payments = await Payment.find({
            propertyId,
            rentMonth: month,
            organizationId: req.user.organizationId
        })
            .populate('tenantId', 'name unit email')
            .populate('propertyId', 'name address')
            .sort({ paymentDate: -1 });
        res.status(200).json({ success: true, data: payments });
    }
    catch (error) {
        console.error('Get payments by property/month error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payments',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});
router.route('/')
    .get(paymentsController_1.getPayments)
    .post((0, rbac_1.authorize)('Admin', 'Manager', 'Agent'), (0, auditMiddleware_1.auditLog)('payment'), paymentsController_1.createPayment);
router.route('/:id')
    .get(paymentsController_1.getPaymentById)
    .put((0, rbac_1.authorize)('Admin', 'Manager', 'Agent'), (0, auditMiddleware_1.auditLog)('payment'), paymentsController_1.updatePayment)
    .delete((0, rbac_1.authorize)('Admin', 'Manager'), (0, auditMiddleware_1.auditLog)('payment'), paymentsController_1.deletePayment);
router.get('/:id/receipt', paymentsController_1.getPaymentReceipt);
router.get('/:id/receipt-pdf', async (req, res) => {
    try {
        if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid payment ID format' });
        }
        if (!req.user?.organizationId && req.user?.role !== 'Super Admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const Payment = require('../models/Payment').default;
        const payment = await Payment.findById(req.params.id)
            .populate('tenantId', 'name email phone unit rentAmount imageUrl tenantImage')
            .populate('propertyId', 'name address type numberOfUnits imageUrl')
            .populate('organizationId', 'name')
            .lean();
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        if (req.user.role !== 'Super Admin' &&
            payment.organizationId.toString() !== req.user.organizationId?.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to access this payment receipt' });
        }
        if (req.user.role === 'Agent') {
            const Property = require('../models/Property').default;
            const property = await Property.findById(payment.propertyId);
            if (!property || property.managedByAgentId?.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: 'Agents can only generate receipts for payments from properties they manage' });
            }
        }
        try {
            const { generateColorfulPdfReceipt } = require('../utils/receiptGenerator');
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Payment_Receipt_${req.params.id}.pdf"`);
            generateColorfulPdfReceipt(payment, res);
        }
        catch (pdfError) {
            console.error('PDF generation error:', pdfError);
            res.status(500).json({
                success: false,
                message: 'Failed to generate PDF receipt. PDF generator may not be available.',
                error: process.env.NODE_ENV === 'development' ? pdfError.message : undefined
            });
        }
    }
    catch (error) {
        console.error('PDF receipt generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF receipt',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});
router.post('/:id/send-receipt', paymentsController_1.sendPaymentReceipt);
router.use((error, req, res, next) => {
    console.error('Payment route error:', error);
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
        if (field === 'receiptNumber') {
            message = 'A payment with this receipt number already exists';
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
