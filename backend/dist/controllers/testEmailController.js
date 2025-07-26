"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmailStatus = exports.testEmail = void 0;
const emailService_1 = __importDefault(require("../services/emailService"));
const testEmail = async (req, res) => {
    try {
        const { to, type = 'welcome' } = req.body;
        if (!to) {
            return res.status(400).json({
                success: false,
                message: 'Email address is required'
            });
        }
        let result;
        switch (type) {
            case 'welcome':
                result = await emailService_1.default.sendWelcomeEmail(to, 'Test User');
                break;
            case 'verification':
                result = await emailService_1.default.sendVerificationEmail(to, 'test-token-123', 'Test User');
                break;
            case 'reset':
                result = await emailService_1.default.sendPasswordResetEmail(to, 'test-reset-token-123', 'Test User');
                break;
            default:
                result = await emailService_1.default.sendEmail({
                    to,
                    subject: 'Test Email from HNV1',
                    html: '<h1>Test Email</h1><p>This is a test email from HNV1 Property Management.</p>'
                });
        }
        res.json({
            success: result.success,
            message: result.success ? 'Email sent successfully' : 'Failed to send email',
            data: result
        });
    }
    catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending test email',
            error: error.message
        });
    }
};
exports.testEmail = testEmail;
const getEmailStatus = async (req, res) => {
    try {
        const isConfigured = !!process.env.RESEND_API_KEY;
        res.json({
            success: true,
            data: {
                configured: isConfigured,
                service: 'Resend',
                from: process.env.EMAIL_FROM || 'HNV1 <noreply@hnvpm.com>'
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking email status',
            error: error.message
        });
    }
};
exports.getEmailStatus = getEmailStatus;
