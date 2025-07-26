import React, { useState, useRef } from 'react';
import { Trash2, Edit, Eye } from 'lucide-react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  className?: string;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onEdit,
  onDelete,
  onView,
  className = ''
}) => {
  const [translateX, setTranslateX] = useState(0);
  const startX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = startX.current - e.touches[0].clientX;
    if (diff > 0 && diff < 120) setTranslateX(-diff);
  };

  const handleTouchEnd = () => {
    const diff = startX.current - (startX.current - translateX);
    setTranslateX(diff > 60 ? -120 : 0);
    startX.current = 0;
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-full flex items-center bg-red-500 rounded-r-3xl">
        <div className="flex gap-2 px-4">
          {onView && (
            <button onClick={onView} className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <Eye size={16} />
            </button>
          )}
          {onEdit && (
            <button onClick={onEdit} className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white">
              <Edit size={16} />
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      <div
        className={`transition-transform duration-300 ${className}`}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableCard;