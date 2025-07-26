// frontend/src/hooks/useScrollSpy.ts

import { useState, useEffect, useRef } from 'react';

export function useScrollSpy(
  sectionIds: string[],
  offset: number = 0 // A pixel offset from the top
): string {
  const [activeId, setActiveId] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    // This creates a "line" across the screen. When a section's
    // top passes this line, it becomes active.
    const topMargin = Math.floor(window.innerHeight / 2) - offset;
    const bottomMargin = Math.floor(window.innerHeight / 2) - 1;

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        // Defines the "intersection line" relative to the viewport
        rootMargin: `-${topMargin}px 0px -${bottomMargin}px 0px`,
      }
    );

    const { current: currentObserver } = observer;

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        currentObserver.observe(element);
      }
    });

    return () => currentObserver.disconnect();
  }, [sectionIds, offset]);

  return activeId;
}
