import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, DollarSign, Phone, LogIn, UserPlus } from 'lucide-react';

const PublicMobileBottomNav = () => {
  const location = usePathname();

  const isActive = (path: string) => pathname === path;

  const tabs = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: DollarSign, label: 'Pricing', path: '/pricing' },
    { icon: Phone, label: 'Contact', path: '/#contact' },
    { icon: LogIn, label: 'Login', path: '/login' },
    { icon: UserPlus, label: 'Sign Up', path: '/register' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-app-surface/95 backdrop-blur-md border-t border-app-border z-40 md:hidden">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
                active 
                  ? 'text-brand-blue bg-brand-blue/10' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <tab.icon size={18} />
              <span className="text-xs font-medium mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PublicMobileBottomNav;