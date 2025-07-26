import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api';

interface SubscriptionStatus {
  status: 'active' | 'inactive' | 'expired' | 'trialing' | 'cancelled';
  userStatus: 'no_subscription' | 'expired' | 'inactive' | 'trial_expired' | 'active';
  requiresSubscription: boolean;
  dashboardOnly: boolean;
  planName?: string;
  expiresAt?: string;
}

export const useSubscriptionStatus = () => {
  const { user } = useAuthStore();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!user || user.role === 'Super Admin') {
        setSubscriptionStatus({
          status: 'active',
          userStatus: 'active',
          requiresSubscription: false,
          dashboardOnly: false
        });
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/subscription/status');
        const status = response.data.data;
        
        setSubscriptionStatus(status);
        
        // Show popup for inactive users
        if (status.requiresSubscription && status.dashboardOnly) {
          setShowPopup(true);
        }
        
      } catch (error: any) {
        // Handle subscription check errors
        if (error.response?.status === 403) {
          const errorData = error.response.data;
          setSubscriptionStatus({
            status: errorData.subscriptionStatus || 'inactive',
            userStatus: errorData.userStatus || 'no_subscription',
            requiresSubscription: true,
            dashboardOnly: errorData.dashboardOnly || true
          });
          setShowPopup(true);
        }
      } finally {
        setLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, [user]);

  const hidePopup = () => {
    setShowPopup(false);
  };

  const isFeatureAllowed = (feature: string): boolean => {
    if (!subscriptionStatus) return false;
    if (user?.role === 'Super Admin') return true;
    if (subscriptionStatus.dashboardOnly) return false;
    return subscriptionStatus.status === 'active' || subscriptionStatus.status === 'trialing';
  };

  return {
    subscriptionStatus,
    loading,
    showPopup,
    hidePopup,
    isFeatureAllowed,
    isDashboardOnly: subscriptionStatus?.dashboardOnly || false,
    requiresSubscription: subscriptionStatus?.requiresSubscription || false
  };
};