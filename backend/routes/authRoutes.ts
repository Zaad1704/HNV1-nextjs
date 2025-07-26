import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  verifyEmail,
  googleAuthCallback,
  updateProfile,
  changePassword,
  resendVerificationEmail,
  updateEmail,
  getVerificationStatus,
  deleteAccount
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import passport from 'passport';

const router = Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/verify-email/:token', verifyEmail);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false }), 
  googleAuthCallback
);

// Google OAuth status check
router.get('/google/status', (req, res) => {
  try {
    const isConfigured = process.env.GOOGLE_CLIENT_ID && 
                        process.env.GOOGLE_CLIENT_SECRET && 
                        process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
                        process.env.GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here';
    
    res.status(200).json({ 
      success: true, 
      googleOAuthEnabled: isConfigured,
      message: isConfigured ? 'Google OAuth is configured' : 'Google OAuth is not configured'
    });
  } catch (error) {
    res.status(200).json({ 
      success: true, 
      googleOAuthEnabled: false,
      message: 'Google OAuth is not configured'
    });
  }
});

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/resend-verification', protect, resendVerificationEmail);
router.put('/update-email', protect, updateEmail);
router.get('/verification-status', protect, getVerificationStatus);
router.delete('/delete-account', protect, deleteAccount);

export default router;