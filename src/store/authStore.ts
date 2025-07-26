import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  organizationId?: any;
  googleId?: string;
  isEmailVerified?: boolean;
  status?: string;
  organization?: {
    _id: string;
    name: string;
    status: string;
  };
  subscription?: {
    status: string;
    planId: any;
    isLifetime: boolean;
    trialExpiresAt?: string;
    currentPeriodEndsAt?: string;
    cancelAtPeriodEnd?: boolean;
    canceledAt?: string;
  };
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  fetchUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      loading: false,
      setToken: (token) => set({ token, isAuthenticated: !!token }),
      setUser: (user) => set({ user, isAuthenticated: true }),
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('auth-method');
      },
      fetchUserData: async () => {
        const { token } = get();
        if (!token) return;
        
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              set({ user: data.data });
            }
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);