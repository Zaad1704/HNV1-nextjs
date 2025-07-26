import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';

interface PropertyStatsSectionProps {
  propertyId: string;
}

const fetchPropertyStats = async (propertyId: string) => {
  try {
    const [tenantsRes, paymentsRes] = await Promise.all([
      apiClient.get(`/tenants?propertyId=${propertyId}`),
      apiClient.get(`/payments?propertyId=${propertyId}`)
    ]);
    
    const tenants = tenantsRes.data.data || [];
    const payments = paymentsRes.data.data || [];
    
    const activeTenants = tenants.filter((t: any) => t.status === 'Active').length;
    const totalRent = tenants.reduce((sum: number, t: any) => sum + (t.rentAmount || 0), 0);
    const thisMonthPayments = payments.filter((p: any) => {
      const paymentDate = new Date(p.paymentDate);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    });
    const thisMonthRevenue = thisMonthPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    
    return {
      activeTenants,
      totalTenants: tenants.length,
      totalRent,
      thisMonthRevenue,
      occupancyRate: tenants.length > 0 ? (activeTenants / tenants.length) * 100 : 0
    };
  } catch (error) {
    console.error('Failed to fetch property stats:', error);
    return {
      activeTenants: 0,
      totalTenants: 0,
      totalRent: 0,
      thisMonthRevenue: 0,
      occupancyRate: 0
    };
  }
};

const PropertyStatsSection: React.FC<PropertyStatsSectionProps> = ({ propertyId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['propertyStats', propertyId],
    queryFn: () => fetchPropertyStats(propertyId),
    enabled: !!propertyId
  });

  if (isLoading) {
    return (
      <div className="app-surface rounded-3xl p-8 border border-app-border">
        <h2 className="text-xl font-bold text-text-primary mb-6">Property Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app-surface rounded-3xl p-8 border border-app-border">
      <h2 className="text-xl font-bold text-text-primary mb-6">Property Statistics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users size={24} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-text-primary">{stats?.activeTenants || 0}</div>
          <div className="text-sm text-text-secondary">Active Tenants</div>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <DollarSign size={24} className="text-green-600" />
          </div>
          <div className="text-2xl font-bold text-text-primary">${stats?.totalRent || 0}</div>
          <div className="text-sm text-text-secondary">Monthly Rent</div>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Calendar size={24} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-text-primary">${stats?.thisMonthRevenue || 0}</div>
          <div className="text-sm text-text-secondary">This Month</div>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <TrendingUp size={24} className="text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-text-primary">{Math.round(stats?.occupancyRate || 0)}%</div>
          <div className="text-sm text-text-secondary">Occupancy</div>
        </div>
      </div>
    </div>
  );
};

export default PropertyStatsSection;