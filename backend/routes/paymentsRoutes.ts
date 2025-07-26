import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize as rbac } from '../middleware/rbac';
import { checkSubscriptionStatus } from '../middleware/subscriptionMiddleware';
import { auditLog } from '../middleware/auditMiddleware';
import {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentById,
  getPaymentReceipt,
  sendPaymentReceipt,
  searchPayments,
  getPaymentSummary,
  getPaymentAnalytics,
  bulkPaymentActions
} from '../controllers/paymentsController';

const router = Router();

// Apply authentication to all routes
router.use(protect);

// Search and summary routes (before parameterized routes)
router.get('/search', searchPayments);
router.get('/summary', getPaymentSummary);
router.get('/analytics', getPaymentAnalytics);

// Bulk operations
router.post('/bulk-actions', rbac('Admin', 'Manager'), bulkPaymentActions);

// Get payments by property and month
router.get('/property/:propertyId/month/:month', async (req: any, res) => {
  try {
    const { propertyId, month } = req.params;
    
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    // Check agent permissions
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
  } catch (error: any) {
    console.error('Get payments by property/month error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payments',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Main CRUD routes
router.route('/')
  .get(getPayments)
  .post(rbac('Admin', 'Manager', 'Agent'), auditLog('payment'), createPayment);

router.route('/:id')
  .get(getPaymentById)
  .put(rbac('Admin', 'Manager', 'Agent'), auditLog('payment'), updatePayment)
  .delete(rbac('Admin', 'Manager'), auditLog('payment'), deletePayment);

// Receipt routes
router.get('/:id/receipt', getPaymentReceipt);

// PDF receipt generation endpoint
router.get('/:id/receipt-pdf', async (req: any, res) => {
  try {
    // Validate payment ID format
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

    // Check if user has access to this payment
    if (req.user.role !== 'Super Admin' && 
        payment.organizationId.toString() !== req.user.organizationId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this payment receipt' });
    }

    // Check agent permissions
    if (req.user.role === 'Agent') {
      const Property = require('../models/Property').default;
      const property = await Property.findById(payment.propertyId);
      
      if (!property || property.managedByAgentId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Agents can only generate receipts for payments from properties they manage' });
      }
    }

    try {
      const { generateColorfulPdfReceipt } = require('../utils/receiptGenerator');
      
      // Set response headers for PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Payment_Receipt_${req.params.id}.pdf"`);
      
      // Generate PDF and pipe to response
      generateColorfulPdfReceipt(payment, res);
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate PDF receipt. PDF generator may not be available.',
        error: process.env.NODE_ENV === 'development' ? pdfError.message : undefined
      });
    }
    
  } catch (error: any) {
    console.error('PDF receipt generation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate PDF receipt',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.post('/:id/send-receipt', sendPaymentReceipt);

// Error handling middleware for payment routes
router.use((error: any, req: any, res: any, next: any) => {
  console.error('Payment route error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map((err: any) => err.message)
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

export default router;