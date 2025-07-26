import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertTriangle, CreditCard, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: string;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children, feature }) => {
  const [showWarning, setShowWarning] = useState(false);

  const { data: subscriptionStatus, isLoading } = useQuery({
    queryKey: ['subscriptionStatus'],
    queryFn: async () => {
      const response = await apiClient.get('/subscription/status');
      return response.data.data;
    },
    refetchInterval: 5 * 60 * 1000 // Check every 5 minutes
  });

  useEffect(() => {
    if (subscriptionStatus) {
      const { subscription } = subscriptionStatus;
      
      if (subscription.status === 'inactive' || subscription.status === 'canceled') {
        setShowWarning(true);
      } else if (subscription.status === 'trialing' && subscription.expiresAt) {
        const daysLeft = Math.ceil((new Date(subscription.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 3) {
          setShowWarning(true);
        }
      }
    }
  }, [subscriptionStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        <span className="ml-3 text-gray-600">Checking subscription...</span>
      </div>
    );
  }

  // Block access if subscription is expired
  if (subscriptionStatus?.subscription?.status === 'inactive' || subscriptionStatus?.subscription?.status === 'canceled') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription Expired</h2>
          <p className="text-gray-600 mb-6">
            Your subscription has expired. Please upgrade your plan to continue using the platform.
          </p>
          
          <div className="space-y-3">
            <Link
              to="/pricing"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
            >
              <CreditCard size={20} />
              Upgrade Now
            </Link>
            <Link
              to="/billing"
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              View Billing
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show warning banner for trial users
  if (showWarning && subscriptionStatus?.subscription?.status === 'trialing') {
    const daysLeft = Math.ceil((new Date(subscriptionStatus.subscription.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <div>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4"
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock size={20} />
              <span className="font-medium">
                Trial expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
              </span>
            </div>
            <Link
              to="/pricing"
              className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              Upgrade Now
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGuard;