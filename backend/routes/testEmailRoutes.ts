import { Router } from 'express';
import { testEmail, getEmailStatus } from '../controllers/testEmailController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Test email routes (admin only)
router.use(protect);
router.get('/status', authorize('Super Admin'), getEmailStatus);
router.post('/send', authorize('Super Admin'), testEmail);

export default router;