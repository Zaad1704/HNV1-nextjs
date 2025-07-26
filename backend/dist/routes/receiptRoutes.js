"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const uploadMiddleware_1 = __importDefault(require("../middleware/uploadMiddleware"));
const receiptController_1 = require("../controllers/receiptController");
const Receipt_1 = __importDefault(require("../models/Receipt"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const t = (key, language = 'en') => {
    return key;
};
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/search', receiptController_1.searchReceipts);
router.get('/summary', receiptController_1.getReceiptSummary);
router.post('/bulk-actions', (0, rbac_1.authorize)('Admin', 'Manager'), receiptController_1.bulkReceiptActions);
router.route('/')
    .get(receiptController_1.getReceipts)
    .post(uploadMiddleware_1.default.fields([
    { name: 'attachments', maxCount: 3 }
]), (0, rbac_1.authorize)('Admin', 'Manager', 'Agent'), receiptController_1.createReceipt);
router.get('/payment/:paymentId', receiptController_1.generatePaymentReceipt);
router.post('/bulk-pdf', async (req, res) => {
    try {
        const { receiptIds } = req.body;
        const receipts = await Receipt_1.default.find({
            _id: { $in: receiptIds },
            organizationId: req.user.organizationId
        }).populate('organizationId', 'name');
        const doc = new pdfkit_1.default({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=bulk-receipts.pdf');
        doc.pipe(res);
        doc.rect(0, 0, 612, 792).fill('#f0f8ff');
        const addWatermark = (y) => {
            doc.save();
            doc.opacity(0.15);
            doc.fontSize(40).font('Helvetica-Bold').fillColor('#2563eb')
                .text('HNV', 250, y, { align: 'center' });
            doc.fontSize(12).text('Property Management', 250, y + 45, { align: 'center' });
            doc.restore();
        };
        let currentY = 20;
        const pageHeight = 792;
        const receiptHeight = 180;
        receipts.forEach((receipt, index) => {
            if (currentY + receiptHeight > pageHeight - 100) {
                doc.addPage();
                doc.rect(0, 0, 612, 792).fill('#f0f8ff');
                currentY = 20;
            }
            const orgName = receipt.organizationId?.name || 'Property Management';
            const userLang = req.user?.language || 'en';
            addWatermark(currentY + 60);
            doc.rect(30, currentY, 552, receiptHeight).fill('white').strokeColor('#2563eb').lineWidth(2).stroke();
            const headerHeight = Math.min(50, receiptHeight * 0.3);
            doc.rect(30, currentY, 552, headerHeight).fill('#2563eb');
            const maxOrgWidth = 500;
            doc.font('Helvetica-Bold').fontSize(18).fillColor('white')
                .text(orgName, 50, currentY + 10, { width: maxOrgWidth, align: 'center' });
            doc.fontSize(12).text(t('receipt.paymentReceipt', userLang), 50, currentY + 30, { width: maxOrgWidth, align: 'center' });
            const contentY = currentY + headerHeight + 10;
            doc.fillColor('black').font('Helvetica');
            doc.fontSize(10).font('Helvetica-Bold')
                .text(t('receipt.information', userLang), 50, contentY);
            doc.fontSize(9).font('Helvetica')
                .text(`${t('receipt.number', userLang)}: ${receipt.receiptNumber}`, 50, contentY + 15)
                .text(`${t('common.date', userLang)}: ${receipt.paymentDate.toLocaleDateString()}`, 50, contentY + 28);
            if (receipt.handwrittenReceiptNumber) {
                doc.text(`${t('receipt.manualNumber', userLang)}: ${receipt.handwrittenReceiptNumber}`, 50, contentY + 41);
            }
            doc.fontSize(10).font('Helvetica-Bold')
                .text(t('tenant.details', userLang), 200, contentY);
            doc.fontSize(9).font('Helvetica')
                .text(`${t('common.name', userLang)}: ${receipt.tenantName}`, 200, contentY + 15)
                .text(`${t('property.property', userLang)}: ${receipt.propertyName}`, 200, contentY + 28)
                .text(`${t('property.unit', userLang)}: ${receipt.unitNumber}`, 200, contentY + 41)
                .text(`${t('payment.month', userLang)}: ${receipt.rentMonth || 'N/A'}`, 200, contentY + 54)
                .text(`${t('payment.method', userLang)}: ${receipt.paymentMethod}`, 200, contentY + 67);
            doc.rect(400, contentY, 150, 80).fill('#dcfce7').stroke('#16a34a');
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#15803d')
                .text(t('payment.amountPaid', userLang), 420, contentY + 10);
            doc.fontSize(18).font('Helvetica-Bold')
                .text(`$${receipt.amount.toFixed(2)}`, 420, contentY + 30);
            doc.fontSize(8).font('Helvetica').fillColor('#166534')
                .text(`${t('common.status', userLang)}: ${t('payment.paid', userLang)}`, 420, contentY + 55)
                .text(t('common.verified', userLang), 420, contentY + 65);
            const currentYear = new Date().getFullYear();
            doc.fillColor('#2563eb').fontSize(8)
                .text(t('common.poweredBy', userLang), 50, currentY + receiptHeight - 25, { width: 500, align: 'center' })
                .text(`© ${currentYear} HNV Property Management Solutions. ${t('common.allRightsReserved', userLang)}.`, 50, currentY + receiptHeight - 15, { width: 500, align: 'center' });
            currentY += receiptHeight + 20;
        });
        addWatermark(pageHeight - 200);
        const userLang = req.user?.language || 'en';
        doc.fontSize(8).fillColor('#64748b')
            .text(t('receipt.confidentialNotice', userLang), 50, pageHeight - 40, { width: 500, align: 'center' });
        doc.end();
    }
    catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate PDF' });
    }
});
router.post('/thermal-print', async (req, res) => {
    try {
        const { receiptIds } = req.body;
        const receipts = await Receipt_1.default.find({
            _id: { $in: receiptIds },
            organizationId: req.user.organizationId
        }).populate('organizationId', 'name');
        const userLang = req.user?.language || 'en';
        const thermalHTML = receipts.map(receipt => {
            const orgName = receipt.organizationId?.name || 'Property Management';
            return `
        <div class="receipt" style="width: 80mm; font-family: monospace; font-size: 12px; margin-bottom: 20px; page-break-after: always;">
          <div style="text-align: center; font-weight: bold; margin-bottom: 5px; font-size: 14px;">
            ${orgName}
          </div>
          <div style="text-align: center; font-weight: bold; margin-bottom: 10px;">
            ${t('receipt.paymentReceipt', userLang)}
          </div>
          <div style="border-bottom: 1px dashed #000; margin-bottom: 10px;"></div>
          <div>${t('receipt.number', userLang)}: ${receipt.receiptNumber}</div>
          ${receipt.handwrittenReceiptNumber ? `<div>${t('receipt.manualNumber', userLang)}: ${receipt.handwrittenReceiptNumber}</div>` : ''}
          <div>${t('common.date', userLang)}: ${receipt.paymentDate.toLocaleDateString()}</div>
          <div style="border-bottom: 1px dashed #000; margin: 10px 0;"></div>
          <div>${t('tenant.tenant', userLang)}: ${receipt.tenantName}</div>
          <div>${t('property.property', userLang)}: ${receipt.propertyName}</div>
          <div>${t('property.unit', userLang)}: ${receipt.unitNumber}</div>
          <div style="border-bottom: 1px dashed #000; margin: 10px 0;"></div>
          <div>${t('payment.month', userLang)}: ${receipt.rentMonth || 'N/A'}</div>
          <div>${t('payment.method', userLang)}: ${receipt.paymentMethod}</div>
          <div style="font-weight: bold; font-size: 14px; margin-top: 10px;">
            ${t('payment.amount', userLang)}: $${receipt.amount.toFixed(2)}
          </div>
          <div style="border-bottom: 1px dashed #000; margin: 10px 0;"></div>
          <div style="text-align: center; font-size: 10px;">
            ${t('receipt.thankYou', userLang)}
          </div>
          <div style="text-align: center; font-size: 8px; margin-top: 5px;">
            ${t('common.poweredBy', userLang)}
          </div>
        </div>
      `;
        }).join('');
        const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Thermal Print Receipts</title>
        <style>
          @media print {
            body { margin: 0; }
            .receipt { page-break-after: always; }
          }
        </style>
      </head>
      <body>${thermalHTML}</body>
      </html>
    `;
        res.setHeader('Content-Type', 'text/html');
        res.send(fullHTML);
    }
    catch (error) {
        console.error('Thermal print error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate print format' });
    }
});
router.route('/:id')
    .get(async (req, res) => {
    try {
        const receipt = await Receipt_1.default.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId
        })
            .populate('tenantId', 'name email unit')
            .populate('propertyId', 'name address')
            .populate('paymentId', 'amount status')
            .populate('issuedBy', 'name email');
        if (!receipt) {
            return res.status(404).json({ success: false, message: 'Receipt not found' });
        }
        res.status(200).json({ success: true, data: receipt });
    }
    catch (error) {
        console.error('Get receipt error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
})
    .put((0, rbac_1.authorize)('Admin', 'Manager', 'Agent'), async (req, res) => {
    try {
        const receipt = await Receipt_1.default.findOneAndUpdate({ _id: req.params.id, organizationId: req.user.organizationId }, req.body, { new: true, runValidators: true }).populate('tenantId', 'name email').populate('propertyId', 'name');
        if (!receipt) {
            return res.status(404).json({ success: false, message: 'Receipt not found' });
        }
        res.status(200).json({ success: true, data: receipt });
    }
    catch (error) {
        console.error('Update receipt error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
})
    .delete((0, rbac_1.authorize)('Admin', 'Manager'), async (req, res) => {
    try {
        const receipt = await Receipt_1.default.findOneAndDelete({
            _id: req.params.id,
            organizationId: req.user.organizationId
        });
        if (!receipt) {
            return res.status(404).json({ success: false, message: 'Receipt not found' });
        }
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        console.error('Delete receipt error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/:id/pdf', async (req, res) => {
    try {
        const receipt = await Receipt_1.default.findOne({
            _id: req.params.id,
            organizationId: req.user.organizationId
        }).populate('organizationId', 'name');
        if (!receipt) {
            return res.status(404).json({ success: false, message: 'Receipt not found' });
        }
        const doc = new pdfkit_1.default({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receipt-${receipt.receiptNumber}.pdf`);
        doc.pipe(res);
        doc.rect(0, 0, 612, 792).fill('#f0f8ff');
        const orgName = receipt.organizationId?.name || 'Property Management';
        const userLang = req.user?.language || 'en';
        doc.rect(30, 30, 552, 60).fill('#2563eb');
        doc.fontSize(18).font('Helvetica-Bold').fillColor('white')
            .text(orgName, 50, 50, { width: 500, align: 'center' });
        doc.fontSize(14).text(t('receipt.paymentReceipt', userLang), 50, 70, { width: 500, align: 'center' });
        doc.fillColor('black').fontSize(12).font('Helvetica')
            .text(`${t('receipt.number', userLang)}: ${receipt.receiptNumber}`, 50, 120)
            .text(`${t('common.date', userLang)}: ${receipt.paymentDate.toLocaleDateString()}`, 50, 140)
            .text(`${t('common.name', userLang)}: ${receipt.tenantName}`, 50, 180)
            .text(`${t('property.property', userLang)}: ${receipt.propertyName}`, 50, 200)
            .text(`${t('property.unit', userLang)}: ${receipt.unitNumber}`, 50, 220)
            .text(`${t('payment.amount', userLang)}: $${receipt.amount.toFixed(2)}`, 50, 260);
        const currentYear = new Date().getFullYear();
        doc.fontSize(10).fillColor('#64748b')
            .text(t('common.poweredBy', userLang), 50, 700, { width: 500, align: 'center' })
            .text(`© ${currentYear} HNV Property Management Solutions. ${t('common.allRightsReserved', userLang)}.`, 50, 720, { width: 500, align: 'center' });
        doc.end();
    }
    catch (error) {
        console.error('Single receipt PDF error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate PDF' });
    }
});
router.use((error, req, res, next) => {
    console.error('Receipt route error:', error);
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
            message: 'Receipt number already exists'
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
