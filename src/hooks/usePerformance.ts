import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export const usePerformance = (componentName: string) => {
  const startTime = performance.now();

  const measureRender = useCallback(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 100) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
    
    return renderTime;
  }, [componentName, startTime]);

  const measureMemory = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576),
        total: Math.round(memory.totalJSHeapSize / 1048576),
        limit: Math.round(memory.jsHeapSizeLimit / 1048576)
      };
    }
    return null;
  }, []);

  useEffect(() => {
    const renderTime = measureRender();
    const memory = measureMemory();
    
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance [${componentName}]:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        memory: memory ? `${memory.used}MB / ${memory.total}MB` : 'N/A'
      });
    }
  }, [componentName, measureRender, measureMemory]);

  return { measureRender, measureMemory };
};