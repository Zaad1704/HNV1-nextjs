import Notification from '../models/Notification';

class NotificationService {
  async createNotification(data: {
    userId: string;
    organizationId: string;
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message: string;
    link?: string;
  }) {
    try {
      const notification = await Notification.create(data);
      return notification;
    } catch (error) {
      console.error('Notification creation error:', error);
      return null;
    }
  }

  async getNotifications(userId: string, organizationId: string) {
    try {
      const notifications = await Notification.find({
        $or: [{ userId }, { organizationId }]
      })
      .sort({ createdAt: -1 })
      .limit(50);

      return notifications;
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    try {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true }
      );
      return true;
    } catch (error) {
      console.error('Mark notification read error:', error);
      return false;
    }
  }

  async markAllAsRead(userId: string) {
    try {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );
      return true;
    } catch (error) {
      console.error('Mark all notifications read error:', error);
      return false;
    }
  }

  // System notifications
  async notifyPaymentReceived(tenantName: string, amount: number, userId: string, organizationId: string) {
    return this.createNotification({
      userId,
      organizationId,
      type: 'success',
      title: 'Payment Received',
      message: `Payment of $${amount} received from ${tenantName}`,
      link: '/dashboard/payments'
    });
  }

  async notifyMaintenanceRequest(description: string, propertyName: string, userId: string, organizationId: string) {
    return this.createNotification({
      userId,
      organizationId,
      type: 'warning',
      title: 'Maintenance Request',
      message: `New maintenance request at ${propertyName}: ${description}`,
      link: '/dashboard/maintenance'
    });
  }

  async notifyLeaseExpiring(tenantName: string, daysLeft: number, userId: string, organizationId: string) {
    return this.createNotification({
      userId,
      organizationId,
      type: 'warning',
      title: 'Lease Expiring',
      message: `${tenantName}'s lease expires in ${daysLeft} days`,
      link: '/dashboard/tenants'
    });
  }

  async notifyRentOverdue(tenantName: string, daysOverdue: number, userId: string, organizationId: string) {
    return this.createNotification({
      userId,
      organizationId,
      type: 'error',
      title: 'Rent Overdue',
      message: `${tenantName}'s rent is ${daysOverdue} days overdue`,
      link: '/dashboard/tenants'
    });
  }
}

export default new NotificationService();