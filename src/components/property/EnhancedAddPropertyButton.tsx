import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface EnhancedAddPropertyButtonProps {
  onClick: () => void;
}

const EnhancedAddPropertyButton: React.FC<EnhancedAddPropertyButtonProps> = ({ onClick }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        group relative btn-gradient px-8 py-4 rounded-3xl flex items-center gap-3 font-bold shadow-xl 
        hover:shadow-2xl transition-all duration-300 hover:scale-105 touch-feedback overflow-hidden
        ${isClicked ? 'animate-pulse scale-95' : ''}
      `}
    >
      {/* Ripple Effect */}
      <div className="absolute inset-0 bg-white/20 rounded-3xl scale-0 group-active:scale-100 transition-transform duration-200"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-2 left-4 w-1 h-1 bg-white/40 rounded-full animate-ping delay-100"></div>
        <div className="absolute top-4 right-6 w-1 h-1 bg-white/40 rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-3 left-6 w-1 h-1 bg-white/40 rounded-full animate-ping delay-500"></div>
      </div>

      {/* Icon Container */}
      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:rotate-90 transition-transform duration-300 relative z-10">
        <Plus size={14} className="text-white" />
      </div>
      
      {/* Text with Shine Effect */}
      <span className="relative z-10 bg-gradient-to-r from-white to-white/90 bg-clip-text">
        Add Property
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
      </span>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 -z-10"></div>
    </button>
  );
};

export default EnhancedAddPropertyButton;