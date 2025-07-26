'use client';
import React from 'react';
import { motion } from 'framer-motion';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-app-bg py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="app-surface rounded-3xl p-8 border border-app-border"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none text-text-secondary space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using HNV Property Management Solutions, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">2. Use License</h2>
              <p>Permission is granted to temporarily use HNV Property Management Solutions for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">3. Service Description</h2>
              <p>HNV Property Management Solutions provides a comprehensive platform for property management including tenant management, payment processing, maintenance tracking, and financial reporting.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">4. User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Provide accurate and up-to-date information</li>
                <li>Use the service in compliance with applicable laws</li>
                <li>Not engage in any unauthorized or illegal activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">5. Privacy Policy</h2>
              <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">6. Limitation of Liability</h2>
              <p>In no event shall HNV Property Management Solutions be liable for any damages arising out of the use or inability to use the service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">7. Contact Information</h2>
              <p>If you have any questions about these Terms of Service, please contact us at legal@hnvpm.com</p>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-app-border text-sm text-text-muted">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage;