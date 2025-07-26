import { lazy } from 'react';

export const LazyComponents = {
  AdminDashboard: lazy(() => import('../pages/AdminDashboardPage')),
  TenantDashboard: lazy(() => import('../pages/TenantDashboardPage')),
  SiteEditor: lazy(() => import('../pages/SuperAdmin/SiteEditorPage'))
};

export const optimizeImageUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: number;
} = {}) => {
  if (!url) return '';
  const { width = 800, height = 600, quality = 80 } = options;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}w=${width}&h=${height}&q=${quality}&f=webp`;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};