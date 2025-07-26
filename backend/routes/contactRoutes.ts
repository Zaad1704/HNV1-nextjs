import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware
router.use(protect);

// Basic route - replace with actual routes
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'contact routes working',
    timestamp: new Date().toISOString()
  });
});

export default router;
