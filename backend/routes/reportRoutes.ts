import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { authorize as rbac } from '../middleware/rbac';
import {
  getCollectionSheet,
  getFinancialSummary,
  getPropertyPerformance,
  getTenantReport,
  getMaintenanceReport
} from '../controllers/reportController';

const router = Router();

router.use(protect);

// Financial reports
router.get('/financial-summary', rbac('Admin', 'Manager'), getFinancialSummary);
router.get('/collection-sheet', getCollectionSheet);

// Property reports
router.get('/property-performance', getPropertyPerformance);

// Tenant reports
router.get('/tenant-report', getTenantReport);

// Maintenance reports
router.get('/maintenance-report', getMaintenanceReport);

// Error handling
router.use((error: any, req: any, res: any, next: any) => {
  console.error('Report route error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

export default router;