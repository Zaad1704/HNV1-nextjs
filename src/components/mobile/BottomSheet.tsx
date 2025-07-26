import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  height?: 'half' | 'full' | 'auto';
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  height = 'auto'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setTimeout(() => setIsVisible(false), 300);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const getHeightClass = () => {
    switch (height) {
      case 'half': return 'h-1/2';
      case 'full': return 'h-full';
      default: return 'max-h-[80vh]';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${isOpen ? 'opacity-50' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } ${getHeightClass()}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto"></div>
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;