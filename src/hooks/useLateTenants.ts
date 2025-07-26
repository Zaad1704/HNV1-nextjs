import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

// Define the shape of the data returned by the API for a late tenant
export interface ILateTenant {
  _id: string;
  name: string;
  unit: string;
  propertyId: {
    _id: string;
    name: string;
  };
}

// The function that will fetch the data from the backend
const fetchLateTenants = async (): Promise<ILateTenant[]> => {
    // This assumes your backend has an endpoint at /api/dashboard/late-tenants
    const { data } = await apiClient.get('/dashboard/late-tenants');
    return data.data;
};

// The custom hook that uses React Query to manage the data fetching
export function useLateTenants() {
  return useQuery<ILateTenant[], Error>({
    queryKey: ['lateTenants'],
    queryFn: fetchLateTenants,
    // Optional: Keep the data fresh but don't refetch excessively
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
