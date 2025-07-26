'use client';
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, CreditCard, ArrowLeft } from 'lucide-react';

const PaymentSummaryPage = () => {
  const { planId } = useParams();

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full app-surface rounded-3xl p-8 border border-app-border shadow-app-lg text-center"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-text-primary mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-text-secondary mb-8">
          Your subscription has been activated. Welcome to HNV Property Management!
        </p>

        <div className="bg-app-bg rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-secondary">Plan:</span>
            <span className="font-semibold text-text-primary">Professional</span>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-text-secondary">Billing:</span>
            <span className="font-semibold text-text-primary">Monthly</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Next billing:</span>
            <span className="font-semibold text-text-primary">
              {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="w-full btn-gradient py-3 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            Go to Dashboard
          </Link>
          
          <Link
            to="/dashboard/billing"
            className="w-full py-3 rounded-2xl font-semibold border border-app-border text-text-secondary hover:text-text-primary hover:bg-app-bg transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard size={16} />
            View Billing
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSummaryPage;