import nodemailer from 'nodemailer';
import twilio from 'twilio';

interface MessageData {
  to: string;
  subject?: string;
  message: string;
  type: 'email' | 'sms' | 'whatsapp';
  template?: string;
  data?: any;
}

class MessagingService {
  private emailTransporter: any;
  private twilioClient: any;

  constructor() {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Initialize Twilio client
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    }
  }

  // Send email
  async sendEmail(data: MessageData) {
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
    } catch (error) {
      console.error('Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send SMS
  async sendSMS(data: MessageData) {
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
    } catch (error) {
      console.error('SMS send error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send WhatsApp message
  async sendWhatsApp(data: MessageData) {
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
    } catch (error) {
      console.error('WhatsApp send error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send message based on user preferences
  async sendMessage(userId: string, message: string, subject?: string, template?: string, data?: any) {
    try {
      const User = (await import('../models/User')).default;
      const user = await User.findById(userId);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const results = [];

      // Send email if user has email and email notifications enabled
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

      // Send SMS if user has phone and SMS notifications enabled
      if (user.phone && user.notificationPreferences?.sms === true) {
        const smsResult = await this.sendSMS({
          to: user.phone,
          message,
          type: 'sms'
        });
        results.push({ type: 'sms', ...smsResult });
      }

      // Send WhatsApp if user has phone and WhatsApp notifications enabled
      if (user.phone && (user.notificationPreferences as any)?.whatsapp === true) {
        const whatsappResult = await this.sendWhatsApp({
          to: user.phone,
          message,
          type: 'whatsapp'
        });
        results.push({ type: 'whatsapp', ...whatsappResult });
      }

      return { success: true, results };
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send invitation email
  async sendInvitation(email: string, inviterName: string, organizationName: string, role: string, inviteLink: string) {
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

  // Get email template
  private getEmailTemplate(template: string, message: string, data?: any): string {
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

  // Send bulk messages
  async sendBulkMessage(userIds: string[], message: string, subject?: string, template?: string) {
    const results = [];
    
    for (const userId of userIds) {
      const result = await this.sendMessage(userId, message, subject, template);
      results.push({ userId, ...result });
    }
    
    return results;
  }
}

export default new MessagingService();