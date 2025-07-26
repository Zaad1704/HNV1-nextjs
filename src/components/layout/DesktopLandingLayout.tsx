import React from 'react';
import Link from 'next/link';
import { ISiteSettings } from '@/types/siteSettings';
import AboutSection from '@/landing/AboutSection';
import ServicesSection from '@/landing/ServicesSection';
import PricingSection from '@/landing/PricingSection'; 
import InstallAppSection from '@/landing/InstallAppSection';
import ContactSection from '@/landing/ContactSection';
import LandingHeroContent from '@/landing/LandingHeroContent';
import LeadershipSection from '@/landing/LeadershipSection';
import { Home, ShieldCheck, Briefcase, Star, Lock, Wrench, Users, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const IconMap: { [key: string]: React.ElementType } = {
    "briefcase": Briefcase,
    "lock": Lock,
    "shield-check": ShieldCheck,
    "home": Home,
    "users": Users,
    "credit-card": CreditCard,
    "wrench": Wrench,
};

const getFeatureIconComponent = (iconName: string): React.ElementType => {
    return IconMap[iconName.toLowerCase()] || Star;
};

const DesktopLandingLayout: React.FC<{ settings: ISiteSettings; plans?: any[] }> = ({ settings }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-light-bg dark:bg-dark-bg text-dark-text dark:text-dark-text-dark transition-colors duration-300">
            {/* Hero Section */}
            <section id="hero">
                <LandingHeroContent />
            </section>

            {/* Features Section */}
            <section id="featuresPage" className="py-20 md:py-28 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold text-dark-text dark:text-dark-text-dark">{settings.featuresPage?.title}</h2>
                    <p className="mt-4 text-light-text dark:text-light-text-dark max-w-2xl mx-auto">{settings.featuresPage?.subtitle}</p>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {settings.featuresPage?.features?.map((feature, index) => {
                            const IconComponent = getFeatureIconComponent(feature.icon);
                            const isLinkable = !!feature.sectionId;

                            return (
                                <a
                                    key={index}
                                    href={isLinkable ? `#${feature.sectionId}` : undefined}
                                    onClick={isLinkable ? (e) => { 
                                        e.preventDefault(); 
                                        document.getElementById(feature.sectionId)?.scrollIntoView({ behavior: 'smooth' }); 
                                    } : undefined}
                                    className={`block bg-light-card dark:bg-dark-card p-8 rounded-2xl border border-border-color dark:border-border-color-dark shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ${isLinkable ? 'cursor-pointer' : ''}`}
                                >
                                    <div className="text-brand-primary dark:text-brand-secondary mb-4 transition-colors">
                                        <IconComponent className="w-12 h-12" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-dark-text dark:text-dark-text-dark mb-2">{feature.title}</h3>
                                    <p className="text-light-text dark:text-light-text-dark">{feature.text}</p>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Other Sections */}
            <AboutSection />
            <ServicesSection />
            <LeadershipSection />
            <PricingSection />
            <InstallAppSection />
            <ContactSection />
        </div>
    );
};

export default DesktopLandingLayout;