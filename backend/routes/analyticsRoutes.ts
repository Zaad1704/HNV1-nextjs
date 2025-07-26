import { Router } from 'express';
import {
  getCollectionAnalytics,
  getCollectionTrends,
  getPropertyPerformance,
  getTenantRiskAnalysis,
  getDashboardMetrics
} from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

router.use(protect);

// Collection analytics
router.get('/collection', getCollectionAnalytics);
router.get('/collection/trends', getCollectionTrends);
router.get('/property-performance', getPropertyPerformance);
router.get('/tenant-risk', getTenantRiskAnalysis);
router.get('/dashboard', getDashboardMetrics);

export default router;