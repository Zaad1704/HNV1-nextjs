import React from 'react';
import Link from 'next/link';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Footer = () => {
  const { data: settings } = useSiteSettings();

  return (
    <footer className="gradient-dark-orange-blue text-white py-12 rounded-t-3xl shadow-app-xl border-t-4 border-white/20 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {settings?.logos?.footerLogoUrl && (
                <img 
                  src={settings.logos.footerLogoUrl} 
                  alt="Logo" 
                  className="h-8 w-8 rounded-lg" 
                />
              )}
              <span className="text-xl font-bold">
                {settings?.logos?.companyName || 'HNV Property Management Solutions'}
              </span>
            </div>
            <p className="text-white/80 mb-4 max-w-md">
              {settings?.footer?.description || 'Modern property management solutions for landlords and agents.'}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              {settings?.footer?.quickLinks?.map((link: any) => (
                <a key={link.text} href={link.url} className="block text-white/80 hover:text-white transition-colors">
                  {link.text}
                </a>
              )) || (
                <>
                  <Link to="/#about" className="block text-white/80 hover:text-white transition-colors">About</Link>
                  <Link to="/#features" className="block text-white/80 hover:text-white transition-colors">Features</Link>
                  <Link to="/#pricing" className="block text-white/80 hover:text-white transition-colors">Pricing</Link>
                </>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <div className="space-y-2">
              <Link to="/privacy" className="block text-white/80 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="block text-white/80 hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/60">
            {settings?.footer?.copyrightText || '© 2024 HNV Property Management Solutions. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;