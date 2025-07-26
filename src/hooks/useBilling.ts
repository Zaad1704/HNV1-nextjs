import apiClient from "../api/client";
import { useQuery } from '@tanstack/react-query';

// BEST PRACTICE: Define a type for the data being fetched for better type safety and autocompletion.
interface BillingInfo {
  _id: string;
  planId: {
    _id: string;
    name: string;
    price: number;
  };
  status: 'active' | 'trialing' | 'inactive' | 'canceled';
  isLifetime: boolean;
  trialExpiresAt?: string;
  currentPeriodEndsAt?: string;
}

/**
 * This custom hook is the single source of truth for fetching the current user's subscription details.
 * It uses React Query to efficiently cache and manage the data.
 */
export function useBilling() {

  // Fetches the user's current subscription details from the /api/billing endpoint.
  // The backend controller for this route populates the 'planId' field, so we get all the plan details.
  //
  const { 
    data: billingInfo, 
    isLoading: isLoadingBillingInfo, 
    isError: isErrorBillingInfo 
  } = useQuery({
    queryKey: ['userBillingInfo'], // A unique key for React Query to cache this specific data.
    queryFn: async (): Promise<BillingInfo | null> => {
      const res = await apiClient.get("/billing");
      // The backend nests the actual subscription object in a 'data' property.
      // This ensures we return the core subscription object that the components need.
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5, // Cache the data for 5 minutes to avoid unnecessary re-fetching.
  });

  // Return the data and its loading/error state in a clean, direct object.
  // Any component using this hook can now directly access `billingInfo`, `isLoadingBillingInfo`, etc.
  return {
    billingInfo,
    isLoadingBillingInfo,
    isErrorBillingInfo,
  };
}
