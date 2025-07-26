"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const passport_1 = __importDefault(require("passport"));
const router = (0, express_1.Router)();
router.post('/register', authController_1.registerUser);
router.post('/login', authController_1.loginUser);
router.get('/verify-email/:token', authController_1.verifyEmail);
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport_1.default.authenticate('google', { session: false }), authController_1.googleAuthCallback);
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
    }
    catch (error) {
        res.status(200).json({
            success: true,
            googleOAuthEnabled: false,
            message: 'Google OAuth is not configured'
        });
    }
});
router.get('/me', authMiddleware_1.protect, authController_1.getMe);
router.put('/profile', authMiddleware_1.protect, authController_1.updateProfile);
router.put('/change-password', authMiddleware_1.protect, authController_1.changePassword);
router.post('/resend-verification', authMiddleware_1.protect, authController_1.resendVerificationEmail);
router.put('/update-email', authMiddleware_1.protect, authController_1.updateEmail);
router.get('/verification-status', authMiddleware_1.protect, authController_1.getVerificationStatus);
router.delete('/delete-account', authMiddleware_1.protect, authController_1.deleteAccount);
exports.default = router;
