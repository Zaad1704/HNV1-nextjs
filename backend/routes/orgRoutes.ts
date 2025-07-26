import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getMyOrganization,
  getOrganizations,
  updateOrganization,
  setOrgStatus
} from '../controllers/orgController';

const router = Router();

router.use(protect);

router.get('/', getOrganizations);
router.get('/me', getMyOrganization);
router.put('/me', updateOrganization);
router.put('/status', setOrgStatus);

export default router;