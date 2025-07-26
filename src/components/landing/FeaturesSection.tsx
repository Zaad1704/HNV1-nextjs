import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { IFeaturesPage } from '@/types/siteSettings';
import { Shield, Users, TrendingUp, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FeaturesSectionProps {
  data?: IFeaturesPage;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = React.memo(({ data }) => {
  const { t } = useTranslation();
  
  const defaultFeatures = useMemo(() => [
    {
      icon: 'Shield',
      title: t('features.secure_reliable', 'Secure & Reliable'),
      text: t('features.secure_reliable_desc', 'Bank-level security with 99.9% uptime guarantee'),
      sectionId: 'security'
    },
    {
      icon: 'Users',
      title: t('features.tenant_management', 'Tenant Management'),
      text: t('features.tenant_management_desc', 'Streamline tenant communications and lease management'),
      sectionId: 'tenants'
    },
    {
      icon: 'TrendingUp',
      title: t('features.financial_insights', 'Financial Insights'),
      text: t('features.financial_insights_desc', 'Track revenue, expenses, and profitability in real-time'),
      sectionId: 'analytics'
    },
    {
      icon: 'Clock',
      title: t('features.support_247', '24/7 Support'),
      text: t('features.support_247_desc', 'Round-the-clock customer support when you need it'),
      sectionId: 'support'
    }
  ], [t]);

  const features = data?.features || defaultFeatures;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return Shield;
      case 'Users': return Users;
      case 'TrendingUp': return TrendingUp;
      case 'Clock': return Clock;
      default: return Shield;
    }
  };

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
            {data?.title || t('features.title', 'Powerful Features')}
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {data?.subtitle || t('features.subtitle', 'Everything you need to manage properties efficiently')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature: any, index: number) => {
            const IconComponent = getIcon(feature.icon);
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 app-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <IconComponent size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary">
                  {feature.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

export default FeaturesSection;