import express from 'express';
import { requireOrganization } from '../middleware/auth';
import { getAdvancedAnalytics, getTenantAnalytics } from '../controllers/analyticsController';

const router = express.Router();

router.get('/advanced', requireOrganization, getAdvancedAnalytics);
router.get('/tenants', requireOrganization, getTenantAnalytics);

export default router;