import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize as rbac } from '../middleware/rbac';
import upload from '../middleware/uploadMiddleware';
import { 
  getInvoices, 
  createInvoice,
  generateInvoices, 
  getInvoiceById, 
  printInvoice, 
  bulkDownloadInvoices, 
  sendWhatsAppInvoice, 
  sendEmailInvoice,
  searchInvoices,
  getInvoiceSummary,
  bulkInvoiceActions
} from '../controllers/invoiceController';

const router = Router();

// Apply authentication to all routes
router.use(protect);

// Search and summary routes (before parameterized routes)
router.get('/search', searchInvoices);
router.get('/summary', getInvoiceSummary);

// Bulk operations
router.post('/bulk-actions', rbac('Admin', 'Manager'), bulkInvoiceActions);
router.get('/bulk-download', bulkDownloadInvoices);

// Invoice generation
router.post('/generate', rbac('Admin', 'Manager'), generateInvoices);

// Main CRUD routes
router.route('/')
  .get(getInvoices)
  .post(
    upload.fields([
      { name: 'attachments', maxCount: 5 }
    ]),
    rbac('Admin', 'Manager', 'Agent'), 
    createInvoice
  );

router.route('/:id')
  .get(getInvoiceById)
  .put(
    upload.fields([
      { name: 'attachments', maxCount: 5 }
    ]),
    rbac('Admin', 'Manager', 'Agent'),
    async (req: any, res) => {
      try {
        const invoice = await require('../models/Invoice').default.findById(req.params.id);
        if (!invoice || invoice.organizationId.toString() !== req.user.organizationId.toString()) {
          return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        const updatedInvoice = await require('../models/Invoice').default.findByIdAndUpdate(
          req.params.id, 
          req.body, 
          { new: true, runValidators: true }
        ).populate('tenantId', 'name email').populate('propertyId', 'name address');

        res.status(200).json({ success: true, data: updatedInvoice });
      } catch (error: any) {
        console.error('Update invoice error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  )
  .delete(rbac('Admin', 'Manager'), async (req: any, res) => {
    try {
      const invoice = await require('../models/Invoice').default.findById(req.params.id);
      if (!invoice || invoice.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }

      await invoice.deleteOne();
      res.status(200).json({ success: true, data: {} });
    } catch (error: any) {
      console.error('Delete invoice error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });

// Print and export routes
router.get('/:id/print', printInvoice);
router.get('/:id/pdf', printInvoice);

// Communication routes
router.post('/:id/send-whatsapp', sendWhatsAppInvoice);
router.post('/:id/send-email', sendEmailInvoice);

// Error handling middleware
router.use((error: any, req: any, res: any, next: any) => {
  console.error('Invoice route error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map((err: any) => err.message)
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

export default router;
