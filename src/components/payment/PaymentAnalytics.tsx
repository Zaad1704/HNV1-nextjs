import React, { useMemo } from 'react';
import { TrendingUp, DollarSign, Calendar, BarChart3, PieChart } from 'lucide-react';

interface PaymentAnalyticsProps {
  payments: any[];
  properties: any[];
  tenants: any[];
}

const PaymentAnalytics: React.FC<PaymentAnalyticsProps> = ({ payments, properties, tenants }) => {
  const analytics = useMemo(() => {
    if (!payments.length) return null;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Monthly revenue trend (last 6 months)
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthPayments = payments.filter(p => {
        const paymentDate = new Date(p.paymentDate || p.createdAt);
        return paymentDate.getMonth() === date.getMonth() && 
               paymentDate.getFullYear() === date.getFullYear();
      });
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
        count: monthPayments.length
      };
    }).reverse();

    // Property performance
    const propertyPerformance = properties.map(property => {
      const propertyPayments = payments.filter(p => p.propertyId?._id === property._id);
      const revenue = propertyPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const propertyTenants = tenants.filter(t => t.propertyId === property._id);
      return {
        name: property.name,
        revenue,
        paymentCount: propertyPayments.length,
        tenantCount: propertyTenants.length,
        avgPayment: propertyPayments.length > 0 ? revenue / propertyPayments.length : 0
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Payment method distribution
    const methodStats = payments.reduce((acc, p) => {
      const method = p.paymentMethod || 'Unknown';
      acc[method] = (acc[method] || 0) + (p.amount || 0);
      return acc;
    }, {});

    // Collection efficiency
    const totalExpected = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
    const totalCollected = payments
      .filter(p => p.status === 'Completed' || p.status === 'Paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    return {
      monthlyRevenue,
      propertyPerformance: propertyPerformance.slice(0, 5),
      methodStats,
      collectionRate,
      totalExpected,
      totalCollected
    };
  }, [payments, properties, tenants]);

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Revenue Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-blue-600" />
          <h3 className="font-semibold text-gray-900">Revenue Trend (6 Months)</h3>
        </div>
        <div className="flex items-end gap-2 h-32">
          {analytics.monthlyRevenue.map((month, idx) => {
            const maxRevenue = Math.max(...analytics.monthlyRevenue.map(m => m.revenue));
            const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                  title={`${month.month}: $${month.revenue.toLocaleString()}`}
                />
                <div className="text-xs text-gray-600 mt-2">{month.month}</div>
                <div className="text-xs font-medium">${(month.revenue / 1000).toFixed(0)}k</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Properties */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-green-600" />
          <h3 className="font-semibold text-gray-900">Top Performing Properties</h3>
        </div>
        <div className="space-y-3">
          {analytics.propertyPerformance.map((property, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{property.name}</div>
                <div className="text-sm text-gray-600">
                  {property.paymentCount} payments • {property.tenantCount} tenants
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">${property.revenue.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Avg: ${Math.round(property.avgPayment)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChart size={20} className="text-purple-600" />
          <h3 className="font-semibold text-gray-900">Payment Methods</h3>
        </div>
        <div className="space-y-2">
          {Object.entries(analytics.methodStats).map(([method, amount], idx) => {
            const percentage = (amount / analytics.totalCollected) * 100;
            return (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{method}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">${amount.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collection Efficiency */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={20} className="text-orange-600" />
          <h3 className="font-semibold text-gray-900">Collection Efficiency</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Collection Rate</span>
            <span className={`font-bold text-lg ${analytics.collectionRate >= 90 ? 'text-green-600' : analytics.collectionRate >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
              {analytics.collectionRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${analytics.collectionRate >= 90 ? 'bg-green-500' : analytics.collectionRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${analytics.collectionRate}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Expected:</span>
              <span className="font-medium ml-2">${analytics.totalExpected.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">Collected:</span>
              <span className="font-medium ml-2">${analytics.totalCollected.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentAnalytics;