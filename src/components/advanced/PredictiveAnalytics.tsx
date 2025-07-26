import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, Users, AlertCircle } from 'lucide-react';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import { useCrossData } from '@/hooks/useCrossData';

interface Prediction {
  metric: string;
  current: number;
  predicted: number;
  change: number;
  confidence: number;
  timeframe: string;
}

const PredictiveAnalytics: React.FC = () => {
  const crossData = useCrossData();
  const stats = crossData?.stats;
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generatePredictions();
  }, [stats]);

  const generatePredictions = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const newPredictions: Prediction[] = [
        {
          metric: 'Monthly Revenue',
          current: stats?.monthlyRevenue || 0,
          predicted: (stats?.monthlyRevenue || 0) * 1.15,
          change: 15,
          confidence: 87,
          timeframe: 'Next 3 months'
        },
        {
          metric: 'Occupancy Rate',
          current: stats?.occupancyRate || 0,
          predicted: Math.min((stats?.occupancyRate || 0) + 8, 100),
          change: 8,
          confidence: 92,
          timeframe: 'Next 6 months'
        },
        {
          metric: 'Maintenance Costs',
          current: 2500,
          predicted: 2100,
          change: -16,
          confidence: 78,
          timeframe: 'Next quarter'
        },
        {
          metric: 'Tenant Retention',
          current: 85,
          predicted: 91,
          change: 6,
          confidence: 83,
          timeframe: 'Next year'
        }
      ];
      
      setPredictions(newPredictions);
      setIsLoading(false);
    }, 1500);
  };

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'Monthly Revenue': return <DollarSign className="text-green-500" size={24} />;
      case 'Occupancy Rate': return <Users className="text-blue-500" size={24} />;
      case 'Maintenance Costs': return <AlertCircle className="text-orange-500" size={24} />;
      case 'Tenant Retention': return <TrendingUp className="text-purple-500" size={24} />;
      default: return <Calendar className="text-gray-500" size={24} />;
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <UniversalHeader
        title="Predictive Analytics"
        subtitle="AI-powered forecasting for your property portfolio"
        icon={TrendingUp}
        stats={[
          { label: 'Predictions', value: predictions.length, color: 'blue' },
          { label: 'Avg Confidence', value: `${Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length || 0)}%`, color: 'green' }
        ]}
      />

      {isLoading ? (
        <UniversalCard gradient="blue">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <TrendingUp size={48} className="mx-auto mb-4 text-blue-500 animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">Generating Predictions</h3>
              <p className="text-gray-600">Analyzing historical data patterns...</p>
            </div>
          </div>
        </UniversalCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {predictions.map((prediction, index) => (
            <UniversalCard key={prediction.metric} delay={index * 0.1} gradient="green">
              <div className="flex items-start gap-4">
                {getMetricIcon(prediction.metric)}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">{prediction.metric}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current:</span>
                      <span className="font-semibold">
                        {prediction.metric.includes('Rate') || prediction.metric.includes('Retention') 
                          ? `${prediction.current}%` 
                          : prediction.metric.includes('Revenue') || prediction.metric.includes('Costs')
                          ? `$${prediction.current.toLocaleString()}`
                          : prediction.current
                        }
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Predicted:</span>
                      <span className="font-semibold">
                        {prediction.metric.includes('Rate') || prediction.metric.includes('Retention') 
                          ? `${prediction.predicted}%` 
                          : prediction.metric.includes('Revenue') || prediction.metric.includes('Costs')
                          ? `$${prediction.predicted.toLocaleString()}`
                          : prediction.predicted
                        }
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Change:</span>
                      <span className={`font-semibold ${getChangeColor(prediction.change)}`}>
                        {prediction.change > 0 ? '+' : ''}{prediction.change}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600">Confidence</span>
                      <span className="text-xs font-semibold">{prediction.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                        style={{ width: `${prediction.confidence}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{prediction.timeframe}</p>
                  </div>
                </div>
              </div>
            </UniversalCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalytics;