import express from 'express';
import {
  getUnitHistory,
  getTenantMovementHistory,
  processTenantTransfer,
  getPropertyCrossAnalytics,
  getTenantJourney
} from '../controllers/crossIntegrationController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/unit/:unitId/history', getUnitHistory);
router.get('/tenant/:tenantId/movements', getTenantMovementHistory);
router.get('/tenant/:tenantId/journey', getTenantJourney);
router.get('/property/:propertyId/analytics', getPropertyCrossAnalytics);
router.post('/tenant/transfer', processTenantTransfer);

export default router;