import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

const TransformSection = () => {
  const { t } = useTranslation();

  const benefits = [
    t('features.property_management', 'Property Management'),
    t('features.tenant_management', 'Tenant Management'), 
    t('features.financial_tracking', 'Financial Tracking'),
    t('features.automated_reminders', 'Automated Reminders')
  ];

  return (
    <section id="transform" className="py-12 md:py-20 bg-gradient-to-br from-brand-orange/10 to-brand-blue/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-6">
              {t('landscape.title', 'Transform Your Property Management')}
            </h2>
            <p className="text-lg md:text-xl text-text-secondary mb-8 leading-relaxed">
              {t('landscape.subtitle', 'Experience the future of property management with our comprehensive platform')}
            </p>
            
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle className="text-brand-blue w-5 h-5 flex-shrink-0" />
                  <span className="text-text-primary">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-orange to-brand-blue text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold text-base md:text-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              {t('landing.hero_cta', 'Start Your Free Trial')}
              <ArrowRight size={20} />
            </Link>
          </motion.div>

          {/* Right Content - Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/about.jpg"
                alt={t('landscape.image_alt', 'Property Management Platform')}
                className="w-full h-64 md:h-80 lg:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TransformSection;