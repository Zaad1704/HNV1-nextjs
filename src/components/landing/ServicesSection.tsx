// frontend/src/components/landing/ServicesSection.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Users, Home, CreditCard } from "lucide-react";

export default function ServicesSection() {
  const { t } = useTranslation();

  const services = [
    {
      icon: <Users width="48" height="48" />,
      title: t('services.tenant_management_title'),
      description: t('services.tenant_management_desc')
    },
    {
      icon: <Home width="48" height="48" />,
      title: t('services.property_tracking_title'),
      description: t('services.property_tracking_desc')
    },
    {
      icon: <CreditCard width="48" height="48" />,
      title: t('services.rent_collection_title'),
      description: t('services.rent_collection_desc')
    }
  ];

  return (
    <section id="services" className="py-16 md:py-24 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark-text dark:text-dark-text-dark">
            {t('services.title')}
          </h2>
          <p className="text-lg text-light-text dark:text-light-text-dark max-w-2xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-border-color dark:border-border-color-dark">
              <div className="text-brand-primary dark:text-brand-secondary mb-4 transition-colors">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark mb-2">
                {service.title}
              </h3>
              <p className="text-light-text dark:text-light-text-dark">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
