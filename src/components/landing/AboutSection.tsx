import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, TrendingUp, Clock } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useTranslation } from 'react-i18next';

const AboutSection = () => {
  const { data: settings } = useSiteSettings();
  const { t } = useTranslation();
  
  const defaultFeatures = [
    {
      icon: Shield,
      title: t('features.secure_reliable', 'Secure & Reliable'),
      description: t('features.secure_reliable_desc', 'Bank-level security with 99.9% uptime guarantee')
    },
    {
      icon: Users,
      title: t('features.tenant_management', 'Tenant Management'),
      description: t('features.tenant_management_desc', 'Streamline tenant communications and lease management')
    },
    {
      icon: TrendingUp,
      title: t('features.financial_insights', 'Financial Insights'),
      description: t('features.financial_insights_desc', 'Track revenue, expenses, and profitability in real-time')
    },
    {
      icon: Clock,
      title: t('features.support_247', '24/7 Support'),
      description: t('features.support_247_desc', 'Round-the-clock customer support when you need it')
    }
  ];
  
  // Use live data if available, otherwise use defaults
  const features = settings?.featuresPage?.features?.length > 0 
    ? settings.featuresPage.features.map((feature, index) => ({
        icon: [Shield, Users, TrendingUp, Clock][index % 4],
        title: feature.title,
        description: feature.description
      }))
    : defaultFeatures;

  return (
    <section className="py-20 bg-app-bg">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-text-primary mb-4">
            {settings?.featuresPage?.title || t('about.title', 'Why Choose Our Platform?')}
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {settings?.featuresPage?.subtitle || t('about.subtitle', 'Built for modern property managers who demand efficiency, security, and growth.')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 gradient-dark-orange-blue rounded-2xl flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform">
                <feature.icon size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-text-secondary">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;