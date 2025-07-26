"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.getVerificationStatus = exports.updateEmail = exports.resendVerificationEmail = exports.changePassword = exports.updateProfile = exports.googleAuthCallback = exports.verifyEmail = exports.getMe = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const Plan_1 = __importDefault(require("../models/Plan"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const subscriptionService_1 = __importDefault(require("../services/subscriptionService"));
const Property_1 = __importDefault(require("../models/Property"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Expense_1 = __importDefault(require("../models/Expense"));
const MaintenanceRequest_1 = __importDefault(require("../models/MaintenanceRequest"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendTokenResponse = async (user, statusCode, res) => {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const payload = { id: user._id.toString() };
    const options = { expiresIn: '30d' };
    const token = jsonwebtoken_1.default.sign(payload, secret, options);
    const subscription = await Subscription_1.default.findOne({ organizationId: user.organizationId });
    res.status(statusCode).json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            isEmailVerified: user.isEmailVerified,
            status: user.status,
            createdAt: user.createdAt
        },
        userStatus: subscription?.status || 'inactive'
    });
};
const registerUser = async (req, res, next) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({
            success: false,
            message: 'Please provide name, email, password, and role'
        });
    }
    try {
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            if (!userExists.isEmailVerified) {
                return res.status(400).json({
                    success: false,
                    message: 'This email is already registered but not verified. Please check your inbox.'
                });
            }
            return res.status(400).json({
                success: false,
                message: 'User with that email already exists'
            });
        }
        const trialPlan = await Plan_1.default.findOne({ name: 'Free Trial' });
        if (!trialPlan) {
            return res.status(500).json({
                success: false,
                message: 'Trial plan not configured. Please run setup.'
            });
        }
        const organization = new Organization_1.default({
            name: `${name}'s Organization`,
            status: 'Active'
        });
        await organization.save();
        const user = new User_1.default({
            name,
            email,
            password,
            role,
            organizationId: organization._id,
            status: 'Pending',
            isEmailVerified: false
        });
        organization.owner = user._id;
        organization.members = [user._id];
        await organization.save();
        const verificationToken = user.getEmailVerificationToken();
        await user.save();
        try {
            await subscriptionService_1.default.createTrialSubscription(organization._id.toString(), trialPlan._id.toString());
            console.log('✅ Trial subscription created for new user:', user.email);
        }
        catch (error) {
            console.error('❌ Failed to create trial subscription:', error);
        }
        try {
            const emailService = (await Promise.resolve().then(() => __importStar(require('../services/emailService')))).default;
            await emailService.sendVerificationEmail(user.email, verificationToken, user.name);
            console.log('✅ Verification email sent successfully to:', user.email);
        }
        catch (emailError) {
            console.error('❌ Failed to send verification email:', emailError);
        }
        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email and verify your account within 24 hours to maintain access.',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
    }
    try {
        console.log('=== LOGIN ATTEMPT ===');
        console.log('Email:', email);
        console.log('Password provided:', !!password);
        const user = await User_1.default.findOne({ email }).select('+password');
        console.log('User found:', !!user);
        if (!user) {
            console.log('❌ User not found for email:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        console.log('User details:');
        console.log('- Role:', user.role);
        console.log('- Status:', user.status);
        console.log('- Email verified:', user.isEmailVerified);
        console.log('- Has password:', !!user.password);
        const isMatch = await user.matchPassword(password);
        console.log('Password match result:', isMatch);
        if (!isMatch) {
            console.log('❌ Password mismatch for user:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        console.log('✅ Password verified successfully');
        if (user.googleId && !user.isEmailVerified) {
            user.isEmailVerified = true;
            user.status = 'Active';
            await user.save();
        }
        if (user.role !== 'Super Admin' && !user.googleId) {
            if (user.status === 'Suspended') {
                return res.status(401).json({
                    success: false,
                    message: 'Account is suspended. Please contact support.'
                });
            }
            if (!user.isEmailVerified) {
                return res.status(401).json({
                    success: false,
                    message: 'Please verify your email address to continue.'
                });
            }
        }
        sendTokenResponse(user, 200, res);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};
exports.loginUser = loginUser;
const getMe = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.set('Cache-Control', 'private, max-age=300');
        let populatedUser = user;
        let subscription = null;
        let organization = null;
        if (user.organizationId) {
            populatedUser = await User_1.default.findById(user._id).populate('organizationId').select('-password');
            subscription = await Subscription_1.default.findOne({ organizationId: user.organizationId }).populate('planId');
            organization = await Organization_1.default.findById(user.organizationId);
        }
        res.status(200).json({
            success: true,
            data: {
                _id: populatedUser._id,
                name: populatedUser.name,
                email: populatedUser.email,
                role: populatedUser.role,
                organizationId: populatedUser.organizationId,
                status: populatedUser.status,
                isEmailVerified: populatedUser.isEmailVerified,
                organization: organization ? {
                    _id: organization._id,
                    name: organization.name,
                    status: organization.status
                } : null,
                subscription: subscription ? {
                    status: subscription.status,
                    planId: subscription.planId,
                    isLifetime: subscription.isLifetime,
                    trialExpiresAt: subscription.trialExpiresAt,
                    currentPeriodEndsAt: subscription.currentPeriodEndsAt,
                    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
                    canceledAt: subscription.canceledAt
                } : null
            }
        });
    }
    catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getMe = getMe;
const verifyEmail = async (req, res, next) => {
    const { token } = req.params;
    try {
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const user = await User_1.default.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }
        user.isEmailVerified = true;
        user.status = 'Active';
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during email verification'
        });
    }
};
exports.verifyEmail = verifyEmail;
const googleAuthCallback = async (req, res, next) => {
    try {
        console.log('Google auth callback triggered');
        if (!req.user) {
            console.error('No user found in Google auth callback');
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=account-not-found&message=No account found with this Google email. Please sign up first.`);
        }
        const user = req.user;
        console.log('Google auth for user:', user.email);
        console.log('✅ Google login successful for existing user:', user.email);
        const secret = process.env.JWT_SECRET || 'fallback-secret';
        const payload = { id: user._id.toString() };
        const options = { expiresIn: '30d' };
        const token = jsonwebtoken_1.default.sign(payload, secret, options);
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/google/callback?token=${token}`;
        res.redirect(redirectUrl);
    }
    catch (error) {
        console.error('Google auth callback error:', error);
        if (error.message === 'ACCOUNT_NOT_FOUND') {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=account-not-found&message=No account found with this Google email. Please sign up first.`);
        }
        res.redirect(`${process.env.FRONTEND_URL}/login?error=google-auth-failed&message=Server error during authentication`);
    }
};
exports.googleAuthCallback = googleAuthCallback;
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, profilePicture } = req.body;
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        if (name)
            user.name = name;
        if (phone)
            user.phone = phone;
        if (profilePicture)
            user.profilePicture = profilePicture;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profilePicture: user.profilePicture
            }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile update'
        });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.default.findById(req.user._id).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password change'
        });
    }
};
exports.changePassword = changePassword;
const resendVerificationEmail = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }
        const verificationToken = user.getEmailVerificationToken();
        await user.save();
        const emailService = (await Promise.resolve().then(() => __importStar(require('../services/emailService')))).default;
        await emailService.sendVerificationEmail(user.email, verificationToken, user.name);
        res.status(200).json({
            success: true,
            message: 'Verification email sent successfully'
        });
    }
    catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during email resend'
        });
    }
};
exports.resendVerificationEmail = resendVerificationEmail;
const updateEmail = async (req, res, next) => {
    try {
        const { newEmail } = req.body;
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const existingUser = await User_1.default.findOne({ email: newEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email is already in use'
            });
        }
        user.email = newEmail;
        user.isEmailVerified = false;
        user.status = 'Pending';
        const verificationToken = user.getEmailVerificationToken();
        await user.save();
        const emailService = (await Promise.resolve().then(() => __importStar(require('../services/emailService')))).default;
        await emailService.sendVerificationEmail(newEmail, verificationToken, user.name);
        res.status(200).json({
            success: true,
            message: 'Email updated. Please verify your new email address within 24 hours.'
        });
    }
    catch (error) {
        console.error('Update email error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during email update'
        });
    }
};
exports.updateEmail = updateEmail;
const getVerificationStatus = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const verificationDeadline = new Date(user.createdAt.getTime() + 24 * 60 * 60 * 1000);
        const timeRemaining = verificationDeadline.getTime() - new Date().getTime();
        const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
        res.status(200).json({
            success: true,
            data: {
                isEmailVerified: user.isEmailVerified,
                email: user.email,
                verificationDeadline,
                hoursRemaining: Math.max(0, hoursRemaining),
                isExpired: timeRemaining <= 0 && !user.isEmailVerified
            }
        });
    }
    catch (error) {
        console.error('Get verification status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
exports.getVerificationStatus = getVerificationStatus;
const deleteAccount = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        if (user.role === 'Super Admin') {
            return res.status(403).json({
                success: false,
                message: 'Super Admin accounts cannot be deleted'
            });
        }
        const organizationId = user.organizationId;
        const userId = user._id;
        try {
            await AuditLog_1.default.create({
                userId: userId,
                organizationId: organizationId,
                action: 'account_deleted',
                resource: 'user_account',
                resourceId: userId,
                details: {
                    userName: user.name,
                    userEmail: user.email,
                    userRole: user.role,
                    deletedBy: 'Self',
                    deletionReason: 'User requested account deletion'
                },
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                timestamp: new Date()
            });
        }
        catch (auditError) {
            console.error('Audit log creation failed:', auditError);
        }
        const deletionPromises = [];
        if (organizationId) {
            deletionPromises.push(MaintenanceRequest_1.default.deleteMany({ organizationId }), Payment_1.default.deleteMany({ organizationId }), Expense_1.default.deleteMany({ organizationId }), Tenant_1.default.deleteMany({ organizationId }), Property_1.default.deleteMany({ organizationId }), Subscription_1.default.deleteMany({ organizationId }), AuditLog_1.default.deleteMany({ organizationId }));
        }
        await Promise.allSettled(deletionPromises);
        if (organizationId) {
            const organization = await Organization_1.default.findById(organizationId);
            if (organization && organization.owner?.toString() === userId.toString()) {
                await Organization_1.default.findByIdAndDelete(organizationId);
            }
        }
        await User_1.default.findByIdAndDelete(userId);
        console.log(`Account deleted: ${user.email} (${user.name})`);
        res.status(200).json({
            success: true,
            message: 'Account and all associated data deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.deleteAccount = deleteAccount;
