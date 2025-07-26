import { Router } from 'express';
import {
  updateProfile,
  updateOrganization,
  requestAccountDeletion,
  exportData
} from '../controllers/settingsController';


const router = Router();

router.put('/profile', updateProfile);
router.put('/organization', updateOrganization);
router.post('/delete-account', requestAccountDeletion);
router.post('/export-data', exportData);

export default router;