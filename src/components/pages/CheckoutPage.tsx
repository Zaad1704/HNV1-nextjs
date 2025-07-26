'use client';
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Check, ArrowLeft } from 'lucide-react';
import apiClient from '@/lib/api';

const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const router = useRouter();
  const planId = searchParams.get('plan');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const { data: plan, isLoading } = useQuery({
    queryKey: ['plan', planId],
    queryFn: async () => {
      const response = await apiClient.get(`/plans/${planId}`);
      return response.data.data;
    },
    enabled: !!planId
  });

  const paymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiClient.post('/integrations/payment/intent', {
        planId,
        amount: plan.price / 100, // Convert from cents
        currency: 'usd',
        description: `Subscription to ${plan.name} plan`
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout or handle client secret
      if (data.data.url) {
        window.location.href = data.data.url;
      } else {
        // Handle payment intent client secret for custom checkout

      }
    },
    onError: (error: any) => {
      alert(`Payment failed: ${error.response?.data?.message || error.message}`);
    }
  });

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!planId) return;
    
    paymentMutation.mutate({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        <span className="ml-3 text-gray-600">Loading checkout...</span>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Plan not found</h2>
          <button
            onClick={() => router.push('/pricing')}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => router.push(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-8 shadow-sm border h-fit"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="border border-gray-200 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name} Plan</h3>
                  <p className="text-gray-600">Billed {plan.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">${plan.price}</p>
                  <p className="text-gray-600">/{plan.duration}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {plan.features?.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check size={16} className="text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>${plan.price}</span>
              </div>
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-8 shadow-sm border"
          >
            <div className="flex items-center gap-2 mb-6">
              <Lock size={20} className="text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">Secure Payment</h2>
            </div>

            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-blue-300">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-blue-500"
                    />
                    <CreditCard size={20} className="text-gray-600" />
                    <span className="font-medium">Credit/Debit Card</span>
                  </label>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock size={16} />
                  <span>Your payment information is encrypted and secure</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={paymentMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {paymentMutation.isPending ? 'Processing...' : `Pay $${plan.price}`}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;