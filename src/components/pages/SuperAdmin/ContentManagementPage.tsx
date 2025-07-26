'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FileText, Settings, Users, Mail } from 'lucide-react';
import apiClient from '@/lib/api';
import ContentEditor from '@/components/admin/ContentEditor';

const ContentManagementPage: React.FC = () => {
  const { data: siteSettings, isLoading } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const response = await apiClient.get('/site-settings');
      return response.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        <span className="ml-3 text-gray-600">Loading content...</span>
      </div>
    );
  }

  const contentSections = [
    {
      id: 'heroSection',
      title: 'Hero Section',
      icon: <FileText size={20} />,
      description: 'Main landing page hero content',
      data: siteSettings?.heroSection
    },
    {
      id: 'aboutSection',
      title: 'About Section',
      icon: <Users size={20} />,
      description: 'Company information and mission',
      data: siteSettings?.aboutSection
    },
    {
      id: 'contactSection',
      title: 'Contact Section',
      icon: <Mail size={20} />,
      description: 'Contact information and details',
      data: siteSettings?.contactSection
    },
    {
      id: 'leadershipSection',
      title: 'Leadership Section',
      icon: <Users size={20} />,
      description: 'Team and leadership information',
      data: siteSettings?.leadershipSection
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">Manage landing page content and site settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {contentSections.map((section) => (
          <ContentEditor
            key={section.id}
            section={section.id}
            title={section.title}
            data={section.data}
          />
        ))}
      </div>

      {/* Site Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Settings size={20} className="text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Site Settings</h3>
            <p className="text-gray-600">Global site configuration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
            <input
              type="text"
              value={siteSettings?.siteName || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
            <input
              type="email"
              value={siteSettings?.contactEmail || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              readOnly
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
            <textarea
              value={siteSettings?.siteDescription || ''}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              readOnly
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContentManagementPage;