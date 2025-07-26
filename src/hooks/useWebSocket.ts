import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!token || !user) return;

    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
      auth: { token }
    });

    socketRef.current.on('connect', () => {

    });

    socketRef.current.on('notification', (data) => {
      // Handle real-time notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.title, {
          body: data.message,
          icon: '/favicon.ico'
        });
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token, user]);

  const emit = (event: string, data: any) => {
    socketRef.current?.emit(event, data);
  };

  const on = (event: string, callback: (data: any) => void) => {
    socketRef.current?.on(event, callback);
  };

  const off = (event: string, callback?: (data: any) => void) => {
    socketRef.current?.off(event, callback);
  };

  return { emit, on, off };
};