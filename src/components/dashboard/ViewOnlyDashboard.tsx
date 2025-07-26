import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, CreditCard, AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

const ViewOnlyDashboard = () => {
  const { user } = useAuthStore();
  const [isReactivating, setIsReactivating] = useState(false);
  
  const { data: plans } = useQuery({
    queryKey: ['availablePlans'],
    queryFn: async () => {
      const { data } = await apiClient.get('/public/plans');
      return data.data || [];
    }
  });
  
  const getSubscriptionStatus = () => {
    const sub = (user as any)?.subscription;
    if (!sub) return 'No active subscription';
    
    if (sub.status === 'canceled') return 'Subscription canceled';
    if (sub.status === 'past_due') return 'Payment overdue';
    if (sub.trialExpiresAt && new Date(sub.trialExpiresAt) < new Date()) return 'Trial expired';
    return 'Account inactive';
  };
  
  const handleReactivate = async () => {
    setIsReactivating(true);
    try {
      // Redirect to subscription page or show reactivation modal
      window.location.href = '/dashboard/billing';
    } catch (error) {
      console.error('Reactivation error:', error);
    } finally {
      setIsReactivating(false);
    }
  };
  
  return (
    <div className="dashboard-container min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">{getSubscriptionStatus()}</h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            {(user as any)?.subscription?.status === 'past_due' 
              ? 'Your payment is overdue. Please update your payment method to continue using all features.'
              : 'Your account has limited access. Reactivate your subscription to unlock all features.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="app-surface rounded-3xl p-6 border border-app-border relative overflow-hidden"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
          >
            <div className="absolute top-4 right-4">
              <Eye size={16} className="text-text-muted" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Properties</h3>
            <p className="text-3xl font-bold text-text-muted mb-2">0</p>
            <p className="text-sm text-text-secondary">View only - Upgrade to add properties</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="app-surface rounded-3xl p-6 border border-app-border relative overflow-hidden"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
          >
            <div className="absolute top-4 right-4">
              <Eye size={16} className="text-text-muted" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Tenants</h3>
            <p className="text-3xl font-bold text-text-muted mb-2">0</p>
            <p className="text-sm text-text-secondary">View only - Upgrade to manage tenants</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="app-surface rounded-3xl p-6 border border-app-border relative overflow-hidden"
            style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}
          >
            <div className="absolute top-4 right-4">
              <Eye size={16} className="text-text-muted" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-text-muted mb-2">$0</p>
            <p className="text-sm text-text-secondary">View only - Upgrade to track payments</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="app-surface rounded-3xl p-8 border border-orange-200 bg-orange-50"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <AlertTriangle size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-orange-800">Activate Your Account</h2>
              <p className="text-orange-700">Get full access to all property management features</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-orange-800 mb-2">What you're missing:</h3>
              <ul className="space-y-1 text-sm text-orange-700">
                <li>• Add and manage properties</li>
                <li>• Track tenant information</li>
                <li>• Process rent payments</li>
                <li>• Generate financial reports</li>
                <li>• Maintenance request tracking</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-orange-800 mb-2">How to activate:</h3>
              <ul className="space-y-1 text-sm text-orange-700">
                <li>• Verify your email address</li>
                <li>• Choose a subscription plan</li>
                <li>• Complete account setup</li>
                <li>• Start managing properties</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleReactivate}
              disabled={isReactivating}
              className="btn-gradient px-6 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isReactivating ? <RefreshCw size={20} className="animate-spin" /> : <CreditCard size={20} />}
              {isReactivating ? 'Processing...' : 'Reactivate Subscription'}
            </button>
            <Link 
              to="/contact" 
              className="px-6 py-3 rounded-2xl font-semibold border border-orange-300 text-orange-700 hover:bg-orange-100 transition-colors"
            >
              Contact Support
            </Link>
          </div>
          
          {plans && plans.length > 0 && (
            <div className="mt-8 p-6 bg-white rounded-2xl border border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-4">Available Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.slice(0, 3).map((plan: any) => (
                  <div key={plan._id} className="p-4 border border-orange-200 rounded-xl hover:border-orange-400 transition-colors">
                    <h4 className="font-semibold text-orange-800">{plan.name}</h4>
                    <p className="text-2xl font-bold text-orange-600">${plan.price/100}</p>
                    <p className="text-sm text-orange-600">per {plan.duration}</p>
                    <ul className="text-xs text-orange-700 mt-2 space-y-1">
                      {plan.features?.slice(0, 3).map((feature: string, idx: number) => (
                        <li key={idx}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-text-muted text-sm">
            Need help? Contact our support team for assistance with account activation.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ViewOnlyDashboard;