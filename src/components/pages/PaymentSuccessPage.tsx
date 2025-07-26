'use client';
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const router = useRouter();
  const externalReference = searchParams.get('ref');
  const orderId = searchParams.get('order_id');

  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/billing/payment-success', {
        externalReference,
        twocheckoutOrderId: orderId
      });
      return data;
    },
    onSuccess: () => {
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    },
    onError: (error: any) => {
      console.error('Payment processing error:', error);
    }
  });

  useEffect(() => {
    if (externalReference) {
      processPaymentMutation.mutate();
    }
  }, [externalReference]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-12 text-center shadow-2xl max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle size={48} className="text-green-600" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          Payment Successful!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-8 text-lg"
        >
          {processPaymentMutation.isPending 
            ? 'Processing your payment...'
            : processPaymentMutation.isError
            ? 'Payment received, but there was an issue activating your subscription. Please contact support.'
            : 'Your subscription has been activated successfully!'
          }
        </motion.p>

        {processPaymentMutation.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mb-8"
          >
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <Home size={20} />
            Go to Dashboard
            <ArrowRight size={20} />
          </button>

          <button
            onClick={() => router.push('/billing')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-2xl font-medium hover:bg-gray-200 transition-colors"
          >
            View Billing Details
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-4 bg-green-50 rounded-2xl"
        >
          <p className="text-sm text-green-800">
            <strong>What's next?</strong><br />
            You now have full access to all features. Start managing your properties, tenants, and payments!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;