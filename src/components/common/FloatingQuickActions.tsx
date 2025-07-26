import React, { useState, useEffect, useRef } from 'react';
import { Plus, Building, Users, CreditCard, Wrench } from 'lucide-react';
import Link from 'next/link';

const FloatingQuickActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const actionButtonRef = useRef<HTMLDivElement>(null);

  const actions = [
    { icon: Building, label: 'Add Property', href: '/dashboard/properties?action=add', color: 'bg-blue-500' },
    { icon: Users, label: 'Add Tenant', href: '/dashboard/tenants?action=add', color: 'bg-green-500' },
    { icon: CreditCard, label: 'Record Payment', href: '/dashboard/payments?action=add', color: 'bg-purple-500' },
    { icon: Wrench, label: 'Maintenance', href: '/dashboard/maintenance?action=add', color: 'bg-orange-500' },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionButtonRef.current && !actionButtonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-24 right-6 z-[9999]" ref={actionButtonRef}>
      <div className={`mb-4 space-y-4 ${isOpen ? 'block' : 'hidden'}`}>
        {actions.map((action, index) => (
          <div key={action.label} className="flex justify-end">
            <Link
              to={action.href}
              className={`${action.color} text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg relative`}
              onClick={() => setIsOpen(false)}
              style={{
                backdropFilter: 'blur(8px)', 
                WebkitBackdropFilter: 'blur(8px)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <action.icon size={22} />
              <div className="absolute -left-24 bg-black/80 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                {action.label}
              </div>
            </Link>
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg flex items-center justify-center relative"
        style={{
          backdropFilter: 'blur(8px)', 
          WebkitBackdropFilter: 'blur(8px)', 
          border: '1px solid rgba(255, 255, 255, 0.3)', 
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        <Plus size={28} style={{transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'}} />
        <div className="absolute -left-24 bg-black/80 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
          Quick Actions
        </div>
      </button>
    </div>
  );
};

export default FloatingQuickActions;