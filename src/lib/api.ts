import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { rateLimiter } from '../utils/security';

// Get the API URL with proper detection for Render.com
const getApiUrl = () => {
  // Check environment variable first (highest priority)
  const nextApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (nextApiUrl) {
    const url = nextApiUrl.endsWith('/api') ? nextApiUrl : `${nextApiUrl}/api`;
    console.log('Using NEXT_PUBLIC_API_URL:', url);
    return url;
  }
  
  // Production detection for Render.com
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    console.log('Current hostname:', hostname);
    
    // If not localhost, assume production on Render.com
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const apiUrl = 'https://hnv.onrender.com/api';
      console.log('Using production API URL:', apiUrl);
      return apiUrl;
    }
  }
  
  // Development fallback
  const devUrl = 'http://localhost:5000/api';
  console.log('Using development API URL:', devUrl);
  return devUrl;
};

const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // Increased timeout for Render.com cold starts
  withCredentials: false,
});

// Log API configuration for debugging
console.log('API Client configured with baseURL:', apiClient.defaults.baseURL);

// Request interceptor with security enhancements
apiClient.interceptors.request.use((config) => {
  // Rate limiting check
  const url = config.url || '';
  if (!rateLimiter.isAllowed(url, 30, 60000)) {
    return Promise.reject(new Error('Rate limit exceeded'));
  }

  // Add auth token
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request with token:', config.url, 'Token exists:', !!token);
    }
  } else {
    console.warn('No auth token available for request:', config.url);
  }

  // Remove problematic headers
  delete config.headers['Cache-Control'];
  delete config.headers['cache-control'];
  
  return config;
});

// Response interceptor with enhanced error handling
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - check internet connection or server availability');
      error.userMessage = 'Network connection error. Please check your internet connection.';
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - this is common on Render.com during cold starts');
      error.userMessage = 'Request timed out. The server may be starting up (common on Render.com). Please wait a moment and try again.';
    }
    
    // Handle HTTP status codes
    if (error.response?.status === 401) {
      const { token, isAuthenticated } = useAuthStore.getState();
      // Only auto-logout on specific auth endpoints, not on missing data endpoints or Google auth
      const isAuthEndpoint = error.config?.url?.includes('/auth/me') || error.config?.url?.includes('/auth/login');
      const isGoogleAuth = error.config?.url?.includes('/auth/google');
      
      if (token && isAuthenticated && isAuthEndpoint && !isGoogleAuth) {
        console.log('Auth token invalid, logging out');
        useAuthStore.getState().logout();
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login?session=expired';
          }
        }, 100);
      } else {
        console.warn('401 error on endpoint (likely missing backend route):', error.config?.url);
        // Don't logout, just log the error
      }
    } else if (error.response?.status === 403) {
      // Don't auto-logout on 403 - might be subscription or permission issue
      console.warn('Access forbidden:', error.response?.data?.message);
      error.userMessage = error.response?.data?.message || 'Access denied';
    } else if (error.response?.status === 429) {
      console.error('Rate limit exceeded');
      error.userMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.status);
      error.userMessage = 'Server error. This may be a temporary issue on Render.com. Please try again in a few moments.';
    } else if (error.response?.status === 404) {
      console.warn('Resource not found:', error.config?.url);
      // Check if it's a route issue vs data issue
      if (error.config?.url?.includes('/payments') || error.config?.url?.includes('/tenants') || error.config?.url?.includes('/properties')) {
        console.error('API route not found - check Render.com backend deployment');
        error.userMessage = 'Service temporarily unavailable. The backend service may be starting up on Render.com. Please try again.';
      } else {
        error.userMessage = 'Requested data not found.';
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message: error.response?.data?.message,
        code: error.code
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;