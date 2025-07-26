import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Building, Users, CreditCard, FileText, Settings } from 'lucide-react';

const MobileBottomNav = () => {
  const location = usePathname();
  
  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/dashboard/properties', icon: Building, label: 'Properties' },
    { href: '/dashboard/tenants', icon: Users, label: 'Tenants' },
    { href: '/dashboard/receipts', icon: FileText, label: 'Receipts' },
    { href: '/dashboard/settings-universal', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-lg ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <item.icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;