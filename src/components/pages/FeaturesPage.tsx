'use client';
import React from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { CheckCircle } from 'lucide-react'; // Example icon

const FeaturesPage = () => {
  const { data: settings, isLoading, isError } = useSiteSettings();

  if (isLoading) return <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">Loading...</div>;
  if (isError || !settings) return <div className="text-red-500 text-center p-8 dark:text-red-500">Error loading content.</div>;
  
  return (
    <div className="py-20 bg-light-bg text-dark-text dark:bg-dark-bg dark:text-dark-text-dark transition-colors duration-300">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold">{settings.featuresPage?.title}</h1>
        <p className="text-light-text dark:text-light-text-dark mt-4 max-w-2xl mx-auto">{settings.featuresPage?.subtitle}</p>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {settings.featuresPage?.features.map((feature, index) => (
            <div key={index} className="bg-light-card dark:bg-dark-card/70 p-8 rounded-xl border border-border-color dark:border-border-color-dark shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-200">
              <CheckCircle className="w-8 h-8 text-brand-primary dark:text-brand-secondary mb-4 transition-colors" />
              <h3 className="text-2xl font-bold text-dark-text dark:text-dark-text-dark mb-2">{feature.title}</h3>
              <p className="text-light-text dark:text-light-text-dark">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default FeaturesPage;
