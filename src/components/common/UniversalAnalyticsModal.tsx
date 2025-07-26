import React, { useState, useMemo } from 'react';
import { BarChart3, X, TrendingUp, TrendingDown, DollarSign, Calendar, Building2, Users } from 'lucide-react';

interface UniversalAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionName: string;
  data?: any[];
}

const UniversalAnalyticsModal: React.FC<UniversalAnalyticsModalProps> = ({
  isOpen,
  onClose,
  sectionName,
  data = []
}) => {
  const [timeRange, setTimeRange] = useState('30d');

  const analytics = useMemo(() => {
    return generateAnalytics(data, sectionName, timeRange);
  }, [data, sectionName, timeRange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 size={24} className="text-blue-500" />
              {sectionName} Analytics
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex gap-2 mt-4">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {analytics.keyMetrics.map((metric, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-600">{metric.label}</div>
                  <metric.icon size={20} className={metric.color} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <div className={`text-sm flex items-center gap-1 mt-1 ${
                  metric.change > 0 ? 'text-green-600' : metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.change > 0 ? <TrendingUp size={14} /> : metric.change < 0 ? <TrendingDown size={14} /> : null}
                  {metric.change !== 0 ? `${Math.abs(metric.change)}%` : 'No change'} vs previous period
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Trend Chart */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Analysis</h3>
              <div className="h-48 flex items-end justify-between gap-2">
                {analytics.trendData.map((point, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${(point.value / Math.max(...analytics.trendData.map(p => p.value))) * 100}%` }}
                    ></div>
                    <div className="text-xs text-gray-600 mt-2">{point.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution</h3>
              <div className="space-y-3">
                {analytics.distributionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900">{item.value}</div>
                      <div className="text-xs text-gray-500">({item.percentage}%)</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
            <div className="space-y-3">
              {analytics.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-gray-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const generateAnalytics = (data: any[], sectionName: string, timeRange: string) => {
  const now = new Date();
  const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
  
  // Filter data by time range
  const filteredData = data.filter(item => {
    const itemDate = new Date(item.createdAt || item.date || item.paymentDate || now);
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    return itemDate >= cutoffDate;
  });

  switch (sectionName) {
    case 'Property':
      return {
        keyMetrics: [
          { label: 'Total Properties', value: filteredData.length, change: 5, icon: Building2, color: 'text-blue-500' },
          { label: 'Occupancy Rate', value: '85%', change: 2, icon: Users, color: 'text-green-500' },
          { label: 'Avg Rent', value: '$1,250', change: -1, icon: DollarSign, color: 'text-orange-500' }
        ],
        trendData: generateTrendData(filteredData, daysBack),
        distributionData: [
          { label: 'Single Family', value: '12', percentage: 60, color: '#3B82F6' },
          { label: 'Multi-Unit', value: '6', percentage: 30, color: '#10B981' },
          { label: 'Commercial', value: '2', percentage: 10, color: '#F59E0B' }
        ],
        insights: [
          'Property portfolio has grown by 5% this period',
          'Occupancy rate is above market average',
          'Consider expanding in high-demand areas'
        ]
      };

    case 'Tenant':
      return {
        keyMetrics: [
          { label: 'Active Tenants', value: filteredData.length, change: 3, icon: Users, color: 'text-blue-500' },
          { label: 'On-Time Payments', value: '92%', change: 5, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Avg Lease Length', value: '14 mo', change: 0, icon: Calendar, color: 'text-purple-500' }
        ],
        trendData: generateTrendData(filteredData, daysBack),
        distributionData: [
          { label: 'Active', value: '45', percentage: 75, color: '#10B981' },
          { label: 'Late Payment', value: '8', percentage: 13, color: '#F59E0B' },
          { label: 'Inactive', value: '7', percentage: 12, color: '#EF4444' }
        ],
        insights: [
          'Tenant retention rate is excellent at 92%',
          'Late payments decreased by 15% this month',
          'Consider implementing automated payment reminders'
        ]
      };

    case 'Payment':
      const totalAmount = filteredData.reduce((sum, p) => sum + (p.amount || 0), 0);
      return {
        keyMetrics: [
          { label: 'Total Collected', value: `$${totalAmount.toLocaleString()}`, change: 8, icon: DollarSign, color: 'text-green-500' },
          { label: 'Payment Count', value: filteredData.length, change: 12, icon: TrendingUp, color: 'text-blue-500' },
          { label: 'Avg Payment', value: `$${Math.round(totalAmount / filteredData.length || 0)}`, change: -2, icon: BarChart3, color: 'text-purple-500' }
        ],
        trendData: generateTrendData(filteredData, daysBack),
        distributionData: [
          { label: 'Rent Payments', value: '85%', percentage: 85, color: '#10B981' },
          { label: 'Late Fees', value: '10%', percentage: 10, color: '#F59E0B' },
          { label: 'Other', value: '5%', percentage: 5, color: '#6B7280' }
        ],
        insights: [
          'Payment collection improved by 8% this period',
          'Digital payments account for 78% of transactions',
          'Consider offering payment incentives for early payments'
        ]
      };

    default:
      return {
        keyMetrics: [
          { label: 'Total Items', value: filteredData.length, change: 0, icon: BarChart3, color: 'text-blue-500' },
          { label: 'Growth Rate', value: '5%', change: 2, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Active Items', value: filteredData.filter(i => i.status === 'Active').length, change: 1, icon: Users, color: 'text-purple-500' }
        ],
        trendData: generateTrendData(filteredData, daysBack),
        distributionData: [
          { label: 'Active', value: '70%', percentage: 70, color: '#10B981' },
          { label: 'Pending', value: '20%', percentage: 20, color: '#F59E0B' },
          { label: 'Inactive', value: '10%', percentage: 10, color: '#EF4444' }
        ],
        insights: [
          'Overall performance is stable',
          'Consider optimizing workflow processes',
          'Monitor trends for better decision making'
        ]
      };
  }
};

const generateTrendData = (data: any[], daysBack: number) => {
  const points = Math.min(daysBack, 12);
  const interval = Math.ceil(daysBack / points);
  
  return Array.from({ length: points }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (i * interval));
    
    return {
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.floor(Math.random() * 100) + 20 // Mock data
    };
  }).reverse();
};

export default UniversalAnalyticsModal;