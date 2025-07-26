'use client';
import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-app-bg py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="app-surface rounded-3xl p-8 border border-app-border"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none text-text-secondary space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Personal information (name, email, phone number)</li>
                <li>Property and tenant information</li>
                <li>Payment and billing information</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">3. Information Sharing</h2>
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">4. Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your personal information</li>
                <li>Object to processing of your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">6. Cookies</h2>
              <p>We use cookies and similar technologies to enhance your experience, analyze usage, and assist in our marketing efforts.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text-primary mb-4">7. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at privacy@hnvpm.com</p>
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

export default PrivacyPolicyPage;