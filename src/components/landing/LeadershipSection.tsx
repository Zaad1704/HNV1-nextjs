import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

interface Executive {
  name: string;
  position: string;
  bio: string;
  imageUrl?: string;
  linkedin?: string;
  twitter?: string;
}

const LeadershipSection = () => {
  const { data: siteSettings } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/public/site-settings');
        return response.data.data;
      } catch (error) {
        return {};
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false
  });

  // Get executives from site settings or use defaults
  const executives = siteSettings?.leadership?.executives || [
    {
      name: 'John Smith',
      position: 'CEO & Founder',
      bio: 'Leading the vision for modern property management solutions.',
      imageUrl: ''
    },
    {
      name: 'Sarah Johnson',
      position: 'CTO',
      bio: 'Driving technical innovation and platform development.',
      imageUrl: ''
    },
    {
      name: 'Mike Davis',
      position: 'Head of Operations',
      bio: 'Ensuring seamless operations and customer success.',
      imageUrl: ''
    }
  ];

  return (
    <section className="py-20 bg-app-surface">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-text-primary mb-4">
            {siteSettings?.leadership?.title || 'Meet Our Leadership'}
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {siteSettings?.leadership?.subtitle || 'Our experienced team is dedicated to revolutionizing property management.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {executives.map((executive: Executive, index: number) => (
            <motion.div
              key={executive.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                {executive.imageUrl ? (
                  <img
                    src={executive.imageUrl}
                    alt={executive.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full app-gradient flex items-center justify-center text-white text-2xl font-bold">
                    {executive.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-1">
                {executive.name}
              </h3>
              <p className="text-brand-blue font-medium mb-3">
                {executive.position}
              </p>
              <p className="text-text-secondary">
                {executive.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;