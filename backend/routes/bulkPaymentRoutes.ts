import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { createBulkPayments, sendBulkWhatsAppNotices } from '../controllers/bulkPaymentController';

const router = Router();

router.use(protect);

router.post('/payments', createBulkPayments);
router.post('/whatsapp-notices', sendBulkWhatsAppNotices);

export default router;