import { Server } from 'socket.io';
import { sendEmail } from './emailService';

interface NotificationData {
  userId: string;
  organizationId: string;
  type: 'payment' | 'maintenance' | 'lease' | 'system';
  title: string;
  message: string;
  data?: any;
}

class NotificationService {
  private io: Server | null = null;

  setSocketIO(io: Server) {
    this.io = io;
  }

  async sendNotification(notification: NotificationData) {
    // Send real-time notification via Socket.IO
    if (this.io) {
      this.io.to(`org-${notification.organizationId}`).emit('notification', {
        id: Date.now().toString(),
        ...notification,
        timestamp: new Date()
      });
    }

    // Store in database (if needed)
    // await Notification.create(notification);
  }

  async sendPaymentReminder(tenantEmail: string, tenantName: string, amount: number, dueDate: Date) {
    await sendEmail({
      to: tenantEmail,
      subject: 'Rent Payment Reminder',
      template: 'rentReminder',
      data: {
        firstName: tenantName,
        amount,
        dueDate: dueDate.toLocaleDateString()
      }
    });
  }

  async sendPaymentConfirmation(tenantEmail: string, tenantName: string, amount: number, receiptNumber: string) {
    await sendEmail({
      to: tenantEmail,
      subject: 'Payment Confirmation',
      template: 'paymentSuccess',
      data: {
        firstName: tenantName,
        amount,
        receiptNumber,
        date: new Date().toLocaleDateString()
      }
    });
  }

  async sendMaintenanceUpdate(tenantEmail: string, tenantName: string, requestId: string, status: string) {
    await sendEmail({
      to: tenantEmail,
      subject: 'Maintenance Request Update',
      template: 'maintenanceUpdate',
      data: {
        firstName: tenantName,
        requestId,
        status
      }
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;