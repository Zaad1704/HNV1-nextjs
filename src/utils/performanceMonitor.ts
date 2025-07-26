import React from 'react';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): void {
    this.metrics.set(label, performance.now());
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(label);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.metrics.delete(label);
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  measureComponentRender<T extends React.ComponentType<any>>(
    Component: T,
    displayName?: string
  ): T {
    const WrappedComponent = React.forwardRef((props: any, ref: any) => {
      const renderStart = performance.now();
      
      React.useEffect(() => {
        const renderTime = performance.now() - renderStart;
        if (renderTime > 16) { // Slower than 60fps
          console.warn(`Slow render: ${displayName || Component.name} took ${renderTime.toFixed(2)}ms`);
        }
      });

      return React.createElement(Component, { ...props, ref });
    });

    WrappedComponent.displayName = `PerformanceMonitor(${displayName || Component.name})`;
    return WrappedComponent as T;
  }

  // Web Vitals monitoring
  measureWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Measure Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Measure First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.log('FID:', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Measure Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let clsValue = 0;
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }
}

// React hook for performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();
  
  React.useEffect(() => {
    monitor.startTiming(`${componentName}-mount`);
    return () => {
      monitor.endTiming(`${componentName}-mount`);
    };
  }, [componentName, monitor]);

  return {
    startTiming: (label: string) => monitor.startTiming(`${componentName}-${label}`),
    endTiming: (label: string) => monitor.endTiming(`${componentName}-${label}`)
  };
};