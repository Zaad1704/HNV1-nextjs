import React, { useState, useEffect } from 'react';
import { Zap, Clock, TrendingUp, Target, CheckCircle, AlertTriangle } from 'lucide-react';
import UniversalCard from '@/components/common/UniversalCard';
import UniversalHeader from '@/components/common/UniversalHeader';
import UniversalStatusBadge from '@/components/common/UniversalStatusBadge';

interface OptimizationSuggestion {
  id: string;
  category: 'performance' | 'cost' | 'efficiency' | 'automation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  estimatedSavings: number;
  timeToImplement: string;
  status: 'pending' | 'in-progress' | 'completed';
}

const PerformanceOptimizer: React.FC = () => {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    generateOptimizations();
  }, []);

  const generateOptimizations = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const optimizations: OptimizationSuggestion[] = [
        {
          id: '1',
          category: 'automation',
          title: 'Automate Rent Collection Reminders',
          description: 'Set up automated SMS/email reminders 3 days before rent due date',
          impact: 'high',
          effort: 'low',
          estimatedSavings: 480,
          timeToImplement: '2 hours',
          status: 'pending'
        },
        {
          id: '2',
          category: 'efficiency',
          title: 'Bulk Property Updates',
          description: 'Use bulk operations for property maintenance scheduling',
          impact: 'medium',
          effort: 'low',
          estimatedSavings: 240,
          timeToImplement: '1 hour',
          status: 'pending'
        },
        {
          id: '3',
          category: 'cost',
          title: 'Preventive Maintenance Program',
          description: 'Schedule regular maintenance to reduce emergency repair costs',
          impact: 'high',
          effort: 'medium',
          estimatedSavings: 3500,
          timeToImplement: '1 week',
          status: 'in-progress'
        },
        {
          id: '4',
          category: 'performance',
          title: 'Tenant Communication Hub',
          description: 'Centralize all tenant communications in one platform',
          impact: 'medium',
          effort: 'medium',
          estimatedSavings: 360,
          timeToImplement: '3 days',
          status: 'completed'
        }
      ];
      
      setSuggestions(optimizations);
      setIsAnalyzing(false);
    }, 1500);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'automation': return <Zap className="text-blue-500" size={20} />;
      case 'efficiency': return <TrendingUp className="text-green-500" size={20} />;
      case 'cost': return <Target className="text-red-500" size={20} />;
      case 'performance': return <Clock className="text-purple-500" size={20} />;
      default: return <CheckCircle className="text-gray-500" size={20} />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'bg-red-50 text-red-700';
      case 'medium': return 'bg-yellow-50 text-yellow-700';
      case 'low': return 'bg-green-50 text-green-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  const implementSuggestion = (id: string) => {
    setSuggestions(prev => prev.map(s => 
      s.id === id ? { ...s, status: 'in-progress' } : s
    ));
  };

  return (
    <div className="space-y-6">
      <UniversalHeader
        title="Performance Optimizer"
        subtitle="AI-powered suggestions to optimize your property management workflow"
        icon={Zap}
        stats={[
          { label: 'Suggestions', value: suggestions.length, color: 'blue' },
          { label: 'Potential Savings', value: `${suggestions.reduce((sum, s) => sum + s.estimatedSavings, 0)}h/year`, color: 'green' },
          { label: 'Completed', value: suggestions.filter(s => s.status === 'completed').length, color: 'purple' }
        ]}
      />

      {isAnalyzing ? (
        <UniversalCard gradient="blue">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Zap size={48} className="mx-auto mb-4 text-blue-500 animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">Analyzing Performance</h3>
              <p className="text-gray-600">Identifying optimization opportunities...</p>
            </div>
          </div>
        </UniversalCard>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {suggestions.map((suggestion, index) => (
            <UniversalCard key={suggestion.id} delay={index * 0.1} gradient="orange">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(suggestion.category)}
                  <div>
                    <h3 className="font-bold text-gray-900">{suggestion.title}</h3>
                    <p className="text-sm text-gray-600 capitalize">{suggestion.category}</p>
                  </div>
                </div>
                <UniversalStatusBadge 
                  status={suggestion.status} 
                  variant={
                    suggestion.status === 'completed' ? 'success' :
                    suggestion.status === 'in-progress' ? 'warning' : 'default'
                  }
                />
              </div>

              <p className="text-gray-700 mb-4">{suggestion.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className={`p-3 rounded-lg border ${getImpactColor(suggestion.impact)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} />
                    <span className="text-xs font-medium">Impact</span>
                  </div>
                  <span className="text-sm font-semibold capitalize">{suggestion.impact}</span>
                </div>

                <div className={`p-3 rounded-lg ${getEffortColor(suggestion.effort)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={14} />
                    <span className="text-xs font-medium">Effort</span>
                  </div>
                  <span className="text-sm font-semibold capitalize">{suggestion.effort}</span>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Estimated Savings:</span>
                  <span className="font-semibold text-green-800">
                    {suggestion.category === 'cost' ? `$${suggestion.estimatedSavings}` : `${suggestion.estimatedSavings}h`}/year
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-green-700">Time to Implement:</span>
                  <span className="font-semibold text-green-800">{suggestion.timeToImplement}</span>
                </div>
              </div>

              {suggestion.status === 'pending' && (
                <button
                  onClick={() => implementSuggestion(suggestion.id)}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Implement Now
                </button>
              )}

              {suggestion.status === 'in-progress' && (
                <div className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 rounded-lg text-center font-medium">
                  Implementation in Progress...
                </div>
              )}

              {suggestion.status === 'completed' && (
                <div className="w-full bg-green-100 text-green-800 py-2 px-4 rounded-lg text-center font-medium flex items-center justify-center gap-2">
                  <CheckCircle size={16} />
                  Completed
                </div>
              )}
            </UniversalCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerformanceOptimizer;