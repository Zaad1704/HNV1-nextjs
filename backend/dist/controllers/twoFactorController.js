"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTwoFactorStatus = exports.verifyTwoFactorLogin = exports.disableTwoFactor = exports.verifyTwoFactorSetup = exports.generateTwoFactorSecret = void 0;
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const User_1 = __importDefault(require("../models/User"));
const generateTwoFactorSecret = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        if (user.twoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: '2FA is already enabled'
            });
        }
        const secret = speakeasy_1.default.generateSecret({
            name: `HNV1 (${user.email})`,
            issuer: 'HNV1 Property Management',
            length: 32
        });
        user.twoFactorTempSecret = secret.base32;
        await user.save();
        const qrCodeUrl = await qrcode_1.default.toDataURL(secret.otpauth_url);
        res.status(200).json({
            success: true,
            data: {
                secret: secret.base32,
                qrCode: qrCodeUrl,
                manualEntryKey: secret.base32
            },
            message: '2FA secret generated. Please verify with your authenticator app.'
        });
    }
    catch (error) {
        console.error('Generate 2FA secret error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during 2FA setup'
        });
    }
};
exports.generateTwoFactorSecret = generateTwoFactorSecret;
const verifyTwoFactorSetup = async (req, res, next) => {
    try {
        const { token } = req.body;
        const user = await User_1.default.findById(req.user._id);
        if (!user || !user.twoFactorTempSecret) {
            return res.status(400).json({
                success: false,
                message: 'No 2FA setup in progress'
            });
        }
        const verified = speakeasy_1.default.totp.verify({
            secret: user.twoFactorTempSecret,
            encoding: 'base32',
            token,
            window: 2
        });
        if (!verified) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }
        user.twoFactorSecret = user.twoFactorTempSecret;
        user.twoFactorEnabled = true;
        user.twoFactorTempSecret = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: '2FA enabled successfully'
        });
    }
    catch (error) {
        console.error('Verify 2FA setup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during 2FA verification'
        });
    }
};
exports.verifyTwoFactorSetup = verifyTwoFactorSetup;
const disableTwoFactor = async (req, res, next) => {
    try {
        const { token } = req.body;
        const user = await User_1.default.findById(req.user._id);
        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: '2FA is not enabled'
            });
        }
        const verified = speakeasy_1.default.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 2
        });
        if (!verified) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }
        user.twoFactorSecret = undefined;
        user.twoFactorEnabled = false;
        user.twoFactorTempSecret = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: '2FA disabled successfully'
        });
    }
    catch (error) {
        console.error('Disable 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during 2FA disable'
        });
    }
};
exports.disableTwoFactor = disableTwoFactor;
const verifyTwoFactorLogin = async (req, res, next) => {
    try {
        const { email, password, twoFactorToken } = req.body;
        if (!email || !password || !twoFactorToken) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and 2FA token are required'
            });
        }
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        if (!user.twoFactorEnabled || !user.twoFactorSecret) {
            return res.status(400).json({
                success: false,
                message: '2FA is not enabled for this account'
            });
        }
        const verified = speakeasy_1.default.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: twoFactorToken,
            window: 2
        });
        if (!verified) {
            return res.status(401).json({
                success: false,
                message: 'Invalid 2FA token'
            });
        }
        const token = user.getSignedJwtToken();
        res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                twoFactorEnabled: user.twoFactorEnabled
            },
            message: 'Login successful'
        });
    }
    catch (error) {
        console.error('2FA login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};
exports.verifyTwoFactorLogin = verifyTwoFactorLogin;
const getTwoFactorStatus = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: {
                twoFactorEnabled: user.twoFactorEnabled || false,
                hasSetupInProgress: !!user.twoFactorTempSecret
            }
        });
    }
    catch (error) {
        console.error('Get 2FA status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getTwoFactorStatus = getTwoFactorStatus;
