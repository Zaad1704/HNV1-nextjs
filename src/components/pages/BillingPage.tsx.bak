import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, AlertTriangle, RefreshCw, Download, Sparkles, Crown, Shield, Building2, Users, Eye, Archive } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import apiClient from '../api/client';

const BillingPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [showUsageStats, setShowUsageStats] = useState(false);

  const { data: plans = [] } = useQuery({
    queryKey: ['availablePlans'],
    queryFn: async () => {
      const { data } = await apiClient.get('/billing/plans');
      return data.data || [];
    }
  });

  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await apiClient.get('/billing/subscription');
      return data.data;
    }
  });
  
  const { data: usageStats } = useQuery({
    queryKey: ['usageStats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/billing/usage');
      return data.data;
    },
    enabled: !!userData?.subscription
  });
  
  const currentSubscription = userData?.subscription;
  const organization = userData?.organization;
  const countdown = userData?.countdown;
  const statusCheck = userData?.statusCheck;

  const createCheckoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data } = await apiClient.post('/billing/create-checkout', { planId });
      return data;
    },
    onSuccess: (data) => {
      // Redirect to 2Checkout
      window.location.href = data.data.checkoutUrl;
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to create checkout session');
    }
  });
  
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/billing/cancel');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      alert('Subscription will be cancelled at the end of current period');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Failed to cancel subscription');
    }
  });

  const handleSubscribe = async (planId: string) => {
    if (!planId) return;
    
    setIsProcessing(true);
    try {
      await createCheckoutMutation.mutateAsync(planId);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period.')) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await cancelSubscriptionMutation.mutateAsync();
    } finally {
      setIsProcessing(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (!currentSubscription) return 'No active subscription';
    
    // Check organization status first (super admin actions)
    if (organization?.status === 'inactive') return 'Organization Deactivated';
    if (organization?.status === 'pending_deletion') return 'Organization Pending Deletion';
    
    // Check subscription status
    if (currentSubscription.status === 'canceled') return 'Canceled';
    if (currentSubscription.status === 'past_due') return 'Payment Overdue';
    if (currentSubscription.status === 'inactive') return 'Inactive';
    if (currentSubscription.status === 'expired') return 'Expired';
    if (currentSubscription.trialExpiresAt && new Date(currentSubscription.trialExpiresAt) < new Date()) {
      return 'Trial Expired';
    }
    if (currentSubscription.currentPeriodEndsAt && new Date(currentSubscription.currentPeriodEndsAt) < new Date() && !currentSubscription.isLifetime) {
      return 'Period Expired';
    }
    
    return currentSubscription.status;
  };
  
  const isRestricted = () => {
    return organization?.status === 'inactive' || 
           ['canceled', 'past_due', 'inactive', 'expired'].includes(currentSubscription?.status) ||
           (currentSubscription?.trialExpiresAt && new Date(currentSubscription.trialExpiresAt) < new Date()) ||
           (currentSubscription?.currentPeriodEndsAt && new Date(currentSubscription.currentPeriodEndsAt) < new Date() && !currentSubscription?.isLifetime);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto p-6"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-4">
          <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
            Billing & Subscription
          </span>
          <Sparkles size={32} className="text-brand-orange animate-pulse" />
        </h1>
        <p className="text-text-secondary text-lg">
          Manage your subscription, billing information, and usage statistics
        </p>
        
        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
            <Building2 size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Organization: {organization?.name || 'Default'}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
            <Users size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-800">
              {user?.role || 'User'} Access
            </span>
          </div>
        </div>
      </div>

      {/* Restriction Warning */}
      {isRestricted() && (
        <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-400 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={24} className="text-red-600" />
            <h2 className="text-xl font-bold text-red-800">Access Restricted</h2>
          </div>
          <p className="text-red-700 mb-4">
            {organization?.status === 'inactive' 
              ? 'Your organization has been deactivated by an administrator. Contact support for assistance.'
              : 'Your subscription is inactive. Please reactivate or upgrade your plan to restore full access.'
            }
          </p>
          {organization?.status !== 'inactive' && (
            <p className="text-red-600 text-sm">
              You can still view your dashboard but cannot access full features until reactivated.
            </p>
          )}
        </div>
      )}

      {/* Current Subscription Status */}
      {currentSubscription && (
        <div className="mb-8 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl border-2 border-blue-200 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 gradient-dark-orange-blue rounded-2xl flex items-center justify-center shadow-lg">
              <Crown size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Current Subscription</h2>
              <p className="text-text-secondary">Your active plan and billing details</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-text-secondary">Plan</p>
              <p className="font-semibold">{currentSubscription.planId?.name || 'Free Trial'}</p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Status</p>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                currentSubscription.status === 'active' && !isRestricted() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {getSubscriptionStatus()}
              </span>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Next Billing</p>
              <p className="font-semibold">
                {currentSubscription.isLifetime ? 'Lifetime Access' :
                 currentSubscription.nextBillingDate 
                  ? new Date(currentSubscription.nextBillingDate).toLocaleDateString()
                  : 'N/A'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Period Ends</p>
              <div>
                <p className="font-semibold">
                  {currentSubscription.currentPeriodEnd 
                    ? new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
                {countdown && (
                  <div className={`text-xs mt-1 ${
                    countdown.isExpiringSoon ? 'text-red-600 font-semibold' : 'text-gray-500'
                  }`}>
                    {countdown.isExpired 
                      ? 'Expired' 
                      : countdown.daysRemaining > 0 
                      ? `${countdown.daysRemaining} days remaining`
                      : `${countdown.hoursRemaining} hours remaining`
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Billing Cycle Countdown */}
          {countdown && !countdown.isExpired && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Billing Cycle</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  countdown.isExpiringSoon 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {countdown.billingCycle.toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Days Remaining</p>
                  <p className={`text-2xl font-bold ${
                    countdown.isExpiringSoon ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {countdown.daysRemaining}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Auto Renewal</p>
                  <p className={`font-semibold ${
                    countdown.cancelAtPeriodEnd ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {countdown.cancelAtPeriodEnd ? 'Disabled' : 'Enabled'}
                  </p>
                </div>
              </div>
              
              {countdown.isExpiringSoon && (
                <div className="mt-3 p-2 bg-red-50 rounded-lg">
                  <p className="text-red-800 text-xs font-medium">
                    ⚠️ Your subscription expires soon. Renew to avoid service interruption.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Subscription Actions */}
          {currentSubscription.status === 'active' && !currentSubscription.cancelAtPeriodEnd && (
            <div className="mt-4 pt-4 border-t border-app-border">
              <button
                onClick={handleCancelSubscription}
                disabled={isProcessing}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Cancel Subscription
              </button>
            </div>
          )}
          
          {currentSubscription.cancelAtPeriodEnd && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 text-sm">
                Your subscription is scheduled for cancellation at the end of the current period.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-3">
          <Shield size={24} className="text-brand-blue" />
          Available Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan: any, index: number) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group relative p-8 rounded-3xl border-2 transition-all duration-500 overflow-hidden ${
                currentSubscription?.planId?._id === plan._id
                  ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-2xl shadow-green-500/20'
                  : 'border-app-border bg-app-surface hover:border-brand-blue hover:shadow-2xl hover:shadow-brand-blue/10 hover:-translate-y-2'
              }`}
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-purple-500/5 to-brand-orange/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              
              {/* Current Plan Badge */}
              {currentSubscription?.planId?._id === plan._id && (
                <div className="absolute -top-3 -right-3 bg-green-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                  <Crown size={12} className="inline mr-1" />
                  CURRENT
                </div>
              )}
              <div className="relative z-10 text-center mb-8">
                <h3 className="text-2xl font-bold text-text-primary group-hover:text-brand-blue transition-colors mb-4">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
                    ${plan.price / 100}
                  </span>
                  <span className="text-text-secondary text-lg">/{plan.duration}</span>
                </div>
                {plan.description && (
                  <p className="text-sm text-text-secondary">{plan.description}</p>
                )}
              </div>

            <ul className="space-y-2 mb-6">
              {plan.features?.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan._id)}
              disabled={isProcessing || (currentSubscription?.planId?._id === plan._id && !isRestricted()) || organization?.status === 'inactive'}
              className={`w-full py-3 px-4 rounded-2xl font-semibold transition-all ${
                organization?.status === 'inactive'
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : currentSubscription?.planId?._id === plan._id && !isRestricted()
                  ? 'bg-green-100 text-green-800 cursor-not-allowed'
                  : 'btn-gradient hover:shadow-lg disabled:opacity-50'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin" />
                  Processing...
                </div>
              ) : organization?.status === 'inactive' ? (
                'Contact Support'
              ) : currentSubscription?.planId?._id === plan._id && !isRestricted() ? (
                'Current Plan'
              ) : isRestricted() && currentSubscription?.planId?._id === plan._id ? (
                'Reactivate Plan'
              ) : (
                'Select Plan'
              )}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Usage Statistics */}
      <div className="mb-8 p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-purple-200 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Eye size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Usage Statistics</h2>
              <p className="text-text-secondary">Current month usage and limits</p>
            </div>
          </div>
          <button
            onClick={() => setShowUsageStats(!showUsageStats)}
            className="px-4 py-2 bg-purple-100 text-purple-800 rounded-xl hover:bg-purple-200 transition-colors text-sm font-medium"
          >
            {showUsageStats ? 'Hide' : 'Show'} Details
          </button>
        </div>
        
        {showUsageStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Properties</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{usageStats?.usage?.properties || 0}</div>
              <div className="text-xs text-gray-500">of {usageStats?.limits?.properties || 0} limit</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${usageStats?.utilizationPercentage?.properties || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">Tenants</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{usageStats?.usage?.tenants || 0}</div>
              <div className="text-xs text-gray-500">of {usageStats?.limits?.tenants || 0} limit</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${usageStats?.utilizationPercentage?.tenants || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Users</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{usageStats?.usage?.users || 0}</div>
              <div className="text-xs text-gray-500">of {usageStats?.limits?.users || 0} limit</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${usageStats?.utilizationPercentage?.users || 0}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Download size={16} className="text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Exports</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{usageStats?.usage?.exports || 0}</div>
              <div className="text-xs text-gray-500">of {usageStats?.limits?.exports || 0} limit</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.round(((usageStats?.usage?.exports || 0) / (usageStats?.limits?.exports || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Billing Information */}
      <div className="mb-8 p-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl border-2 border-gray-200 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <CreditCard size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Billing Information</h2>
            <p className="text-text-secondary">Payment method and billing details</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Payment Method
            </label>
            <div className="p-3 border border-app-border rounded-xl bg-app-bg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-text-secondary" />
                  <span className="text-sm text-text-secondary">
                    {currentSubscription?.paymentMethod || 'No payment method on file'}
                  </span>
                </div>
                <button className="text-xs text-brand-blue hover:underline">
                  Update
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Billing Email
            </label>
            <div className="p-3 border border-app-border rounded-xl bg-app-bg">
              <span className="text-sm text-text-secondary">{user?.email}</span>
            </div>
          </div>
        </div>
        
        {/* Billing Summary */}
        <div className="mt-6 pt-6 border-t border-app-border">
          <h3 className="font-semibold text-text-primary mb-3">Billing Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Current Plan</span>
              <span className="font-medium">{currentSubscription?.planId?.name || 'Free Trial'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Amount</span>
              <span className="font-medium">${(currentSubscription?.amount || 0) / 100}/{currentSubscription?.billingCycle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Last Payment</span>
              <span className="font-medium">
                {currentSubscription?.lastPaymentDate 
                  ? new Date(currentSubscription.lastPaymentDate).toLocaleDateString()
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Billing History */}
      <div className="p-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl border-2 border-orange-200 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Archive size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Billing History</h2>
              <p className="text-text-secondary">Past invoices and payment records</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBillingHistory(!showBillingHistory)}
              className="px-4 py-2 bg-orange-100 text-orange-800 rounded-xl hover:bg-orange-200 transition-colors text-sm font-medium"
            >
              {showBillingHistory ? 'Hide' : 'Show'} History
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-medium shadow-lg">
              <Download size={16} />
              Download All
            </button>
          </div>
        </div>
        
        {showBillingHistory && (
          <div className="space-y-4">
            {/* Mock billing history - replace with real data */}
            {currentSubscription?.lastPaymentDate && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Check size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-text-primary text-lg">
                        {currentSubscription.planId?.name || 'Subscription'}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {new Date(currentSubscription.lastPaymentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-text-primary text-xl">
                      ${(currentSubscription.amount || 0) / 100}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        PAID
                      </span>
                      <button className="text-xs text-brand-blue hover:underline font-medium">
                        Download Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!currentSubscription?.lastPaymentDate && (
              <div className="text-center py-12 bg-white rounded-2xl">
                <Archive size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-text-secondary text-lg">No billing history available</p>
                <p className="text-text-secondary text-sm mt-2">Payment records will appear here after your first transaction</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Role-based Access Notice */}
      {user?.role === 'Agent' && (
        <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={24} className="text-yellow-600" />
            <h3 className="text-lg font-bold text-yellow-800">Agent Access Notice</h3>
          </div>
          <p className="text-yellow-700">
            As an agent, you have view-only access to billing information. 
            Contact your organization's landlord to make changes to the subscription or billing details.
          </p>
        </div>
      )}
      
      {user?.role === 'Tenant' && (
        <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <Users size={24} className="text-blue-600" />
            <h3 className="text-lg font-bold text-blue-800">Tenant Portal Access</h3>
          </div>
          <p className="text-blue-700">
            Your access to the tenant portal is managed by your landlord's subscription. 
            Contact your landlord if you experience any access issues.
          </p>
        </div>
      )}
      
      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <button
          onClick={() => setShowUsageStats(!showUsageStats)}
          className="w-16 h-16 gradient-dark-orange-blue rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 group"
        >
          <Eye size={24} className="text-white group-hover:scale-110 transition-transform duration-300" />
        </button>
      </div>
      
      {/* Modern Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-blue/5 to-brand-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-brand-orange/5 to-brand-blue/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/3 to-pink-500/3 rounded-full blur-3xl"></div>
      </div>
    </motion.div>
  );
};

export default BillingPage;