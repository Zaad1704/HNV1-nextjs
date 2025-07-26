import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

interface EmailOptions {
  to: string;
  subject: string;
  template?: string;
  html?: string;
  text?: string;
  data?: Record<string, any>;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email service configuration error:', error);
      } else {
        console.log('✅ Email service is ready');
      }
    });
  }

  private loadTemplate(templateName: string, data: Record<string, any> = {}): string {
    try {
      const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
      let template = fs.readFileSync(templatePath, 'utf8');

      // Replace placeholders with actual data
      Object.keys(data).forEach(key => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(placeholder, data[key] || '');
      });

      return template;
    } catch (error) {
      console.error(`Error loading email template ${templateName}:`, error);
      return this.getDefaultTemplate(data);
    }
  }

  private getDefaultTemplate(data: Record<string, any>): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HNV1 Property Management</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HNV1 Property Management</h1>
          </div>
          <div class="content">
            <p>Hello ${data.firstName || 'User'},</p>
            <p>${data.message || 'Thank you for using HNV1 Property Management.'}</p>
            ${data.actionUrl ? `<p><a href="${data.actionUrl}" class="button">Take Action</a></p>` : ''}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} HNV1 Property Management. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      let html = options.html;

      // If template is specified, load and process it
      if (options.template && !html) {
        html = this.loadTemplate(options.template, options.data || {});
      }

      // If no HTML content, use default template
      if (!html && !options.text) {
        html = this.getDefaultTemplate(options.data || {});
      }

      const mailOptions = {
        from: `${process.env.FROM_NAME || 'HNV1 Property Management'} <${process.env.FROM_EMAIL || 'noreply@hnv1.com'}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: html
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Welcome to HNV1 Property Management',
      template: 'welcome',
      data: {
        firstName,
        loginUrl: `${process.env.FRONTEND_URL}/login`
      }
    });
  }

  async sendPasswordResetEmail(to: string, firstName: string, resetUrl: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Password Reset Request',
      template: 'passwordReset',
      data: {
        firstName,
        resetUrl,
        expiryTime: '10 minutes'
      }
    });
  }

  async sendEmailVerificationEmail(to: string, firstName: string, verificationUrl: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Verify Your Email Address',
      template: 'emailVerification',
      data: {
        firstName,
        verificationUrl
      }
    });
  }

  async sendPaymentConfirmationEmail(to: string, firstName: string, paymentDetails: any): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Payment Confirmation',
      template: 'paymentSuccess',
      data: {
        firstName,
        amount: paymentDetails.amount,
        property: paymentDetails.property,
        unit: paymentDetails.unit,
        date: paymentDetails.date,
        receiptUrl: paymentDetails.receiptUrl
      }
    });
  }

  async sendMaintenanceUpdateEmail(to: string, firstName: string, maintenanceDetails: any): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Maintenance Request Update',
      template: 'maintenanceUpdate',
      data: {
        firstName,
        requestId: maintenanceDetails.id,
        status: maintenanceDetails.status,
        property: maintenanceDetails.property,
        unit: maintenanceDetails.unit,
        description: maintenanceDetails.description,
        updateUrl: `${process.env.FRONTEND_URL}/maintenance/${maintenanceDetails.id}`
      }
    });
  }

  async sendRentReminderEmail(to: string, firstName: string, rentDetails: any): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Rent Payment Reminder',
      template: 'rentReminder',
      data: {
        firstName,
        amount: rentDetails.amount,
        dueDate: rentDetails.dueDate,
        property: rentDetails.property,
        unit: rentDetails.unit,
        paymentUrl: `${process.env.FRONTEND_URL}/payments`
      }
    });
  }

  async sendBulkEmail(recipients: string[], subject: string, template: string, data: Record<string, any>): Promise<void> {
    const promises = recipients.map(recipient => 
      this.sendEmail({
        to: recipient,
        subject,
        template,
        data
      })
    );

    try {
      await Promise.all(promises);
      console.log(`Bulk email sent to ${recipients.length} recipients`);
    } catch (error) {
      console.error('Error sending bulk email:', error);
      throw new Error('Failed to send bulk email');
    }
  }
}

// Create and export a singleton instance
const emailService = new EmailService();

export const sendEmail = (options: EmailOptions) => emailService.sendEmail(options);
export const sendWelcomeEmail = (to: string, firstName: string) => emailService.sendWelcomeEmail(to, firstName);
export const sendPasswordResetEmail = (to: string, firstName: string, resetUrl: string) => emailService.sendPasswordResetEmail(to, firstName, resetUrl);
export const sendEmailVerificationEmail = (to: string, firstName: string, verificationUrl: string) => emailService.sendEmailVerificationEmail(to, firstName, verificationUrl);
export const sendPaymentConfirmationEmail = (to: string, firstName: string, paymentDetails: any) => emailService.sendPaymentConfirmationEmail(to, firstName, paymentDetails);
export const sendMaintenanceUpdateEmail = (to: string, firstName: string, maintenanceDetails: any) => emailService.sendMaintenanceUpdateEmail(to, firstName, maintenanceDetails);
export const sendRentReminderEmail = (to: string, firstName: string, rentDetails: any) => emailService.sendRentReminderEmail(to, firstName, rentDetails);
export const sendBulkEmail = (recipients: string[], subject: string, template: string, data: Record<string, any>) => emailService.sendBulkEmail(recipients, subject, template, data);

export default emailService;