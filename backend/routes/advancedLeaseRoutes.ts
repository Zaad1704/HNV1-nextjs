import express from 'express';
import {
  getExpiringLeases,
  processAutoRenewals,
  bulkRenewLeases,
  bulkTerminateLeases,
  generateLeaseDocument,
  updateAutoRenewalSettings,
  getLeaseAnalytics
} from '../controllers/advancedLeaseController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/expiring', getExpiringLeases);
router.post('/auto-renew', processAutoRenewals);
router.post('/bulk-renew', bulkRenewLeases);
router.post('/bulk-terminate', bulkTerminateLeases);
router.post('/generate-document', generateLeaseDocument);
router.put('/:leaseId/auto-renewal', updateAutoRenewalSettings);
router.get('/analytics', getLeaseAnalytics);

export default router;