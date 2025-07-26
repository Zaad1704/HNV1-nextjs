import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface Phase3BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  height?: 'auto' | 'half' | 'full';
  showHandle?: boolean;
  className?: string;
}

const Phase3BottomSheet: React.FC<Phase3BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  height = 'auto',
  showHandle = true,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
      
      setTimeout(() => setIsAnimating(false), 300);
    } else {
      setIsAnimating(true);
      document.body.style.overflow = 'unset';
      
      setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
      }, 300);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const getHeightClass = () => {
    switch (height) {
      case 'half': return 'h-1/2';
      case 'full': return 'h-full';
      default: return 'max-h-[80vh]';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`phase3-bottom-sheet ${className}`}>
      <div 
        className={`phase3-bottom-sheet-backdrop ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />
      
      <div 
        className={`phase3-bottom-sheet-content ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } ${getHeightClass()}`}
      >
        {showHandle && (
          <div className="phase3-bottom-sheet-handle" />
        )}
        
        {title && (
          <div className="phase3-bottom-sheet-header">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="phase3-touch-btn-icon"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        <div className="phase3-bottom-sheet-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Phase3BottomSheet;