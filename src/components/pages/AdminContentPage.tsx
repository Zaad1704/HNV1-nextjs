'use client';
import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api"; // Corrected: Import the default export
import AdminSidebar from "@/components/admin/AdminSidebar";

type Content = {
  id: string;
  page: string;
  title: string;
  content: string;
};

const AdminContentPage: React.FC = () => {
  const [content, setContent] = useState<Content[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await apiClient.get("/site-settings"); // Corrected endpoint to match siteSettingsRoutes.ts
        // Map the site settings object to a simple array for the table display
        const settingsData = response.data.data;
        const mappedContent = [
          { id: 'hero', page: 'Hero Section', title: settingsData.heroSection?.title || '', content: '' },
          { id: 'about', page: 'About Page', title: settingsData.aboutPage?.title || '', content: '' },
          { id: 'services', page: 'Services Section', title: settingsData.servicesSection?.title || '', content: '' },
          { id: 'pricing', page: 'Pricing Section', title: settingsData.pricingSection?.title || '', content: '' },
          { id: 'contact', page: 'Contact Page', title: settingsData.contactPage?.title || '', content: '' },
          { id: 'install', page: 'Install App Section', title: settingsData.installAppSection?.title || '', content: '' },
          { id: 'terms', page: 'Terms Page', title: settingsData.termsPageContent?.title || '', content: '' },
          { id: 'privacy', page: 'Privacy Policy Page', title: settingsData.privacyPolicyPageContent?.title || '', content: '' },
        ];
        setContent(mappedContent);
      } catch (err) {
        setError("Failed to fetch content.");
      }
    };
    fetchContent();
  }, []);

  if (error) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-4 bg-light-bg dark:bg-dark-bg transition-colors duration-300">
          <div className="text-red-500 dark:text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      <AdminSidebar />
      <div className="flex-1 p-4 text-dark-text dark:text-dark-text-dark">
        <h1 className="text-2xl font-bold mb-4">Content Management</h1>
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md border border-border-color dark:border-border-color-dark transition-all duration-200">
          <table className="w-full">
            <thead className="bg-light-bg dark:bg-dark-bg/50 border-b border-border-color dark:border-border-color-dark">
              <tr>
                <th className="text-left p-3 text-sm font-semibold text-light-text dark:text-light-text-dark">Page</th>
                <th className="text-left p-3 text-sm font-semibold text-light-text dark:text-light-text-dark">Title</th>
                <th className="text-left p-3 text-sm font-semibold text-light-text dark:text-light-text-dark">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color dark:divide-border-color-dark">
              {content.map((item) => (
                <tr key={item.id} className="hover:bg-light-bg dark:hover:bg-dark-bg/40 transition-colors duration-150">
                  <td className="p-3 text-dark-text dark:text-dark-text-dark">{item.page}</td>
                  <td className="p-3 text-light-text dark:text-light-text-dark">{item.title}</td>
                  <td className="p-3">
                    <button className="text-brand-primary dark:text-brand-secondary hover:underline transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminContentPage;
