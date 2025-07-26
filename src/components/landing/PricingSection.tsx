import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useCurrencyRates, convertPrice, formatCurrency } from '@/services/currencyService';
import { useCurrency } from '@/contexts/CurrencyContext';

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
    return data.data || [];
  } catch (error) {
    console.warn('Plans API failed, using defaults');
    return [];
  }
};

const fetchSiteSettings = async () => {
  try {
    const { data } = await apiClient.get('/public/site-settings');
    return data.data;
  } catch (error) {
    return {};
  }
};

const PricingSection = () => {
  const { currencyCode } = useCurrency();
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['publicPlans'],
    queryFn: fetchPlans,
    retry: false,
    refetchOnWindowFocus: false
  });
  const { data: siteSettings = {} } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: fetchSiteSettings,
    retry: false
  });
  const { data: exchangeRates = {}, isLoading: ratesLoading } = useCurrencyRates();

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' }
  ];

  // Convert price from cents to dollars for display
  const pricingPlans = plans.map(plan => ({
    ...plan,
    price: plan.price / 100 // Convert cents to dollars
  }));

  if (isLoading) {
    return (
      <section id="pricing" className="py-20 bg-app-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="w-8 h-8 app-gradient rounded-full animate-pulse mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading pricing plans...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="py-20 bg-app-bg">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-text-primary mb-4">
            {siteSettings.pricingTitle || 'Simple, Transparent Pricing'}
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {siteSettings.pricingSubtitle || 'Choose the plan that fits your portfolio size and needs.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan: Plan, index: number) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative app-surface rounded-3xl p-8 border transition-all duration-300 hover:shadow-app-xl ${
                plan.isPopular 
                  ? 'border-brand-orange shadow-app-lg scale-105 gradient-dark-orange-blue text-white' 
                  : 'border-app-border hover:border-brand-orange'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-brand-orange px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
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
                    {currencyCode === 'USD' 
                      ? `$${plan.price}` 
                      : formatCurrency(
                          convertPrice(plan.price, 'USD', currencyCode, exchangeRates),
                          currencyCode
                        )
                    }
                  </span>
                  <span className={`${
                    plan.isPopular ? 'text-gray-200' : 'text-text-secondary'
                  }`}>
                    /{plan.duration}
                  </span>
                  {currencyCode !== 'USD' && !ratesLoading && (
                    <div className={`text-sm mt-1 ${
                      plan.isPopular ? 'text-gray-300' : 'text-text-muted'
                    }`}>
                      ≈ ${plan.price} USD
                    </div>
                  )}
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
                className={`w-full block text-center py-3 px-6 rounded-2xl font-semibold transition-all hover:transform hover:scale-105 ${
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
      </div>
    </section>
  );
};

export default PricingSection;