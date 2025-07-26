export interface IExpiringLease {
  _id: string;
  name: string;
  propertyId: {
    name: string;
  };
  leaseEndDate: string;
}

export const useExpiringLeases = () => {
  return {
    data: [],
    isLoading: false,
    error: null
  };
};