'use client';
import React from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const ContactPage = () => {
  const { data: settings, isLoading, isError } = useSiteSettings();

  if (isLoading) return <div className="text-center p-8 text-dark-text dark:text-dark-text-dark">Loading...</div>;
  if (isError || !settings) return <div className="text-red-500 text-center p-8 dark:text-red-500">Error loading content.</div>;
  
  return (
    <div className="py-20 bg-light-bg text-dark-text dark:bg-dark-bg dark:text-dark-text-dark transition-colors duration-300">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-center">{settings.contactPage?.title}</h1>
        <p className="text-light-text dark:text-light-text-dark mt-4 max-w-2xl mx-auto text-center">{settings.contactPage?.subtitle}</p>

        <div className="mt-16 grid md:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-light-card dark:bg-dark-card/70 p-8 rounded-xl border border-border-color dark:border-border-color-dark shadow-md transition-all duration-200">
                <h3 className="text-2xl font-bold text-dark-text dark:text-dark-text-dark mb-6">{settings.contactPage?.formTitle}</h3>
                <form className="space-y-4">
                    {/* Form fields here (assuming these would be actual inputs/textareas) */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Name</label>
                        <input type="text" id="name" className="mt-1 block w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Email</label>
                        <input type="email" id="email" className="mt-1 block w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"/>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-light-text dark:text-light-text-dark">Message</label>
                        <textarea id="message" rows={5} className="mt-1 block w-full px-4 py-2 bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark rounded-md text-dark-text dark:text-dark-text-dark focus:ring-brand-primary focus:border-brand-primary transition-all duration-200"></textarea>
                    </div>
                    <button type="submit" className="px-6 py-3 bg-brand-primary text-white font-bold rounded-lg hover:bg-brand-secondary transition-colors duration-200">Send Message</button>
                </form>
            </div>
            {/* Addresses */}
            <div className="space-y-8">
                {settings.contactPage?.addresses.map((addr, index) => (
                    <div key={index} className="bg-light-card dark:bg-dark-card/70 p-6 rounded-xl border border-border-color dark:border-border-color-dark shadow-sm transition-all duration-200">
                        <h4 className="text-xl font-bold text-brand-primary dark:text-brand-secondary">{addr.locationName}</h4>
                        <p className="text-light-text dark:text-light-text-dark mt-2">{addr.fullAddress}</p>
                        <p className="text-light-text dark:text-light-text-dark">Phone: {addr.phone}</p>
                        <p className="text-light-text dark:text-light-text-dark">Email: {addr.email}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
export default ContactPage;
