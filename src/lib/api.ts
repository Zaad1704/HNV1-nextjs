import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { rateLimiter } from '../utils/security';

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.endsWith('/api') 
      ? process.env.NEXT_PUBLIC_API_URL 
      : `${process.env.NEXT_PUBLIC_API_URL}/api`;
  }
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'https://hnv.onrender.com/api';
    }
  }
  
  return 'http://localhost:5000/api';
};

const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const url = config.url || '';
  if (!rateLimiter.isAllowed(url, 30, 60000)) {
    return Promise.reject(new Error('Rate limit exceeded'));
  }

  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { token, isAuthenticated } = useAuthStore.getState();
      const isAuthEndpoint = error.config?.url?.includes('/auth/me') || error.config?.url?.includes('/auth/login');
      
      if (token && isAuthenticated && isAuthEndpoint) {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session=expired';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;