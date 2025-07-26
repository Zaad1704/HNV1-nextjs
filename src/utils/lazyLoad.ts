import { lazy } from 'react';

// Lazy loading utility with error boundary
export const lazyLoad = (importFunc: () => Promise<any>, fallback?: React.ComponentType) => {
  const LazyComponent = lazy(importFunc);
  
  return LazyComponent;
};

// Preload utility for critical components
export const preloadComponent = (importFunc: () => Promise<any>) => {
  const componentImport = importFunc();
  return componentImport;
};

// Image lazy loading utility
export const lazyLoadImage = (src: string, placeholder?: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
};

// Code splitting utility
export const loadChunk = async (chunkName: string) => {
  try {
    const chunk = await import(/* webpackChunkName: "[request]" */ `../chunks/${chunkName}`);
    return chunk.default || chunk;
  } catch (error) {
    console.error(`Failed to load chunk: ${chunkName}`, error);
    throw error;
  }
};