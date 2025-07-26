import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';

export const useCrossData = () => {
  const { data: crossData = {} } = useQuery({
    queryKey: ['crossData'],
    queryFn: async () => {
      const [properties, tenants, payments, expenses, maintenance] = await Promise.all([
        apiClient.get('/properties').catch(() => ({ data: { data: [] } })),
        apiClient.get('/tenants').catch(() => ({ data: { data: [] } })),
        apiClient.get('/payments').catch(() => ({ data: { data: [] } })),
        apiClient.get('/expenses').catch(() => ({ data: { data: [] } })),
        apiClient.get('/maintenance').catch(() => ({ data: { data: [] } }))
      ]);

      const propertiesData = properties.data.data || [];
      const tenantsData = tenants.data.data || [];
      const paymentsData = payments.data.data || [];
      const expensesData = expenses.data.data || [];
      const maintenanceData = maintenance.data.data || [];

      return {
        properties: propertiesData,
        tenants: tenantsData,
        payments: paymentsData,
        expenses: expensesData,
        maintenance: maintenanceData,
        stats: {
          totalProperties: propertiesData.length,
          totalTenants: tenantsData.length,
          activeProperties: propertiesData.filter((p: any) => p.status === 'Active').length,
          activeTenants: tenantsData.filter((t: any) => t.status === 'Active').length,
          totalIncome: paymentsData.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
          totalExpenses: expensesData.reduce((sum: number, e: any) => sum + (e.amount || 0), 0),
          openMaintenance: maintenanceData.filter((m: any) => m.status === 'Open').length,
          occupancyRate: propertiesData.length > 0 ? Math.round((tenantsData.filter((t: any) => t.status === 'Active').length / propertiesData.reduce((sum: number, p: any) => sum + (p.numberOfUnits || 1), 0)) * 100) : 0,
          monthlyRevenue: tenantsData.reduce((sum: number, t: any) => sum + (t.rentAmount || 0), 0)
        }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000 // 10 minutes
  });

  return crossData;
};