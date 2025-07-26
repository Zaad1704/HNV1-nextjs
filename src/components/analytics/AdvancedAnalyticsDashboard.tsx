import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, PieChart, AlertTriangle, Target, Calendar, DollarSign } from 'lucide-react';
import apiClient from '@/lib/api';

interface AnalyticsData {
  current: {
    occupancyRate: number;
    totalUnits: number;
    totalTenants: number;
    monthlyRevenue: number;
    avgRent: number;
  };
  predictions: {
    nextMonthOccupancy: number;
    nextMonthRevenue: number;
    confidence: number;
  };
  benchmarks: {
    industryAvgOccupancy: number;
    industryAvgRent: number;
    marketTrend: string;
  };
  insights: Array<{
    type: string;
    message: string;
    trend: string;
  }>;
}

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await apiClient.get(`/advanced-analytics/dashboard?timeframe=${timeframe}`);
      setAnalytics(data.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading advanced analytics...</div>;
  }

  if (!analytics) {
    return <div className="p-8 text-center text-gray-500">No analytics data available</div>;
  }

  const occupancyTrend = analytics.predictions.nextMonthOccupancy > analytics.current.occupancyRate;
  const revenueTrend = analytics.predictions.nextMonthRevenue > analytics.current.monthlyRevenue;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics Dashboard</h1>
        <div className="flex gap-2">
          {['7', '30', '90', '365'].map((days) => (
            <button
              key={days}
              onClick={() => setTimeframe(days)}
              className={`px-3 py-1 rounded-lg text-sm ${
                timeframe === days
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupancy Rate</p>
              <p className="text-2xl font-bold">{analytics.current.occupancyRate.toFixed(1)}%</p>
              <div className="flex items-center gap-1 mt-1">
                {occupancyTrend ? (
                  <TrendingUp size={16} className="text-green-600" />
                ) : (
                  <TrendingDown size={16} className="text-red-600" />
                )}
                <span className={`text-sm ${occupancyTrend ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(analytics.predictions.nextMonthOccupancy - analytics.current.occupancyRate).toFixed(1)}%
                </span>
              </div>
            </div>
            <PieChart className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold">${analytics.current.monthlyRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                {revenueTrend ? (
                  <TrendingUp size={16} className="text-green-600" />
                ) : (
                  <TrendingDown size={16} className="text-red-600" />
                )}
                <span className={`text-sm ${revenueTrend ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(analytics.predictions.nextMonthRevenue - analytics.current.monthlyRevenue).toLocaleString()}
                </span>
              </div>
            </div>
            <DollarSign className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Units</p>
              <p className="text-2xl font-bold">{analytics.current.totalUnits}</p>
              <p className="text-sm text-gray-500 mt-1">
                {analytics.current.totalTenants} tenants
              </p>
            </div>
            <BarChart3 className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rent</p>
              <p className="text-2xl font-bold">${analytics.current.avgRent.toFixed(0)}</p>
              <p className="text-sm text-gray-500 mt-1">
                vs ${analytics.benchmarks.industryAvgRent} industry
              </p>
            </div>
            <Target className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Predictions & Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            Predictions (Next Month)
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium">Occupancy Rate</span>
              <div className="text-right">
                <span className="font-bold">{analytics.predictions.nextMonthOccupancy.toFixed(1)}%</span>
                <div className="text-xs text-gray-500">
                  {(analytics.predictions.confidence * 100).toFixed(0)}% confidence
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Revenue</span>
              <div className="text-right">
                <span className="font-bold">${analytics.predictions.nextMonthRevenue.toLocaleString()}</span>
                <div className="text-xs text-gray-500">
                  {(analytics.predictions.confidence * 100).toFixed(0)}% confidence
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="text-orange-600" size={20} />
            Industry Benchmarks
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Your Occupancy</span>
              <span className="font-bold">{analytics.current.occupancyRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Industry Average</span>
              <span className="font-bold text-gray-600">{analytics.benchmarks.industryAvgOccupancy}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-blue-600 rounded-full"
                style={{ width: `${(analytics.current.occupancyRate / analytics.benchmarks.industryAvgOccupancy) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm">Market Trend</span>
              <span className={`font-bold capitalize ${
                analytics.benchmarks.marketTrend === 'increasing' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {analytics.benchmarks.marketTrend}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="text-yellow-600" size={20} />
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.insights.map((insight, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              insight.trend === 'positive' 
                ? 'bg-green-50 border-green-500' 
                : insight.trend === 'negative'
                ? 'bg-red-50 border-red-500'
                : 'bg-blue-50 border-blue-500'
            }`}>
              <div className="flex items-center gap-2">
                {insight.trend === 'positive' ? (
                  <TrendingUp size={16} className="text-green-600" />
                ) : insight.trend === 'negative' ? (
                  <TrendingDown size={16} className="text-red-600" />
                ) : (
                  <BarChart3 size={16} className="text-blue-600" />
                )}
                <span className="font-medium capitalize">{insight.type}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{insight.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;