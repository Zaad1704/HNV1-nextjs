import React, { useState } from 'react';
import Link from 'next/link';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useTranslation } from 'react-i18next';
import { 
  Menu, X, Home, Info, DollarSign, Phone, Users, 
  Shield, TrendingUp, Clock, Zap
} from 'lucide-react';

const MobileLandingLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: settings } = useSiteSettings();
  const { t } = useTranslation();

  const features = settings?.featuresPage?.features || [
    { icon: 'Shield', title: 'Secure', text: 'Bank-level security', sectionId: 'security' },
    { icon: 'Users', title: 'Management', text: 'Tenant management', sectionId: 'tenants' },
    { icon: 'TrendingUp', title: 'Analytics', text: 'Financial insights', sectionId: 'analytics' },
    { icon: 'Zap', title: 'Fast', text: 'Lightning fast', sectionId: 'performance' }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return Shield;
      case 'Users': return Users;
      case 'TrendingUp': return TrendingUp;
      case 'Zap': return Zap;
      default: return Shield;
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <header className="app-gradient sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="text-xl font-bold text-white">
            {settings?.logos?.companyName || 'HNV Property Management Solutions'}
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-16 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden">
            <nav className="p-4 space-y-2">
              {features.map((feature: any) => {
                const IconComponent = getIcon(feature.icon);
                return (
                  <button
                    key={feature.sectionId}
                    onClick={() => scrollToSection(feature.sectionId)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <IconComponent size={18} className="text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{feature.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{feature.text}</p>
                    </div>
                  </button>
                );
              })}
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 space-y-2">
                <Link
                  to="/login"
                  className="block w-full text-center py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('header.login')}
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-blue-600 text-white font-medium text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('header.get_started')}
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileLandingLayout;