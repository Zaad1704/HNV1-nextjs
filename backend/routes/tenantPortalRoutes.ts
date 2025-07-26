import { Router } from 'express';
import {
  createMaintenanceRequest,
  getTenantDashboard
} from '../controllers/tenantPortalController';

const router = Router();

router.get('/dashboard', getTenantDashboard);
router.post('/maintenance', createMaintenanceRequest);

export default router;