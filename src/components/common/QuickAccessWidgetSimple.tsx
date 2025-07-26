import React, { useState } from 'react';
import { useLocation } from 'next/navigation';
import { Plus, Building, Users, CreditCard, Home, Settings } from 'lucide-react';

const QuickAccessWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = usePathname();

  const isDashboardPage = pathname.startsWith('/dashboard');
  
  if (!isDashboardPage) {
    return null;
  }

  const quickActions = [
    { icon: <Building size={16} />, label: 'Add Property', color: 'bg-blue-500' },
    { icon: <Users size={16} />, label: 'Add Tenant', color: 'bg-green-500' },
    { icon: <CreditCard size={16} />, label: 'Record Payment', color: 'bg-purple-500' },
    { icon: <Home size={16} />, label: 'Dashboard', color: 'bg-orange-500' },
    { icon: <Settings size={16} />, label: 'Settings', color: 'bg-gray-500' }
  ];

  return (
    <>
      <div className="fixed bottom-6 left-6 z-30">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-xl ${isOpen ? 'rotate-45' : 'hover:rotate-12'}`}
        >
          <Plus size={20} />
        </button>
      </div>

      {isOpen && (
        <div className="fixed bottom-20 left-6 z-40 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 min-w-48">
          <div className="space-y-1">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <div className={`${action.color} p-2 rounded-lg text-white`}>
                  {action.icon}
                </div>
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default QuickAccessWidget;