import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Plus, Home, Building, Users, CreditCard, Settings, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuickAccessWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const location = usePathname();
  const widgetRef = useRef<HTMLDivElement>(null);

  // Only show on dashboard pages
  const isDashboardPage = pathname.startsWith('/dashboard');
  
  if (!isDashboardPage) {
    return null;
  }

  const quickActions = [
    { icon: <Building size={16} />, label: 'Add Property', action: () => console.log('Add Property'), color: 'bg-blue-500' },
    { icon: <Users size={16} />, label: 'Add Tenant', action: () => console.log('Add Tenant'), color: 'bg-green-500' },
    { icon: <CreditCard size={16} />, label: 'Record Payment', action: () => console.log('Record Payment'), color: 'bg-purple-500' },
    { icon: <Home size={16} />, label: 'Dashboard', action: () => window.location.href = '/dashboard', color: 'bg-orange-500' },
    { icon: <Settings size={16} />, label: 'Settings', action: () => window.location.href = '/dashboard/settings', color: 'bg-gray-500' }
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isOpen) return; // Don't drag when menu is open
    
    setIsDragging(true);
    const rect = widgetRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Load saved position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('quickAccessPosition');
    if (savedPosition) {
      const parsed = JSON.parse(savedPosition);
      setPosition(parsed);
    }
  }, []);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem('quickAccessPosition', JSON.stringify(position));
  }, [position]);

  return (
    <>
      {/* Main Button */}
      <motion.div
        ref={widgetRef}
        style={{ 
          left: position.x, 
          top: position.y,
          opacity: isDragging ? 0.8 : (isOpen ? 1 : 0.7)
        }}
        className={`fixed z-30 cursor-${isDragging ? 'grabbing' : 'grab'} select-none`}
        onMouseDown={handleMouseDown}
        whileHover={{ opacity: 1, scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <button
          onClick={() => !isDragging && setIsOpen(!isOpen)}
          className={`
            w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg 
            flex items-center justify-center transition-all duration-300 hover:shadow-xl
            ${isOpen ? 'rotate-45' : 'hover:rotate-12'}
          `}
        >
          <Plus size={20} className="transition-transform duration-300" />
        </button>
      </motion.div>

      {/* Quick Actions Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{ 
              left: position.x + 60, 
              top: position.y - 20 
            }}
            className="fixed z-40 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 min-w-48"
          >
            <div className="space-y-1">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    action.action();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div className={`${action.color} p-2 rounded-lg text-white`}>
                    {action.icon}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
              <div className="flex items-center gap-2 px-3 py-2">
                <Zap size={14} className="text-yellow-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Drag to reposition
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close menu */}
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