import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuthStore();

  // Simulate real-time notifications (replace with WebSocket in production)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      // Simulate random notifications
      if (Math.random() > 0.95) {
        const newNotification: Notification = {
          id: Date.now().toString(),
          title: 'New Rent Payment',
          message: 'John Doe has paid rent for Property A',
          type: 'success',
          timestamp: new Date(),
          read: false,
          action: {
            label: 'View Payment',
            url: '/dashboard/payments'
          }
        };
        
        addNotification(newNotification);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
    setUnreadCount(prev => prev + 1);
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png'
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    requestPermission
  };
};