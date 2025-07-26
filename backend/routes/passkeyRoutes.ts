import { Router } from 'express';
import {
  generatePasskeyChallenge,
  registerPasskey,
  getPasskeys,
  deletePasskey
} from '../controllers/passkeyController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(protect);

router.post('/challenge', generatePasskeyChallenge);
router.post('/register', registerPasskey);
router.get('/', getPasskeys);
router.delete('/:passkeyId', deletePasskey);

export default router;