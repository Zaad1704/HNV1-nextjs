import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Brain, TrendingUp, AlertCircle, Star, Target, Zap } from 'lucide-react';
import apiClient from '@/lib/api';

interface TenantInsightsPanelProps {
  tenants: any[];
  className?: string;
}

const TenantInsightsPanel: React.FC<TenantInsightsPanelProps> = ({ tenants, className = '' }) => {
  // Fetch properties data to calculate accurate occupancy
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/properties');
        return data.data || [];
      } catch (error) {
        return [];
      }
    }
  });
  // Calculate insights from tenant data with accurate occupancy
  const insights = React.useMemo(() => {
    if (!tenants.length || !properties.length) return null;

    const totalTenants = tenants.length;
    const activeTenants = tenants.filter(t => t.status === 'Active').length;
    const lateTenants = tenants.filter(t => t.status === 'Late').length;
    const totalRent = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
    
    // Calculate total available units across all properties
    const totalUnits = properties.reduce((sum, property) => {
      return sum + (property.numberOfUnits || 1);
    }, 0);
    
    // Calculate occupied units (active tenants)
    const occupiedUnits = activeTenants;
    
    // Lease expiry analysis
    const expiringLeases = tenants.filter(t => {
      if (!t.leaseEndDate) return false;
      const daysUntil = Math.ceil((new Date(t.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 90 && daysUntil > 0;
    }).length;

    // Long-term tenant analysis
    const longTermTenants = tenants.filter(t => {
      if (!t.leaseStartDate) return false;
      const monthsSince = (new Date().getTime() - new Date(t.leaseStartDate).getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsSince >= 12;
    }).length;

    return {
      totalTenants,
      activeTenants,
      lateTenants,
      totalRent,
      expiringLeases,
      longTermTenants,
      totalUnits,
      occupiedUnits,
      vacantUnits: totalUnits - occupiedUnits,
      occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
      latePaymentRate: totalTenants > 0 ? Math.round((lateTenants / totalTenants) * 100) : 0,
      renewalOpportunities: expiringLeases,
      retentionRate: totalTenants > 0 ? Math.round((longTermTenants / totalTenants) * 100) : 0
    };
  }, [tenants, properties]);

  if (!insights) {
    return (
      <div className={`bg-gray-50 rounded-2xl p-6 text-center ${className}`}>
        <Brain size={32} className="text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No tenant data available for insights</p>
      </div>
    );
  }

  const getInsightLevel = (value: number, thresholds: number[]) => {
    if (value >= thresholds[0]) return { level: 'excellent', color: 'green' };
    if (value >= thresholds[1]) return { level: 'good', color: 'blue' };
    if (value >= thresholds[2]) return { level: 'fair', color: 'yellow' };
    return { level: 'needs attention', color: 'red' };
  };

  const occupancyInsight = getInsightLevel(insights.occupancyRate, [95, 85, 70]);
  const retentionInsight = getInsightLevel(insights.retentionRate, [80, 60, 40]);
  const paymentInsight = getInsightLevel(100 - insights.latePaymentRate, [95, 85, 70]);

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
          <Brain size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-900">Tenant Insights</h3>
          <p className="text-sm text-gray-600">AI-powered portfolio analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Target size={16} className="text-purple-600" />
            Key Metrics
          </h4>
          
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Occupancy Rate</span>
                <span className={`text-xs px-2 py-1 rounded-full bg-${occupancyInsight.color}-100 text-${occupancyInsight.color}-800`}>
                  {occupancyInsight.level}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{insights.occupancyRate}%</div>
              <div className="text-xs text-gray-500 mb-2">
                {insights.occupiedUnits} occupied / {insights.totalUnits} total units
                {insights.vacantUnits > 0 && (
                  <span className="text-orange-600 font-medium"> • {insights.vacantUnits} vacant</span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-${occupancyInsight.color}-500 h-2 rounded-full transition-all duration-1000`}
                  style={{ width: `${insights.occupancyRate}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Payment Performance</span>
                <span className={`text-xs px-2 py-1 rounded-full bg-${paymentInsight.color}-100 text-${paymentInsight.color}-800`}>
                  {paymentInsight.level}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{100 - insights.latePaymentRate}%</div>
              <div className="text-xs text-gray-500">{insights.lateTenants} late payments</div>
            </div>
          </div>
        </div>

        {/* Opportunities */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Zap size={16} className="text-yellow-600" />
            Opportunities
          </h4>
          
          <div className="space-y-3">
            {insights.renewalOpportunities > 0 && (
              <div className="bg-white rounded-xl p-4 border border-yellow-200 border-l-4 border-l-yellow-500">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={16} className="text-yellow-600" />
                  <span className="font-medium text-gray-900">Lease Renewals</span>
                </div>
                <p className="text-sm text-gray-600">
                  {insights.renewalOpportunities} leases expiring in 90 days
                </p>
                <button className="text-xs text-yellow-700 hover:text-yellow-800 mt-2">
                  Start renewal process →
                </button>
              </div>
            )}

            {insights.latePaymentRate > 10 && (
              <div className="bg-white rounded-xl p-4 border border-red-200 border-l-4 border-l-red-500">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={16} className="text-red-600" />
                  <span className="font-medium text-gray-900">Payment Follow-up</span>
                </div>
                <p className="text-sm text-gray-600">
                  {insights.lateTenants} tenants need payment reminders
                </p>
                <button className="text-xs text-red-700 hover:text-red-800 mt-2">
                  Send reminders →
                </button>
              </div>
            )}

            {insights.vacantUnits > 0 && (
              <div className="bg-white rounded-xl p-4 border border-orange-200 border-l-4 border-l-orange-500">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={16} className="text-orange-600" />
                  <span className="font-medium text-gray-900">Vacant Units</span>
                </div>
                <p className="text-sm text-gray-600">
                  {insights.vacantUnits} units available for rent
                </p>
                <button className="text-xs text-orange-700 hover:text-orange-800 mt-2">
                  Market vacant units →
                </button>
              </div>
            )}

            <div className="bg-white rounded-xl p-4 border border-green-200 border-l-4 border-l-green-500">
              <div className="flex items-center gap-2 mb-1">
                <Star size={16} className="text-green-600" />
                <span className="font-medium text-gray-900">Revenue Potential</span>
              </div>
              <p className="text-sm text-gray-600">
                ${insights.totalRent.toLocaleString()}/month total rent
              </p>
              <button className="text-xs text-green-700 hover:text-green-800 mt-2">
                Optimize pricing →
              </button>
            </div>
          </div>
        </div>

        {/* Trends */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-600" />
            Trends
          </h4>
          
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Tenant Retention</span>
                <TrendingUp size={14} className={`text-${retentionInsight.color}-600`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{insights.retentionRate}%</div>
              <div className="text-xs text-gray-500">{insights.longTermTenants} long-term tenants</div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="text-sm text-gray-600 mb-2">Portfolio Health</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.round((insights.occupancyRate + (100 - insights.latePaymentRate)) / 2)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {Math.round((insights.occupancyRate + (100 - insights.latePaymentRate)) / 2)}%
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Overall performance score</div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-4 text-white">
              <div className="text-sm opacity-90 mb-1">Next Action</div>
              <div className="font-medium">
                {insights.vacantUnits > 0
                  ? `Market ${insights.vacantUnits} vacant units to increase occupancy`
                  : insights.renewalOpportunities > 0 
                  ? `Contact ${insights.renewalOpportunities} tenants for lease renewal`
                  : insights.latePaymentRate > 10
                  ? `Follow up on ${insights.lateTenants} late payments`
                  : 'Portfolio performing well - consider expansion'
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantInsightsPanel;