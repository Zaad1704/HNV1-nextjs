import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

interface UseRealTimeOptions {
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

interface RealTimeNotification {
  type: string;
  message: string;
  data?: any;
  timestamp: Date;
}

export const useRealTime = (options: UseRealTimeOptions = {}) => {
  const { token } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<RealTimeNotification[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const {
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000
  } = options;

  useEffect(() => {
    if (!token || !autoConnect) return;

    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5001', {
      auth: {
        token
      },
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);

    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);

    });

    socket.on('connect_error', (error) => {
      setConnectionError(error.message);
      console.error('Real-time connection error:', error);
    });

    // Notification handlers
    socket.on('payment_received', (data: RealTimeNotification) => {
      setNotifications(prev => [data, ...prev.slice(0, 49)]); // Keep last 50
    });

    socket.on('maintenance_request', (data: RealTimeNotification) => {
      setNotifications(prev => [data, ...prev.slice(0, 49)]);
    });

    socket.on('lease_expiring', (data: RealTimeNotification) => {
      setNotifications(prev => [data, ...prev.slice(0, 49)]);
    });

    socket.on('rent_overdue', (data: RealTimeNotification) => {
      setNotifications(prev => [data, ...prev.slice(0, 49)]);
    });

    socket.on('system_maintenance', (data: RealTimeNotification) => {
      setNotifications(prev => [data, ...prev.slice(0, 49)]);
    });

    // Generic notification handler
    socket.on('notification', (data: RealTimeNotification) => {
      setNotifications(prev => [data, ...prev.slice(0, 49)]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token, autoConnect, reconnection, reconnectionAttempts, reconnectionDelay]);

  // Methods to interact with socket
  const connect = () => {
    if (socketRef.current && !isConnected) {
      socketRef.current.connect();
    }
  };

  const disconnect = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.disconnect();
    }
  };

  const joinRoom = (room: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_room', room);
    }
  };

  const leaveRoom = (room: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave_room', room);
    }
  };

  const sendMessage = (event: string, data: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return {
    isConnected,
    connectionError,
    notifications,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    clearNotifications,
    removeNotification,
    socket: socketRef.current
  };
};

// Hook for property-specific real-time updates
export const usePropertyRealTime = (propertyId: string) => {
  const realTime = useRealTime();

  useEffect(() => {
    if (realTime.isConnected && propertyId) {
      realTime.joinRoom(`property:${propertyId}`);
      
      return () => {
        realTime.leaveRoom(`property:${propertyId}`);
      };
    }
  }, [realTime.isConnected, propertyId, realTime]);

  return realTime;
};

// Hook for typing indicators
export const useTypingIndicator = (room: string) => {
  const { socket } = useRealTime();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!socket) return;

    socket.on('user_typing', (data: { userId: string; userName: string }) => {
      setTypingUsers(prev => {
        if (!prev.includes(data.userName)) {
          return [...prev, data.userName];
        }
        return prev;
      });
    });

    socket.on('user_stopped_typing', (data: { userId: string }) => {
      setTypingUsers(prev => prev.filter(name => name !== data.userId));
    });

    return () => {
      socket.off('user_typing');
      socket.off('user_stopped_typing');
    };
  }, [socket]);

  const startTyping = (userName: string) => {
    if (socket) {
      socket.emit('typing_start', { room, userName });
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 3000);
    }
  };

  const stopTyping = () => {
    if (socket) {
      socket.emit('typing_stop', { room });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  return {
    typingUsers,
    startTyping,
    stopTyping
  };
};