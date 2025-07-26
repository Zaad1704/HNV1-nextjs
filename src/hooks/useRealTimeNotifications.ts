import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import socketService from '@/services/socketService';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
}

export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (token && user) {
      // Connect to socket
      socketService.connect(token);
      
      // Join organization room
      if (user.organizationId) {
        socketService.joinOrganization(user.organizationId);
      }

      // Listen for notifications
      const handleNotification = (notificationData: any) => {
        const notification: Notification = {
          id: Date.now().toString(),
          ...notificationData,
          timestamp: new Date()
        };
        
        setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo-min.png',
            tag: notification.id
          });
        }
      };

      socketService.on('notification', handleNotification);

      return () => {
        socketService.off('notification', handleNotification);
        if (user.organizationId) {
          socketService.leaveOrganization(user.organizationId);
        }
        socketService.disconnect();
      };
    }
  }, [token, user]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return {
    notifications,
    removeNotification,
    clearAllNotifications,
    requestNotificationPermission,
    isConnected: socketService.isConnected()
  };
};