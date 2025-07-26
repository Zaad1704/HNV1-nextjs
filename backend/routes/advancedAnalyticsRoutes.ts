import express from 'express';
import {
  generateAnalyticsSnapshot,
  getDashboardAnalytics,
  getPropertyPerformance,
  getTrendAnalysis,
  getPredictiveInsights
} from '../controllers/advancedAnalyticsController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.post('/snapshot', generateAnalyticsSnapshot);
router.get('/dashboard', getDashboardAnalytics);
router.get('/property-performance', getPropertyPerformance);
router.get('/trends', getTrendAnalysis);
router.get('/insights', getPredictiveInsights);

export default router;