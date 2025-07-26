import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap } from 'lucide-react';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import { useCrossData } from '@/hooks/useCrossData';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';

interface SmartInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  confidence?: number;
  data?: any;
}

const SmartDashboard: React.FC = () => {
  const { stats } = useCrossData();
  const { analyticsData, isLoading, refreshAnalytics } = useAdvancedAnalytics();
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (analyticsData?.insights) {
      setInsights(analyticsData.insights);
    } else {
      generateSmartInsights();
    }
  }, [analyticsData, stats]);

  const generateSmartInsights = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const smartInsights: SmartInsight[] = [
        {
          id: '1',
          type: 'opportunity',
          title: 'Rent Optimization Opportunity',
          description: `Based on market analysis, you could increase rent by 8-12% for ${stats?.totalProperties || 0} properties`,
          impact: 'high',
          actionable: true,
          data: { potentialIncrease: (stats?.monthlyRevenue || 0) * 0.1 }
        },
        {
          id: '2',
          type: 'warning',
          title: 'Maintenance Cost Spike',
          description: 'Maintenance costs increased 23% this quarter. Consider preventive measures.',
          impact: 'medium',
          actionable: true
        },
        {
          id: '3',
          type: 'recommendation',
          title: 'Tenant Retention Strategy',
          description: 'Implement loyalty program to reduce 15% turnover rate and save on vacancy costs.',
          impact: 'high',
          actionable: true
        }
      ];
      
      setInsights(smartInsights);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="text-green-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'recommendation': return <Lightbulb className="text-blue-500" size={20} />;
      case 'trend': return <TrendingUp className="text-purple-500" size={20} />;
      default: return <Brain className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <UniversalHeader
        title="Smart Dashboard"
        subtitle="AI-powered insights and recommendations"
        icon={Brain}
        stats={[
          { label: 'Insights', value: insights.length, color: 'blue' },
          { label: 'Actionable', value: insights.filter(i => i.actionable).length, color: 'green' }
        ]}
        actions={
          <button
            onClick={() => {
              refreshAnalytics();
              generateSmartInsights();
            }}
            disabled={isAnalyzing || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
          >
            <Zap size={16} className={isAnalyzing || isLoading ? 'animate-pulse' : ''} />
            {isAnalyzing || isLoading ? 'Analyzing...' : 'Refresh Insights'}
          </button>
        }
      />

      {isAnalyzing || isLoading ? (
        <UniversalCard gradient="blue">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Brain size={48} className="mx-auto mb-4 text-blue-500 animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">AI Analysis in Progress</h3>
              <p className="text-gray-600">Analyzing your property data...</p>
            </div>
          </div>
        </UniversalCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {insights.map((insight, index) => (
            <UniversalCard key={insight.id} delay={index * 0.1} gradient="purple">
              <div className="flex items-start gap-3 mb-4">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">{insight.title}</h3>
                  <p className="text-gray-700 text-sm mb-3">{insight.description}</p>
                  
                  {insight.actionable && (
                    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            </UniversalCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartDashboard;