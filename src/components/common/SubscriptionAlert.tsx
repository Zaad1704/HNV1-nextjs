import React from 'react';
import { AlertTriangle, Crown, Clock, CreditCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';

const SubscriptionAlert = () => {
  const router = useRouter();
  
  const { data: subscriptionData } = useQuery({
    queryKey: ['subscriptionStatus'],
    queryFn: async () => {
      const { data } = await apiClient.get('/billing/subscription');
      return data.data;
    },
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
  });

  const countdown = subscriptionData?.countdown;
  const statusCheck = subscriptionData?.statusCheck;

  // Don't show alert if subscription is active and not expiring soon
  if (!countdown || (!countdown.isExpiringSoon && statusCheck?.isActive)) {
    return null;
  }

  // Subscription expired
  if (countdown.isExpired || !statusCheck?.isActive) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-xl">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Subscription Expired
            </h3>
            <p className="text-sm text-red-700 mt-1">
              Your subscription has expired. Some features may be limited.
            </p>
          </div>
          <button
            onClick={() => router.push('/billing')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Renew Now
          </button>
        </div>
      </div>
    );
  }

  // Subscription expiring soon
  if (countdown.isExpiringSoon) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-xl">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-yellow-400 mr-3" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Subscription Expiring Soon
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Your subscription expires in {countdown.daysRemaining} days. 
              {countdown.cancelAtPeriodEnd && ' Auto-renewal is disabled.'}
            </p>
          </div>
          <button
            onClick={() => router.push('/billing')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors"
          >
            Manage
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default SubscriptionAlert;