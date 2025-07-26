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
const nodemailer_1 = __importDefault(require("nodemailer"));
const twilio_1 = __importDefault(require("twilio"));
class MessagingService {
    constructor() {
        this.emailTransporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.twilioClient = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        }
    }
    async sendEmail(data) {
        try {
            if (!this.emailTransporter) {
                throw new Error('Email service not configured');
            }
            const mailOptions = {
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to: data.to,
                subject: data.subject || 'Property Management Notification',
                html: this.getEmailTemplate(data.template || 'default', data.message, data.data)
            };
            const result = await this.emailTransporter.sendMail(mailOptions);
            return { success: true, messageId: result.messageId };
        }
        catch (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }
    }
    async sendSMS(data) {
        try {
            if (!this.twilioClient) {
                throw new Error('SMS service not configured');
            }
            const result = await this.twilioClient.messages.create({
                body: data.message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: data.to
            });
            return { success: true, messageId: result.sid };
        }
        catch (error) {
            console.error('SMS send error:', error);
            return { success: false, error: error.message };
        }
    }
    async sendWhatsApp(data) {
        try {
            if (!this.twilioClient) {
                throw new Error('WhatsApp service not configured');
            }
            const result = await this.twilioClient.messages.create({
                body: data.message,
                from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
                to: `whatsapp:${data.to}`
            });
            return { success: true, messageId: result.sid };
        }
        catch (error) {
            console.error('WhatsApp send error:', error);
            return { success: false, error: error.message };
        }
    }
    async sendMessage(userId, message, subject, template, data) {
        try {
            const User = (await Promise.resolve().then(() => __importStar(require('../models/User')))).default;
            const user = await User.findById(userId);
            if (!user) {
                return { success: false, error: 'User not found' };
            }
            const results = [];
            if (user.email && user.notificationPreferences?.email !== false) {
                const emailResult = await this.sendEmail({
                    to: user.email,
                    subject,
                    message,
                    type: 'email',
                    template,
                    data
                });
                results.push({ type: 'email', ...emailResult });
            }
            if (user.phone && user.notificationPreferences?.sms === true) {
                const smsResult = await this.sendSMS({
                    to: user.phone,
                    message,
                    type: 'sms'
                });
                results.push({ type: 'sms', ...smsResult });
            }
            if (user.phone && user.notificationPreferences?.whatsapp === true) {
                const whatsappResult = await this.sendWhatsApp({
                    to: user.phone,
                    message,
                    type: 'whatsapp'
                });
                results.push({ type: 'whatsapp', ...whatsappResult });
            }
            return { success: true, results };
        }
        catch (error) {
            console.error('Send message error:', error);
            return { success: false, error: error.message };
        }
    }
    async sendInvitation(email, inviterName, organizationName, role, inviteLink) {
        const subject = `Invitation to join ${organizationName}`;
        const message = `
      <h2>You've been invited to join ${organizationName}</h2>
      <p>Hi there!</p>
      <p>${inviterName} has invited you to join <strong>${organizationName}</strong> as a <strong>${role}</strong>.</p>
      <p>Click the link below to accept the invitation and set up your account:</p>
      <p><a href="${inviteLink}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Accept Invitation</a></p>
      <p>If you have any questions, please contact ${inviterName} or reply to this email.</p>
      <p>Best regards,<br>The ${organizationName} Team</p>
    `;
        return this.sendEmail({
            to: email,
            subject,
            message,
            type: 'email',
            template: 'invitation',
            data: { inviterName, organizationName, role, inviteLink }
        });
    }
    getEmailTemplate(template, message, data) {
        const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Property Management Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3B82F6, #F97316); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; }
          .footer { background: #333; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Property Management System</h1>
          </div>
          <div class="content">
            ${message}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Property Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
        return baseTemplate;
    }
    async sendBulkMessage(userIds, message, subject, template) {
        const results = [];
        for (const userId of userIds) {
            const result = await this.sendMessage(userId, message, subject, template);
            results.push({ userId, ...result });
        }
        return results;
    }
}
exports.default = new MessagingService();
