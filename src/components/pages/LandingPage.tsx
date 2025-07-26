'use client';
'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Shield, Zap, Users } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
              Property Management
              <span className="block text-brand-blue">Made Simple</span>
            </h1>
            <p className="text-xl text-text-secondary mb-8 max-w-3xl mx-auto">
              Streamline your property management with our comprehensive platform. 
              Manage tenants, collect rent, track expenses, and grow your portfolio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="btn-gradient px-8 py-4 text-lg font-semibold rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                Get Started Free
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 text-lg font-semibold rounded-2xl border border-app-border bg-app-surface text-text-primary hover:bg-app-bg transition-all"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-app-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-text-secondary">
              Powerful features to manage your properties efficiently
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center p-8 rounded-3xl bg-app-bg border border-app-border"
            >
              <div className="w-16 h-16 app-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Tenant Management
              </h3>
              <p className="text-text-secondary">
                Easily manage tenant information, lease agreements, and communication in one place.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center p-8 rounded-3xl bg-app-bg border border-app-border"
            >
              <div className="w-16 h-16 app-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Automated Workflows
              </h3>
              <p className="text-text-secondary">
                Automate rent collection, maintenance requests, and tenant communications.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center p-8 rounded-3xl bg-app-bg border border-app-border"
            >
              <div className="w-16 h-16 app-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-4">
                Secure & Reliable
              </h3>
              <p className="text-text-secondary">
                Bank-level security with automated backups and 99.9% uptime guarantee.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-text-secondary mb-8">
              Join thousands of property managers who trust our platform
            </p>
            <Link
              href="/register"
              className="btn-gradient px-8 py-4 text-lg font-semibold rounded-2xl inline-flex items-center gap-2 hover:shadow-lg transition-all"
            >
              Start Free Trial
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;