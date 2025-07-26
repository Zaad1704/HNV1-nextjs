import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  fps: number;
  loadTime: number;
}

interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
}

export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0,
    loadTime: 0
  });
  
  const renderStartTime = useRef<number>(0);
  const frameCount = useRef<number>(0);
  const lastTime = useRef<number>(0);
  const fpsInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    renderStartTime.current = performance.now();

    // Measure render time
    const measureRenderTime = () => {
      const renderTime = performance.now() - renderStartTime.current;
      setMetrics(prev => ({ ...prev, renderTime }));
    };

    // Measure memory usage (if available)
    const measureMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }
    };

    // Measure FPS
    const measureFPS = () => {
      const now = performance.now();
      frameCount.current++;
      
      if (now - lastTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
        setMetrics(prev => ({ ...prev, fps }));
        frameCount.current = 0;
        lastTime.current = now;
      }
      
      requestAnimationFrame(measureFPS);
    };

    // Start measurements
    measureRenderTime();
    measureMemoryUsage();
    requestAnimationFrame(measureFPS);

    // Measure load time using Performance API
    if ('getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const loadTime = navigationEntries[0].loadEventEnd - navigationEntries[0].navigationStart;
        setMetrics(prev => ({ ...prev, loadTime }));
      }
    }

    // Log performance marks
    performance.mark(`${componentName}-mount-start`);

    return () => {
      performance.mark(`${componentName}-mount-end`);
      performance.measure(
        `${componentName}-mount-duration`,
        `${componentName}-mount-start`,
        `${componentName}-mount-end`
      );

      if (fpsInterval.current) {
        clearInterval(fpsInterval.current);
      }
    };
  }, [componentName]);

  // Performance warning thresholds
  const getPerformanceWarnings = () => {
    const warnings: string[] = [];
    
    if (metrics.renderTime > 16) { // 60fps = 16.67ms per frame
      warnings.push(`Slow render time: ${metrics.renderTime.toFixed(2)}ms`);
    }
    
    if (metrics.memoryUsage > 50) { // 50MB threshold
      warnings.push(`High memory usage: ${metrics.memoryUsage.toFixed(2)}MB`);
    }
    
    if (metrics.fps < 30) {
      warnings.push(`Low FPS: ${metrics.fps}`);
    }
    
    return warnings;
  };

  return {
    metrics,
    warnings: getPerformanceWarnings()
  };
};

// Hook for measuring specific operations
export const useOperationTimer = () => {
  const timers = useRef<Map<string, number>>(new Map());

  const startTimer = (operationName: string) => {
    timers.current.set(operationName, performance.now());
    performance.mark(`${operationName}-start`);
  };

  const endTimer = (operationName: string): number => {
    const startTime = timers.current.get(operationName);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    performance.mark(`${operationName}-end`);
    performance.measure(operationName, `${operationName}-start`, `${operationName}-end`);
    
    timers.current.delete(operationName);
    return duration;
  };

  const getTimerDuration = (operationName: string): number => {
    const startTime = timers.current.get(operationName);
    return startTime ? performance.now() - startTime : 0;
  };

  return {
    startTimer,
    endTimer,
    getTimerDuration
  };
};

// Hook for monitoring API call performance
export const useApiPerformanceMonitor = () => {
  const [apiMetrics, setApiMetrics] = useState<{
    [endpoint: string]: {
      averageTime: number;
      callCount: number;
      errorCount: number;
      lastCallTime: number;
    }
  }>({});

  const recordApiCall = (endpoint: string, duration: number, isError = false) => {
    setApiMetrics(prev => {
      const existing = prev[endpoint] || {
        averageTime: 0,
        callCount: 0,
        errorCount: 0,
        lastCallTime: 0
      };

      const newCallCount = existing.callCount + 1;
      const newAverageTime = (existing.averageTime * existing.callCount + duration) / newCallCount;

      return {
        ...prev,
        [endpoint]: {
          averageTime: newAverageTime,
          callCount: newCallCount,
          errorCount: existing.errorCount + (isError ? 1 : 0),
          lastCallTime: Date.now()
        }
      };
    });
  };

  const getSlowEndpoints = (threshold = 1000) => {
    return Object.entries(apiMetrics)
      .filter(([_, metrics]) => metrics.averageTime > threshold)
      .map(([endpoint, metrics]) => ({
        endpoint,
        averageTime: metrics.averageTime,
        callCount: metrics.callCount
      }));
  };

  const getErrorProneEndpoints = (errorRateThreshold = 0.1) => {
    return Object.entries(apiMetrics)
      .filter(([_, metrics]) => metrics.errorCount / metrics.callCount > errorRateThreshold)
      .map(([endpoint, metrics]) => ({
        endpoint,
        errorRate: metrics.errorCount / metrics.callCount,
        errorCount: metrics.errorCount,
        callCount: metrics.callCount
      }));
  };

  return {
    apiMetrics,
    recordApiCall,
    getSlowEndpoints,
    getErrorProneEndpoints
  };
};

// Hook for monitoring bundle size and loading performance
export const useBundlePerformanceMonitor = () => {
  const [bundleMetrics, setBundleMetrics] = useState({
    totalSize: 0,
    loadedChunks: 0,
    failedChunks: 0,
    loadTime: 0
  });

  useEffect(() => {
    // Monitor resource loading
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.name.includes('.js') || entry.name.includes('.css')) {
          setBundleMetrics(prev => ({
            ...prev,
            totalSize: prev.totalSize + (entry as any).transferSize || 0,
            loadedChunks: prev.loadedChunks + 1,
            loadTime: Math.max(prev.loadTime, entry.duration)
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, []);

  return bundleMetrics;
};

// Development-only performance logger
export const usePerformanceLogger = (enabled = process.env.NODE_ENV === 'development') => {
  useEffect(() => {
    if (!enabled) return;

    const logPerformanceEntries = () => {
      const entries = performance.getEntriesByType('measure');
      entries.forEach((entry) => {
        }ms`);
      });
      
      // Clear entries to prevent memory buildup
      performance.clearMeasures();
      performance.clearMarks();
    };

    const interval = setInterval(logPerformanceEntries, 5000);
    return () => clearInterval(interval);
  }, [enabled]);
};