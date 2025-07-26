import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Building2, Users, CreditCard, BarChart3, ArrowRight, Play } from 'lucide-react';

const HeroSection = () => {
  const { t } = useTranslation();
  const { data: settings = {} } = useSiteSettings();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center bg-app-bg overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 to-brand-blue/5"></div>
      <div className="absolute top-20 right-10 w-72 h-72 bg-brand-orange/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <img 
                src="/logo-min.png" 
                alt="HNV Property Management Solutions - Professional property management platform logo" 
                className="w-16 h-16 object-contain"
                loading="eager"
              />
              <div className="text-2xl font-bold gradient-dark-orange-blue bg-clip-text text-transparent">
                {settings?.logos?.companyName || 'HNV Property Management Solutions'}
              </div>
            </div>
            <div className="gradient-dark-orange-blue rounded-3xl p-8 mb-8 shadow-app-xl border border-white/20">
              <h1 className="text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                {settings?.heroSection?.title || t('landing.hero_title')}
              </h1>
              <h2 className="text-3xl text-white/90 mb-4 drop-shadow-md">
                {t('hero.subtitle')}
              </h2>
              <p className="text-xl text-white/80 leading-relaxed drop-shadow-sm">
                {settings?.heroSection?.subtitle || t('landing.hero_subtitle')}
              </p>
            </div>
            <div className="flex gap-4">
              <Link 
                to="/register" 
                className="gradient-dark-orange-blue text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-2 hover:shadow-xl hover:scale-105 transition-all shadow-lg"
              >
                {t('landing.hero_cta')}
                <ArrowRight size={20} />
              </Link>
              <button 
                onClick={() => scrollToSection('about')}
                className="flex items-center gap-2 px-8 py-4 rounded-full border-2 border-app-border text-text-primary hover:bg-app-surface hover:scale-105 transition-all shadow-md"
              >
                <Play size={20} />
                {t('common.learn_more', 'Learn More')}
              </button>
            </div>
          </motion.div>

          {/* Right Content - Custom Image or Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {settings?.heroSection?.bannerImage ? (
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={settings.heroSection.bannerImage}
                  alt="HNV Property Management Banner"
                  className="w-full h-96 object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Building2, title: t('dashboard.properties'), color: 'gradient-dark-orange-blue', section: 'features' },
                  { icon: Users, title: t('dashboard.tenants'), color: 'gradient-orange-blue', section: 'services' },
                  { icon: CreditCard, title: t('dashboard.payments'), color: 'gradient-dark-orange-blue', section: 'pricing' },
                  { icon: BarChart3, title: t('common.analytics'), color: 'gradient-orange-blue', section: 'about' }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="app-surface p-6 rounded-3xl border border-app-border hover:shadow-app-lg transition-all cursor-pointer hover:scale-105"
                    onClick={() => scrollToSection(item.section)}
                  >
                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                      <item.icon size={24} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-text-primary">{item.title}</h3>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Mobile Layout - Native App Style */}
        <div className="md:hidden text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo for Mobile */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <img 
                src="/logo-min.png" 
                alt="HNV Property Management Solutions logo" 
                className="w-12 h-12 object-contain"
                loading="eager"
              />
              <div className="text-xl font-bold gradient-dark-orange-blue bg-clip-text text-transparent">
                {settings?.logos?.companyName || 'HNV Property Management Solutions'}
              </div>
            </div>
            
            {/* Custom Image for Mobile */}


            <h1 className="text-4xl font-bold text-text-primary mb-4 leading-tight px-4">
              {settings?.heroSection?.title || t('landing.hero_title')}
            </h1>
            <p className="text-lg text-text-secondary mb-8 px-6 leading-relaxed">
              {settings?.heroSection?.subtitle || t('landing.hero_subtitle')}
            </p>

            {/* Mobile CTA Buttons */}
            <div className="space-y-4 px-6">
              <Link 
                to="/register" 
                className="w-full gradient-dark-orange-blue text-white py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                {t('landing.hero_cta')}
                <ArrowRight size={20} />
              </Link>
              <button 
                onClick={() => scrollToSection('about')}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-full border border-app-border text-text-primary bg-app-surface/50 backdrop-blur-sm"
              >
                <Play size={20} />
                {t('common.learn_more', 'Learn More')}
              </button>
            </div>

            {/* Mobile Feature Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 grid grid-cols-2 gap-4 px-6"
            >
              {[
                { icon: Building2, title: 'Properties', section: 'features' },
                { icon: Users, title: 'Services', section: 'services' },
                { icon: CreditCard, title: 'Pricing', section: 'pricing' },
                { icon: BarChart3, title: 'About', section: 'about' }
              ].map((item, index) => (
                <motion.button
                  key={item.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  onClick={() => scrollToSection(item.section)}
                  className="app-surface p-4 rounded-2xl border border-app-border text-center hover:shadow-app-lg hover:scale-105 transition-all active:scale-95"
                >
                  <item.icon size={24} className="text-brand-orange mx-auto mb-2" />
                  <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;