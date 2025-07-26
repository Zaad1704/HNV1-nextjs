import React from 'react';
import { Link, useLocation, useNavigate } from 'next/navigation';
import { Home, Info, DollarSign, Phone, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PublicBottomNavBar = () => {
  const location = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  const scrollToSection = (sectionId: string) => {
    // If we're not on the landing page, navigate there first
    if (pathname !== '/') {
      router.push('/');
      // Wait for navigation to complete, then scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // We're already on the landing page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navItems = [
    { 
      id: 'home', 
      icon: Home, 
      label: t('nav.home'), 
      action: () => {
        if (pathname === '/') {
          scrollToSection('hero');
        } else {
          router.push('/');
        }
      }
    },
    { 
      id: 'about', 
      icon: Info, 
      label: t('nav.about'), 
      action: () => scrollToSection('about') 
    },
    { 
      id: 'login', 
      icon: LogIn, 
      label: t('nav.login'), 
      isHighlighted: true,
      link: '/login'
    },
    { 
      id: 'pricing', 
      icon: DollarSign, 
      label: t('nav.pricing'), 
      action: () => scrollToSection('pricing') 
    },
    { 
      id: 'contact', 
      icon: Phone, 
      label: t('nav.contact'), 
      action: () => scrollToSection('contact') 
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-2">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            
            if (item.link) {
              return (
                <Link
                  key={item.id}
                  to={item.link}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                    item.isHighlighted 
                      ? 'bg-gradient-to-r from-orange-500 to-blue-600 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95'
                  }`}
                >
                  <IconComponent size={18} />
                  <span className="text-xs font-medium mt-1">{item.label}</span>
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                onClick={item.action}
                className="flex flex-col items-center justify-center p-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 active:scale-95"
              >
                <IconComponent size={18} />
                <span className="text-xs font-medium mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default PublicBottomNavBar;