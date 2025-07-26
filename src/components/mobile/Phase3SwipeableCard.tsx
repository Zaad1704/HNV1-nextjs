import React, { useState, useRef, useCallback } from 'react';
import { Edit, Eye, Trash2 } from 'lucide-react';

interface Phase3SwipeableCardProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  className?: string;
  disabled?: boolean;
}

const Phase3SwipeableCard: React.FC<Phase3SwipeableCardProps> = ({
  children,
  onEdit,
  onDelete,
  onView,
  className = '',
  disabled = false
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const startX = useRef(0);
  const startTime = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 60;
  const MAX_SWIPE = 140;
  const ANIMATION_DURATION = 300;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    
    startX.current = e.touches[0].clientX;
    startTime.current = Date.now();
    setIsAnimating(false);
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || isAnimating) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startX.current - currentX;
    
    // Only allow left swipe (positive diff)
    if (diff > 0 && diff <= MAX_SWIPE) {
      setTranslateX(-diff);
    } else if (diff < 0) {
      // Allow slight right swipe to close
      setTranslateX(Math.max(-10, -diff * 0.3));
    }
  }, [disabled, isAnimating]);

  const handleTouchEnd = useCallback(() => {
    if (disabled || isAnimating) return;
    
    setIsAnimating(true);
    const swipeDistance = Math.abs(translateX);
    const swipeTime = Date.now() - startTime.current;
    const swipeVelocity = swipeDistance / swipeTime;
    
    // Determine if swipe should open or close
    const shouldOpen = swipeDistance > SWIPE_THRESHOLD || swipeVelocity > 0.5;
    
    setTranslateX(shouldOpen ? -MAX_SWIPE : 0);
    
    // Reset animation flag after animation completes
    setTimeout(() => setIsAnimating(false), ANIMATION_DURATION);
  }, [disabled, isAnimating, translateX]);

  const handleActionClick = useCallback((action: () => void) => {
    action();
    // Close the swipe actions after action is performed
    setIsAnimating(true);
    setTranslateX(0);
    setTimeout(() => setIsAnimating(false), ANIMATION_DURATION);
  }, []);

  const closeSwipe = useCallback(() => {
    if (translateX !== 0) {
      setIsAnimating(true);
      setTranslateX(0);
      setTimeout(() => setIsAnimating(false), ANIMATION_DURATION);
    }
  }, [translateX]);

  return (
    <div className={`phase3-swipeable-card ${className}`} ref={cardRef}>
      {/* Swipe Actions Background */}
      <div className="phase3-swipe-actions">
        {onView && (
          <button
            onClick={() => handleActionClick(onView)}
            className="phase3-swipe-action-view"
            aria-label="View details"
          >
            <Eye size={16} />
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => handleActionClick(onEdit)}
            className="phase3-swipe-action-edit"
            aria-label="Edit"
          >
            <Edit size={16} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => handleActionClick(onDelete)}
            className="phase3-swipe-action-delete"
            aria-label="Delete"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Card Content */}
      <div
        className={`phase3-card-content ${isAnimating ? 'transition-transform duration-300 ease-out' : ''}`}
        style={{ 
          transform: `translateX(${translateX}px)`,
          touchAction: disabled ? 'auto' : 'pan-y' // Allow vertical scrolling but handle horizontal
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={translateX !== 0 ? closeSwipe : undefined}
      >
        {children}
      </div>

      {/* Overlay to close swipe when tapping outside */}
      {translateX !== 0 && (
        <div
          className="absolute inset-0 z-20 bg-transparent"
          onClick={closeSwipe}
          onTouchStart={(e) => {
            e.preventDefault();
            closeSwipe();
          }}
        />
      )}
    </div>
  );
};

export default Phase3SwipeableCard;