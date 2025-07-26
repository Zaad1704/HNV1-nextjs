import express from 'express';
import { requireOrganization } from '../middleware/auth';
import {
  getTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant
} from '../controllers/tenantController-real';

const router = express.Router();

router.route('/')
  .get(requireOrganization, getTenants)
  .post(requireOrganization, createTenant);

router.route('/:id')
  .get(requireOrganization, getTenant)
  .put(requireOrganization, updateTenant)
  .delete(requireOrganization, deleteTenant);

// Note routes temporarily disabled

export default router;