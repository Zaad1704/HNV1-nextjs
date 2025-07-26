import { Router } from 'express';
import {
  generateTwoFactorSecret,
  verifyTwoFactorSetup,
  disableTwoFactor,
  verifyTwoFactorLogin,
  getTwoFactorStatus
} from '../controllers/twoFactorController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Public route for 2FA login
router.post('/verify-login', verifyTwoFactorLogin);

// Protected routes
router.get('/status', protect, getTwoFactorStatus);
router.post('/generate-secret', protect, generateTwoFactorSecret);
router.post('/verify-setup', protect, verifyTwoFactorSetup);
router.post('/disable', protect, disableTwoFactor);

export default router;