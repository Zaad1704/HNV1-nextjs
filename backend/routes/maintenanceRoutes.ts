import express from 'express';
import { requireOrganization } from '../middleware/auth';
import { getMaintenanceRequests, createMaintenanceRequest, updateMaintenanceRequest } from '../controllers/maintenanceController-real';

const router = express.Router();

router.route('/')
  .get(requireOrganization, getMaintenanceRequests)
  .post(requireOrganization, createMaintenanceRequest);

router.route('/:id')
  .put(requireOrganization, updateMaintenanceRequest);

export default router;