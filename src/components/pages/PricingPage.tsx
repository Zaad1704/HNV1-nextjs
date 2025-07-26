'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

interface Plan {
  _id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
  isPublic: boolean;
}

const fetchPlans = async (): Promise<Plan[]> => {
  try {
    const { data } = await apiClient.get('/public/plans');
    return data.data;
  } catch (error) {
    return [];
  }
};

const PricingPage = () => {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['publicPlans'],
    queryFn: fetchPlans
  });

  const pricingPlans = plans.map(plan => ({
    ...plan,
    price: plan.price / 100 // Convert cents to dollars
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 app-gradient rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading pricing plans...</p>
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
          <h1 className="text-5xl font-bold text-text-primary mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Choose the plan that fits your portfolio size and needs. All plans include our core features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan: Plan, index: number) => (
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
                  <div className="bg-white text-brand-orange px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                    <Star size={16} />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className={`text-2xl font-bold mb-2 ${
                  plan.isPopular ? 'text-white' : 'text-text-primary'
                }`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-5xl font-bold ${
                    plan.isPopular ? 'text-white' : 'text-text-primary'
                  }`}>
                    ${plan.price}
                  </span>
                  <span className={`text-lg ${
                    plan.isPopular ? 'text-gray-200' : 'text-text-secondary'
                  }`}>
                    /{plan.duration}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature: string, featureIndex: number) => (
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
                    }`}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={`/register?plan=${plan._id}`}
                className={`w-full block text-center py-4 px-6 rounded-2xl font-semibold text-lg transition-all hover:transform hover:scale-105 ${
                  plan.isPopular
                    ? 'bg-white text-brand-orange hover:bg-gray-100'
                    : 'gradient-dark-orange-blue text-white hover:shadow-lg'
                }`}
              >
                Get Started
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-text-secondary mb-8">
            Need a custom solution? <Link to="/contact" className="text-brand-blue hover:underline font-semibold">Contact our sales team</Link>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 app-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-white" />
              </div>
              <h4 className="font-semibold text-text-primary mb-2">30-Day Free Trial</h4>
              <p className="text-text-secondary text-sm">Try all features risk-free</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 app-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-white" />
              </div>
              <h4 className="font-semibold text-text-primary mb-2">No Setup Fees</h4>
              <p className="text-text-secondary text-sm">Get started immediately</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 app-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-white" />
              </div>
              <h4 className="font-semibold text-text-primary mb-2">Cancel Anytime</h4>
              <p className="text-text-secondary text-sm">No long-term contracts</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;