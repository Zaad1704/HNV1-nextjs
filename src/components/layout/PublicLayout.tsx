import React from 'react';

import Navbar from './Navbar';
import Footer from './Footer';
import PublicMobileHeader from './PublicMobileHeader';
import PublicMobileBottomNav from './PublicMobileBottomNav';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <div className="min-h-screen bg-app-bg">
        <PublicMobileHeader />
        <main className="pt-16 pb-20">
          {children}
        </main>
        <PublicMobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;