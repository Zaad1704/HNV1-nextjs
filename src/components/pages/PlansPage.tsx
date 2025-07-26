'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Crown, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface Plan {
  _id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  isPopular: boolean;
  isPublic: boolean;
}

const fetchPlans = async (): Promise<Plan[]> => {
  const { data } = await apiClient.get('/public/plans');
  return data.data || [];
};

const PlansPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['publicPlans'],
    queryFn: fetchPlans
  });

  const subscribeMutation = useMutation({
    mutationFn: (planId: string) => apiClient.post('/billing/subscribe', { planId }),
    onSuccess: (data) => {
      if (data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        router.push('/dashboard');
      }
    }
  });

  const handleSubscribe = (planId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    subscribeMutation.mutate(planId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 app-gradient rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Choose Your Plan
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Select the perfect plan for your property management needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative app-surface rounded-3xl p-8 border transition-all duration-300 hover:shadow-app-xl ${
                plan.isPopular 
                  ? 'border-brand-orange shadow-app-lg scale-105 gradient-dark-orange-blue text-white' 
                  : 'border-app-border hover:border-brand-orange'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-brand-orange px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                    <Crown size={16} />
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${
                  plan.isPopular ? 'text-white' : 'text-text-primary'
                }`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${
                    plan.isPopular ? 'text-white' : 'text-text-primary'
                  }`}>
                    ${(plan.price / 100).toFixed(2)}
                  </span>
                  <span className={`${
                    plan.isPopular ? 'text-gray-200' : 'text-text-secondary'
                  }`}>
                    /{plan.duration}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.isPopular 
                        ? 'bg-white/20' 
                        : 'bg-green-100'
                    }`}>
                      <Check size={12} className={`${
                        plan.isPopular ? 'text-white' : 'text-green-600'
                      }`} />
                    </div>
                    <span className={`${
                      plan.isPopular ? 'text-gray-100' : 'text-text-secondary'
                    }`}>
                      {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan._id)}
                disabled={subscribeMutation.isPending}
                className={`w-full py-3 px-6 rounded-2xl font-semibold transition-all hover:transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2 ${
                  plan.isPopular
                    ? 'bg-white text-brand-orange hover:bg-gray-100'
                    : 'gradient-dark-orange-blue text-white hover:shadow-lg'
                }`}
              >
                {subscribeMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Get Started
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-text-secondary mb-4">
            Need a custom solution? 
          </p>
          <button
            onClick={() => router.push('/contact')}
            className="text-brand-orange hover:text-brand-blue font-semibold"
          >
            Contact our sales team
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PlansPage;