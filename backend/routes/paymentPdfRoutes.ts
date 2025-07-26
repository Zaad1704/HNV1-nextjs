import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import Payment from '../models/Payment';
import Tenant from '../models/Tenant';
import { generatePaymentReceiptPdf, generatePaymentStatementPdf } from '../utils/paymentPdfGenerator';

const router = Router();

router.use(protect);

// Generate payment receipt PDF
router.get('/:id/receipt-pdf', async (req: any, res) => {
  try {
    const paymentId = req.params.id;
    
    // Validate payment ID format
    if (!paymentId || !paymentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findById(paymentId)
      .populate('tenantId', 'name email phone unit rentAmount')
      .populate('propertyId', 'name address')
      .populate('organizationId', 'name')
      .lean();

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Check if user has access to this payment (unless Super Admin)
    if (req.user.role !== 'Super Admin' && 
        payment.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this payment' });
    }

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Payment_Receipt_${payment._id}.pdf"`);
    
    // Generate PDF and pipe to response
    generatePaymentReceiptPdf(payment, res, req.user?.language || 'en');
    
  } catch (error: any) {
    console.error('Payment receipt PDF generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate payment receipt PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Generate payment statement PDF for a tenant
router.get('/tenant/:tenantId/statement-pdf', async (req: any, res) => {
  try {
    const tenantId = req.params.tenantId;
    
    // Validate tenant ID format
    if (!tenantId || !tenantId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid tenant ID format' });
    }

    const tenant = await Tenant.findById(tenantId)
      .populate('propertyId', 'name address')
      .populate('organizationId', 'name')
      .lean();

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Check if user has access to this tenant (unless Super Admin)
    if (req.user.role !== 'Super Admin' && 
        tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this tenant' });
    }

    // Get payment history for this tenant
    const payments = await Payment.find({ 
      tenantId: tenantId, 
      organizationId: req.user.organizationId 
    })
    .sort({ paymentDate: -1 })
    .lean();

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Payment_Statement_${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
    
    // Generate PDF and pipe to response
    generatePaymentStatementPdf(tenant, payments, res, req.user?.language || 'en');
    
  } catch (error: any) {
    console.error('Payment statement PDF generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate payment statement PDF',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;