"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resend_1 = require("resend");
class EmailService {
    constructor() {
        if (process.env.RESEND_API_KEY) {
            this.resend = new resend_1.Resend(process.env.RESEND_API_KEY);
        }
        else {
            this.resend = null;
            console.warn('Resend API key not configured - email service disabled');
        }
    }
    async sendEmail(options) {
        try {
            if (!process.env.RESEND_API_KEY) {
                console.warn('Resend API key not configured - skipping email send');
                return { success: false, message: 'Email service not configured' };
            }
            const result = await this.resend.emails.send({
                from: options.from || process.env.EMAIL_FROM || 'HNV1 <noreply@hnvpm.com>',
                to: [options.to],
                subject: options.subject,
                html: options.html
            });
            console.log('Email sent successfully:', result.data?.id);
            return { success: true, messageId: result.data?.id };
        }
        catch (error) {
            console.error('Failed to send email:', error);
            return { success: false, error: error.message };
        }
    }
    async sendWelcomeEmail(to, name) {
        const html = `
      <h1>Welcome to HNV Property Management!</h1>
      <p>Hello ${name},</p>
      <p>Thank you for joining our platform. We're excited to help you manage your properties efficiently.</p>
      <p>Best regards,<br>The HNV Team</p>
    `;
        return this.sendEmail({
            to,
            subject: 'Welcome to HNV Property Management',
            html
        });
    }
    async sendVerificationEmail(to, token, userName) {
        const fs = require('fs');
        const path = require('path');
        try {
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
            const templatePath = path.join(__dirname, '../templates/emailVerification.html');
            let html = fs.readFileSync(templatePath, 'utf8');
            html = html.replace('{{userName}}', userName || 'User');
            html = html.replace('{{verificationUrl}}', verificationUrl);
            return this.sendEmail({
                to,
                subject: 'Verify Your Email Address - HNV Property Management',
                html
            });
        }
        catch (error) {
            console.error('Error reading email template:', error);
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
            const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Verify Your Email Address</h1>
          <p>Hello ${userName || 'User'},</p>
          <p>Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #0d6efd; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </div>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not create an account, please ignore this email.</p>
        </div>
      `;
            return this.sendEmail({
                to,
                subject: 'Verify Your Email Address - HNV Property Management',
                html
            });
        }
    }
    async sendPasswordResetEmail(to, token, userName) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333;">Reset Your Password</h1>
        <p>Hello ${userName || 'User'},</p>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;
        return this.sendEmail({
            to,
            subject: 'Reset Your Password - HNV Property Management',
            html
        });
    }
}
exports.default = new EmailService();
