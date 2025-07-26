'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { ToastProvider } from '@/components/common/Toast';
import { AccessibilityProvider } from '@/components/common/AccessibilityProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import '@/i18n-simple';
import OfflineIndicator from '@/components/common/OfflineIndicator';
import PWAInstallPrompt from '@/components/PWAInstallPromptSimple';
import HelpCenter from '@/components/common/HelpCenter';
import HelpWidget from '@/components/common/HelpWidget';
import QuickAccessWidget from '@/components/common/QuickAccessWidgetSimple';
import EnhancedFeedbackWidget from '@/components/common/EnhancedFeedbackWidget';
import SkipLink from '@/components/common/SkipLink';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <ThemeProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <ToastProvider>
                <ErrorBoundary>
                  <SkipLink />
                  <OfflineIndicator />
                  <PWAInstallPrompt />
                  <HelpCenter />
                  <HelpWidget />
                  <QuickAccessWidget />
                  <EnhancedFeedbackWidget />
                  {children}
                </ErrorBoundary>
              </ToastProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}