import { Request, Response } from 'express';
import emailService from '../services/emailService';

export const testEmail = async (req: Request, res: Response) => {
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
        result = await emailService.sendWelcomeEmail(to, 'Test User');
        break;
      case 'verification':
        result = await emailService.sendVerificationEmail(to, 'test-token-123', 'Test User');
        break;
      case 'reset':
        result = await emailService.sendPasswordResetEmail(to, 'test-reset-token-123', 'Test User');
        break;
      default:
        result = await emailService.sendEmail({
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
  } catch (error: any) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending test email',
      error: error.message
    });
  }
};

export const getEmailStatus = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error checking email status',
      error: error.message
    });
  }
};