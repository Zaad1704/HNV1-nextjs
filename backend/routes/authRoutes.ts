import express from 'express';
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  getMe,
  updatePassword
} from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.use(authMiddleware); // All routes after this middleware are protected

router.post('/logout', logout);
router.get('/me', getMe);
router.post('/resend-verification', resendVerification);
router.patch('/update-password', updatePassword);

export default router;