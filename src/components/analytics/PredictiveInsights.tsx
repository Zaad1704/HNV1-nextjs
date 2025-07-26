import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Lightbulb, Target, Shield, Wrench, CreditCard } from 'lucide-react';
import apiClient from '@/lib/api';

interface PredictiveInsightsData {
  risks: {
    vacancy: { highRiskUnits: number; totalRisk: string };
    payment: { latePayments: number; totalRisk: string };
    maintenance: { unitsInMaintenance: number; totalRisk: string };
  };
  opportunities: Array<{
    type: string;
    description: string;
  }>;
  recommendations: Array<{
    priority: string;
    action: string;
  }>;
  marketTrends: {
    rentTrend: string;
    demandTrend: string;
    competitionLevel: string;
  };
}

const PredictiveInsights: React.FC = () => {
  const [insights, setInsights] = useState<PredictiveInsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const { data } = await apiClient.get('/advanced-analytics/insights');
      setInsights(data.data);
    } catch (error) {
      console.error('Failed to fetch predictive insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading predictive insights...</div>;
  }

  if (!insights) {
    return <div className="p-4 text-center text-gray-500">No insights data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Risk Assessment */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="text-red-600" size={20} />
            Risk Assessment
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${getRiskColor(insights.risks.vacancy.totalRisk)}`}>
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle size={20} />
                <span className="font-medium">Vacancy Risk</span>
              </div>
              <div className="text-2xl font-bold mb-1">{insights.risks.vacancy.highRiskUnits}</div>
              <div className="text-sm">High-risk units</div>
              <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium inline-block ${getRiskColor(insights.risks.vacancy.totalRisk)}`}>
                {insights.risks.vacancy.totalRisk.toUpperCase()} RISK
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${getRiskColor(insights.risks.payment.totalRisk)}`}>
              <div className="flex items-center gap-3 mb-2">
                <CreditCard size={20} />
                <span className="font-medium">Payment Risk</span>
              </div>
              <div className="text-2xl font-bold mb-1">{insights.risks.payment.latePayments}</div>
              <div className="text-sm">Late payments</div>
              <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium inline-block ${getRiskColor(insights.risks.payment.totalRisk)}`}>
                {insights.risks.payment.totalRisk.toUpperCase()} RISK
              </div>
            </div>

            <div className={`p-4 rounded-lg border ${getRiskColor(insights.risks.maintenance.totalRisk)}`}>
              <div className="flex items-center gap-3 mb-2">
                <Wrench size={20} />
                <span className="font-medium">Maintenance Risk</span>
              </div>
              <div className="text-2xl font-bold mb-1">{insights.risks.maintenance.unitsInMaintenance}</div>
              <div className="text-sm">Units in maintenance</div>
              <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium inline-block ${getRiskColor(insights.risks.maintenance.totalRisk)}`}>
                {insights.risks.maintenance.totalRisk.toUpperCase()} RISK
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Trends */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={20} />
            Market Trends
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp size={24} className="text-blue-600" />
              </div>
              <div className="font-medium text-gray-900">Rent Trend</div>
              <div className={`text-lg font-bold capitalize ${
                insights.marketTrends.rentTrend === 'increasing' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {insights.marketTrends.rentTrend}
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target size={24} className="text-purple-600" />
              </div>
              <div className="font-medium text-gray-900">Demand Trend</div>
              <div className={`text-lg font-bold capitalize ${
                insights.marketTrends.demandTrend === 'increasing' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {insights.marketTrends.demandTrend}
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield size={24} className="text-orange-600" />
              </div>
              <div className="font-medium text-gray-900">Competition</div>
              <div className={`text-lg font-bold capitalize ${
                insights.marketTrends.competitionLevel === 'low' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {insights.marketTrends.competitionLevel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="text-yellow-600" size={20} />
              Opportunities
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {insights.opportunities.map((opportunity, index) => (
                <div key={index} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="font-medium text-yellow-900 capitalize mb-2">
                    {opportunity.type.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-yellow-800">
                    {opportunity.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="text-green-600" size={20} />
              Recommendations
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {insights.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full mt-1 ${getPriorityColor(recommendation.priority)}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                        recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {recommendation.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      {recommendation.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveInsights;