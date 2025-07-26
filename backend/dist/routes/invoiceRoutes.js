"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const invoiceController_1 = require("../controllers/invoiceController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/search', invoiceController_1.searchInvoices);
router.get('/summary', invoiceController_1.getInvoiceSummary);
router.post('/bulk-actions', (0, rbac_1.authorize)('Admin', 'Manager'), invoiceController_1.bulkInvoiceActions);
router.get('/bulk-download', invoiceController_1.bulkDownloadInvoices);
router.post('/generate', (0, rbac_1.authorize)('Admin', 'Manager'), invoiceController_1.generateInvoices);
router.route('/')
    .get(invoiceController_1.getInvoices)
    .post(uploadMiddleware_1.default.fields([
    { name: 'attachments', maxCount: 5 }
]), (0, rbac_1.authorize)('Admin', 'Manager', 'Agent'), invoiceController_1.createInvoice);
router.route('/:id')
    .get(invoiceController_1.getInvoiceById)
    .put(uploadMiddleware_1.default.fields([
    { name: 'attachments', maxCount: 5 }
]), (0, rbac_1.authorize)('Admin', 'Manager', 'Agent'), async (req, res) => {
    try {
        const invoice = await require('../models/Invoice').default.findById(req.params.id);
        if (!invoice || invoice.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        const updatedInvoice = await require('../models/Invoice').default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('tenantId', 'name email').populate('propertyId', 'name address');
        res.status(200).json({ success: true, data: updatedInvoice });
    }
    catch (error) {
        console.error('Update invoice error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
})
    .delete((0, rbac_1.authorize)('Admin', 'Manager'), async (req, res) => {
    try {
        const invoice = await require('../models/Invoice').default.findById(req.params.id);
        if (!invoice || invoice.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        await invoice.deleteOne();
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        console.error('Delete invoice error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/:id/print', invoiceController_1.printInvoice);
router.get('/:id/pdf', invoiceController_1.printInvoice);
router.post('/:id/send-whatsapp', invoiceController_1.sendWhatsAppInvoice);
router.post('/:id/send-email', invoiceController_1.sendEmailInvoice);
router.use((error, req, res, next) => {
    console.error('Invoice route error:', error);
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
            message: 'Invoice number already exists'
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
