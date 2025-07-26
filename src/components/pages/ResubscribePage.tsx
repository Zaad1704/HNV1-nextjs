'use client';
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, CreditCard, ArrowRight } from 'lucide-react';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

const ResubscribePage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['availablePlans'],
    queryFn: async () => {
      const { data } = await apiClient.get('/subscription/plans');
      return data.data || [];
    }
  });

  const { data: currentSubscription } = useQuery({
    queryKey: ['subscriptionStatus'],
    queryFn: async () => {
      const { data } = await apiClient.get('/subscription/status');
      return data.data;
    }
  });

  const reactivateMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data } = await apiClient.post('/subscription/reactivate', { planId });
      return data.data;
    },
    onSuccess: () => {
      router.push('/dashboard');
    }
  });

  const activateMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data } = await apiClient.post('/subscription/activate', { planId });
      return data.data;
    },
    onSuccess: () => {
      router.push('/dashboard');
    }
  });

  const handleSubscribe = (planId: string) => {
    if (currentSubscription?.hasSubscription) {
      reactivateMutation.mutate(planId);
    } else {
      activateMutation.mutate(planId);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading plans...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 py-12"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {currentSubscription?.hasSubscription ? 'Reactivate Your Subscription' : 'Choose Your Plan'}
          </h1>
          <p className="text-xl text-gray-600">
            Get back to managing your properties with full access
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans?.map((plan: any) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl p-8 border-2 transition-all ${
                selectedPlan === plan._id 
                  ? 'border-blue-500 shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
              } ${plan.isPopular ? 'ring-2 ring-blue-500' : ''}`}
            >
              {plan.isPopular && (
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${plan.price / 100}</span>
                <span className="text-gray-600">/{plan.duration}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features?.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  setSelectedPlan(plan._id);
                  handleSubscribe(plan._id);
                }}
                disabled={reactivateMutation.isPending || activateMutation.isPending}
                className={`w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedPlan === plan._id
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {(reactivateMutation.isPending || activateMutation.isPending) && selectedPlan === plan._id ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CreditCard size={20} />
                    {currentSubscription?.hasSubscription ? 'Reactivate' : 'Subscribe'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {currentSubscription?.hasSubscription && (
          <div className="mt-12 bg-blue-50 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Welcome Back!
            </h3>
            <p className="text-blue-700">
              Your previous subscription was {currentSubscription.status}. 
              Reactivating will restore full access to all features.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ResubscribePage;