import { Router } from 'express';
import { getPublicStats, getSiteSettings, getPublicData, getPublicPlans } from '../controllers/publicController';

const router = Router();

// Public endpoints - no authentication required
router.get('/stats', getPublicStats);
router.get('/site-settings', getSiteSettings);
router.get('/plans', getPublicPlans);
router.get('/data', getPublicData);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;