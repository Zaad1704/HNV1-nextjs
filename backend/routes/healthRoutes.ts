import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { healthCheck, dashboardHealth } from '../controllers/healthController';

const router = Router();

router.get('/', healthCheck);
router.get('/dashboard', protect, dashboardHealth);

export default router;