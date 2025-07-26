import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

const fetchSiteSettings = async () => {
  try {
    const { data } = await apiClient.get('/public/site-settings');
    return data.data;
  } catch (error) {
    return {
      logos: {
        companyName: 'HNV Property Management',
        faviconUrl: '/logo-min.png'
      }
    };
  }
};

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: fetchSiteSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};