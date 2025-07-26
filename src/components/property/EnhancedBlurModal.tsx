import React from 'react';
import { X } from 'lucide-react';

interface EnhancedBlurModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const EnhancedBlurModal: React.FC<EnhancedBlurModalProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backdropFilter: 'blur(12px) saturate(120%)',
        WebkitBackdropFilter: 'blur(12px) saturate(120%)',
        background: 'rgba(0, 0, 0, 0.4)'
      }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl rounded-2xl shadow-lg overflow-hidden backdrop-blur-xl bg-white/10 border-2 border-white/20"
        style={{
          backdropFilter: 'blur(20px) saturate(180%)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-white/70" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default EnhancedBlurModal;