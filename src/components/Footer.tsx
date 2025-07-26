import React from "react";
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="bg-light-card dark:bg-dark-card text-light-text dark:text-light-text-dark py-12 mt-12 transition-colors duration-300 border-t border-border-color dark:border-border-color-dark">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark mb-3">{t('app_name')}</h3>
            <p className="text-sm">{t('footer.company_address')}</p>
            <p className="text-sm mt-2">{t('contact.email')}: info@hnvpropertymanagement.com</p>
            <p className="text-sm">{t('contact.phone')}: (555) 123-4567</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark mb-3">{t('footer.quick_links')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-brand-primary dark:hover:text-brand-secondary transition-colors">{t('nav.about')}</Link></li>
              <li><Link href="/services" className="hover:text-brand-primary dark:hover:text-brand-secondary transition-colors">{t('nav.services')}</Link></li>
              <li><Link href="/leadership" className="hover:text-brand-primary dark:hover:text-brand-secondary transition-colors">{t('leadership.title')}</Link></li>
              <li><Link href="/contact" className="hover:text-brand-primary dark:hover:text-brand-secondary transition-colors">{t('nav.contact')}</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-primary dark:hover:text-brand-secondary transition-colors">{t('footer.privacy_policy')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-dark-text dark:text-dark-text-dark mb-3">{t('footer.newsletter_title')}</h3>
            <p className="text-sm mb-3">{t('footer.newsletter_subtitle')}</p>
            <form className="flex">
              <input type="email" className="w-full px-3 py-2.5 rounded-l-lg text-dark-text dark:text-dark-text-dark bg-light-bg dark:bg-dark-bg border border-border-color dark:border-border-color-dark focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors text-sm"
                placeholder={t('footer.enter_email')} />
              <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2.5 rounded-r-lg font-semibold text-sm transition-colors">
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-border-color dark:border-border-color-dark pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {year} {t('app_name')}. {t('footer.all_rights_reserved')}</p>
          <Link href="/login" className="text-light-text dark:text-light-text-dark hover:text-brand-primary dark:hover:text-brand-secondary transition-colors mt-4 md:mt-0">{t('header.login')}</Link>
        </div>
      </div>
    </footer>
  );
}
