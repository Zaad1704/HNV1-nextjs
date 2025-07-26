import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Target, Lightbulb } from 'lucide-react';
import UniversalCard from '@/components/common/UniversalCard';
import { useCrossData } from '@/hooks/useCrossData';

interface QuickInsight {
  id: string;
  type: 'trend' | 'warning' | 'opportunity' | 'tip';
  title: string;
  value: string;
  change?: number;
}

const QuickInsightsWidget: React.FC = () => {
  const { stats } = useCrossData();
  const [insights, setInsights] = useState<QuickInsight[]>([]);

  useEffect(() => {
    const quickInsights: QuickInsight[] = [
      {
        id: '1',
        type: 'trend',
        title: 'Revenue Growth',
        value: '+12%',
        change: 12
      },
      {
        id: '2',
        type: 'warning',
        title: 'Late Payments',
        value: '3 overdue',
        change: -2
      },
      {
        id: '3',
        type: 'opportunity',
        title: 'Rent Increase',
        value: '$2,400/mo',
        change: 8
      },
      {
        id: '4',
        type: 'tip',
        title: 'Automation Savings',
        value: '24h/week',
        change: 35
      }
    ];
    
    setInsights(quickInsights);
  }, [stats]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp size={16} className="text-blue-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'opportunity': return <Target size={16} className="text-green-500" />;
      case 'tip': return <Lightbulb size={16} className="text-purple-500" />;
      default: return <TrendingUp size={16} className="text-gray-500" />;
    }
  };

  const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-600';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <UniversalCard gradient="blue" className="quick-insights-widget">
      <h3 className="font-bold text-lg mb-4">Quick Insights</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {insights.map((insight) => (
          <div key={insight.id} className="bg-white/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              {getIcon(insight.type)}
              <span className="text-xs font-medium text-gray-700 truncate">
                {insight.title}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">{insight.value}</span>
              {insight.change && (
                <span className={`text-xs font-medium ${getChangeColor(insight.change)}`}>
                  {insight.change > 0 ? '+' : ''}{insight.change}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </UniversalCard>
  );
};

export default QuickInsightsWidget;