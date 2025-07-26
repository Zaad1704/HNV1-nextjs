import express from 'express';
import {
  createBulkPaymentBatch,
  processBulkPaymentBatch,
  getBulkPaymentBatches,
  createPaymentSchedule,
  getPaymentSchedules,
  processScheduledPayments,
  getPaymentAnalytics
} from '../controllers/enhancedBulkPaymentController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

// Bulk Payment Batches
router.post('/batch', createBulkPaymentBatch);
router.post('/batch/:batchId/process', processBulkPaymentBatch);
router.get('/batches', getBulkPaymentBatches);

// Payment Schedules
router.post('/schedule', createPaymentSchedule);
router.get('/schedules', getPaymentSchedules);
router.post('/process-scheduled', processScheduledPayments);

// Analytics
router.get('/analytics', getPaymentAnalytics);

export default router;