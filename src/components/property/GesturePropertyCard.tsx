import React, { useState, useRef } from 'react';
import { Edit, Trash2, Eye, Archive, DollarSign } from 'lucide-react';

interface GesturePropertyCardProps {
  property: any;
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onArchive: () => void;
  onPayment: () => void;
}

const GesturePropertyCard: React.FC<GesturePropertyCardProps> = ({
  property,
  children,
  onEdit,
  onDelete,
  onView,
  onArchive,
  onPayment
}) => {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const isMobile = window.innerWidth < 768;

  // Only show view action on mobile swipe
  const actions = [
    { icon: Eye, label: 'View', color: 'bg-blue-500', action: onView }
  ];

  const handleStart = (clientX: number) => {
    startX.current = clientX;
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX.current;
    const maxDrag = 200;
    const clampedDiff = Math.max(-maxDrag, Math.min(maxDrag, diff));
    setDragX(clampedDiff);
    
    // Only show actions on desktop or when swiping right on mobile
    if (!isMobile && Math.abs(clampedDiff) > 50) {
      setShowActions(true);
    } else if (isMobile && clampedDiff > 50) {
      setShowActions(true);
    } else {
      setShowActions(false);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    
    if (Math.abs(dragX) > 100) {
      // On mobile, only allow view action on right swipe
      if (isMobile) {
        if (dragX > 100) {
          onView(); // Swipe right = view
        }
      } else {
        // On desktop, keep original behavior
        if (dragX > 100) {
          onView(); // Swipe right = view
        } else if (dragX < -100) {
          onDelete(); // Swipe left = delete
        }
      }
    }
    
    // Animate back to center
    setDragX(0);
    setTimeout(() => setShowActions(false), 300);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background Actions - Mobile only shows view action */}
      <div className={`absolute inset-0 flex items-center justify-between px-4 transition-opacity duration-300 ${
        showActions ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Left side actions (swipe right to reveal) */}
        <div className="flex gap-2">
          {!isMobile && (
            <button
              onClick={onEdit}
              className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg transform scale-0 animate-bounce-in"
              style={{ animationDelay: '0ms' }}
            >
              <Edit size={20} />
            </button>
          )}
          <button
            onClick={onView}
            className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg transform scale-0 animate-bounce-in"
            style={{ animationDelay: '100ms' }}
          >
            <Eye size={20} />
          </button>
        </div>

        {/* Right side actions (swipe left to reveal) - Only shown on desktop */}
        {!isMobile && (
          <div className="flex gap-2">
            <button
              onClick={onArchive}
              className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white shadow-lg transform scale-0 animate-bounce-in"
              style={{ animationDelay: '200ms' }}
            >
              <Archive size={20} />
            </button>
            <button
              onClick={onDelete}
              className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg transform scale-0 animate-bounce-in"
              style={{ animationDelay: '300ms' }}
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Main Card */}
      <div
        ref={cardRef}
        className={`relative backdrop-blur-xl bg-white/8 border border-white/20 rounded-xl shadow-sm transition-all duration-300 cursor-grab ${
          isDragging ? 'cursor-grabbing shadow-2xl scale-105' : 'hover:shadow-md'
        }`}
        style={{backdropFilter: 'blur(20px) saturate(180%)',
          transform: `translateX(${dragX}px) ${isDragging ? 'rotate(2deg)' : 'rotate(0deg)'}`,
          zIndex: isDragging ? 10 : 1
        }}
        
        // Mouse events
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        
        // Touch events
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        {children}
        
        {/* Swipe Indicators - Modified for mobile */}
        {isDragging && (
          <>
            {/* Left indicator - View on mobile, Edit on desktop */}
            <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-opacity duration-200 ${
              dragX > 50 ? 'opacity-100' : 'opacity-30'
            }`}>
              <div className="flex items-center gap-2 text-blue-600">
                {isMobile ? <Eye size={16} /> : <Edit size={16} />}
                <span className="text-sm font-medium">{isMobile ? 'View' : 'Edit'}</span>
              </div>
            </div>
            
            {/* Right indicator - Only shown on desktop */}
            {!isMobile && (
              <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-opacity duration-200 ${
                dragX < -50 ? 'opacity-100' : 'opacity-30'
              }`}>
                <div className="flex items-center gap-2 text-red-600">
                  <span className="text-sm font-medium">Delete</span>
                  <Trash2 size={16} />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0) rotate(180deg); }
          50% { transform: scale(1.2) rotate(0deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default GesturePropertyCard;