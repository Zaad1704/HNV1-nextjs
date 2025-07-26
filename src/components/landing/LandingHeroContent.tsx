// frontend/src/components/landing/HeroSection.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const LandingHeroContent = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data: settings } = useSiteSettings();

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, sectionId: string) => {
    e.preventDefault();
    // Ensure we are on the root path before attempting to scroll
    if (window.pathname !== '/') {
      router.push('/', { replace: true }); // Navigate to home, then scroll
    }
    const targetElement = document.getElementById(sectionId);
    if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <section className="relative py-20 md:py-32 flex items-center justify-center text-center overflow-hidden bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
        >
          {/* Main Hero Card */}
          <motion.div 
            className="card primary-card-gradient rounded-3xl p-8 sm:col-span-2 lg:col-span-2 lg:row-span-2 flex flex-col justify-between"
            variants={cardVariants}
            custom={0}
          >
            <div>
              <div className="w-12 h-12 bg-white/25 rounded-full mb-4"></div>
              <h1 className="text-5xl font-bold text-white leading-tight">
                {settings?.heroSection?.title || t('landing.hero_title')}
              </h1>
              <p className="text-white/80 mt-4 max-w-sm">
                {settings?.heroSection?.subtitle || t('landing.hero_subtitle')}
              </p>
            </div>
            <Link to="/register" className="btn-light font-bold py-3 px-6 rounded-lg mt-8 self-start text-sm">
                {settings?.heroSection?.ctaText || t('landing.hero_cta')}
            </Link>
          </motion.div>

          {/* Other cards from the Yartee design */}
          <motion.div 
            className="card neutral-glass rounded-3xl p-6 flex flex-col cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300" 
            variants={cardVariants} 
            custom={1}
            onClick={(e) => handleCardClick(e, 'about')}
          >
            <div className="w-full h-24 bg-brand-primary/10 rounded-xl mb-4 flex items-center justify-center text-brand-primary text-4xl font-bold">About</div>
            <h2 className="text-2xl font-bold text-dark-text dark:text-dark-text-dark">About Us</h2>
            <p className="text-light-text dark:text-light-text-dark text-sm mt-2 flex-grow">Learn more about our mission and vision.</p>
          </motion.div>

          <motion.div 
            className="card neutral-glass rounded-3xl p-6 flex flex-col cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300" 
            variants={cardVariants} 
            custom={2}
            onClick={(e) => handleCardClick(e, 'services')}
          >
            <div className="w-full h-24 bg-brand-secondary/10 rounded-xl mb-4 flex items-center justify-center text-brand-secondary text-4xl font-bold">Services</div>
            <h2 className="text-2xl font-bold text-dark-text dark:text-dark-text-dark">Our Services</h2>
            <p className="text-light-text dark:text-light-text-dark text-sm mt-2 flex-grow">Discover how we can help you manage properties.</p>
            <button className="btn-dark font-semibold py-2 px-5 rounded-lg mt-4 self-start text-sm">Explore</button>
          </motion.div>
          
          <motion.div 
            className="card secondary-card-gradient rounded-3xl p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300" 
            variants={cardVariants} 
            custom={3}
            onClick={(e) => handleCardClick(e, 'pricing')}
          >
            <div className="w-10 h-10 bg-white/25 rounded-full mb-3 flex items-center justify-center text-white text-2xl font-bold">$$</div>
            <h2 className="text-xl font-bold text-white">Pricing Plans</h2>
            <p className="text-white/80 text-sm mt-1">Find the perfect plan for your needs.</p>
          </motion.div>

          <motion.div 
            className="card neutral-glass rounded-3xl p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300" 
            variants={cardVariants} 
            custom={4}
            onClick={(e) => handleCardClick(e, 'leadership')}
          >
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-primary-card-gradient">Our Leadership</h2>
            <p className="text-light-text dark:text-light-text-dark text-sm mt-2">Meet the team driving our success.</p>
          </motion.div>
          
          <motion.div 
            className="card neutral-glass rounded-3xl p-6 sm:col-span-2 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300" 
            variants={cardVariants} 
            custom={5}
            onClick={(e) => handleCardClick(e, 'contact')}
          >
            <h3 className="text-light-text dark:text-light-text-dark font-semibold text-sm">Get in Touch</h3>
            <h2 className="text-2xl font-bold mt-1 text-dark-text dark:text-dark-text-dark">Contact Us</h2>
            <div className="mt-4 flex flex-col sm:flex-row gap-6 items-center">
                <div className="rounded-xl w-full sm:w-32 h-32 bg-gradient-to-br from-brand-orange to-brand-blue flex items-center justify-center text-white text-2xl font-bold">
                  HNV
                </div>
                <div className="flex-1">
                    <p className="text-light-text dark:text-light-text-dark text-sm">Have questions or need support? Reach out to our team.</p>
                    <span className="text-brand-primary dark:text-brand-secondary font-semibold mt-2 inline-block text-sm">Send a Message &rarr;</span>
                </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingHeroContent;
