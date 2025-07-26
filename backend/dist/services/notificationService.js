"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Notification_1 = __importDefault(require("../models/Notification"));
class NotificationService {
    async createNotification(data) {
        try {
            const notification = await Notification_1.default.create(data);
            return notification;
        }
        catch (error) {
            console.error('Notification creation error:', error);
            return null;
        }
    }
    async getNotifications(userId, organizationId) {
        try {
            const notifications = await Notification_1.default.find({
                $or: [{ userId }, { organizationId }]
            })
                .sort({ createdAt: -1 })
                .limit(50);
            return notifications;
        }
        catch (error) {
            console.error('Get notifications error:', error);
            return [];
        }
    }
    async markAsRead(notificationId, userId) {
        try {
            await Notification_1.default.findOneAndUpdate({ _id: notificationId, userId }, { isRead: true });
            return true;
        }
        catch (error) {
            console.error('Mark notification read error:', error);
            return false;
        }
    }
    async markAllAsRead(userId) {
        try {
            await Notification_1.default.updateMany({ userId, isRead: false }, { isRead: true });
            return true;
        }
        catch (error) {
            console.error('Mark all notifications read error:', error);
            return false;
        }
    }
    async notifyPaymentReceived(tenantName, amount, userId, organizationId) {
        return this.createNotification({
            userId,
            organizationId,
            type: 'success',
            title: 'Payment Received',
            message: `Payment of $${amount} received from ${tenantName}`,
            link: '/dashboard/payments'
        });
    }
    async notifyMaintenanceRequest(description, propertyName, userId, organizationId) {
        return this.createNotification({
            userId,
            organizationId,
            type: 'warning',
            title: 'Maintenance Request',
            message: `New maintenance request at ${propertyName}: ${description}`,
            link: '/dashboard/maintenance'
        });
    }
    async notifyLeaseExpiring(tenantName, daysLeft, userId, organizationId) {
        return this.createNotification({
            userId,
            organizationId,
            type: 'warning',
            title: 'Lease Expiring',
            message: `${tenantName}'s lease expires in ${daysLeft} days`,
            link: '/dashboard/tenants'
        });
    }
    async notifyRentOverdue(tenantName, daysOverdue, userId, organizationId) {
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
exports.default = new NotificationService();
