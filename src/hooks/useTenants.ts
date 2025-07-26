import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

// Define the shape of a single tenant object for type safety
export interface ITenant {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  unit: string;
  status: 'Active' | 'Inactive' | 'Late';
  propertyId?: {
      _id: string;
      name: string;
  };
  organizationId: string;
}

// The custom hook using useQuery
export function useTenants() {
  return useQuery<ITenant[], Error>({
    // 'queryKey' is used by React Query for caching.
    queryKey: ['tenants'],
    // 'queryFn' is the asynchronous function that fetches the data.
    queryFn: async () => {
      const { data } = await apiClient.get('/tenants');
      return data.data; // Assuming the API returns { success: true, data: [...] }
    },
    // Optional: Add a stale time to prevent refetching too often.
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
