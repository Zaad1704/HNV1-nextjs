import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, X, ArrowRight } from 'lucide-react';

interface Recommendation {
  id: string;
  type: 'optimization' | 'alert' | 'opportunity' | 'maintenance';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  action?: string;
  value?: string;
}

const SmartRecommendations = () => {
  const [recommendations] = useState<Recommendation[]>([
    {
      id: '1',
      type: 'opportunity',
      title: 'Rent Increase Opportunity',
      description: 'Market analysis shows 3 units are priced 8% below market rate. Consider gradual increases.',
      impact: 'high',
      category: 'Revenue',
      action: 'Review Pricing',
      value: '+$340/month'
    },
    {
      id: '2',
      type: 'optimization',
      title: 'Energy Efficiency Upgrade',
      description: 'Installing smart thermostats could reduce utility costs by 15% across 5 properties.',
      impact: 'medium',
      category: 'Cost Savings',
      action: 'Get Quote',
      value: '-$180/month'
    },
    {
      id: '3',
      type: 'alert',
      title: 'Lease Renewal Risk',
      description: '2 high-value tenants have leases expiring in 60 days. Early renewal incentives recommended.',
      impact: 'high',
      category: 'Retention',
      action: 'Contact Tenants',
      value: 'Risk: -$2,400'
    },
    {
      id: '4',
      type: 'maintenance',
      title: 'Preventive Maintenance',
      description: 'HVAC systems in Building A are due for seasonal maintenance to prevent costly repairs.',
      impact: 'medium',
      category: 'Maintenance',
      action: 'Schedule Service',
      value: 'Save: $800'
    }
  ]);

  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp size={20} className="text-green-600" />;
      case 'alert': return <AlertTriangle size={20} className="text-red-600" />;
      case 'optimization': return <Lightbulb size={20} className="text-blue-600" />;
      case 'maintenance': return <CheckCircle size={20} className="text-orange-600" />;
      default: return <Lightbulb size={20} className="text-gray-600" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-50 border-green-200';
      case 'alert': return 'bg-red-50 border-red-200';
      case 'optimization': return 'bg-blue-50 border-blue-200';
      case 'maintenance': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const dismissRecommendation = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  const activeRecommendations = recommendations.filter(r => !dismissedIds.includes(r.id));

  if (activeRecommendations.length === 0) {
    return (
      <div className="app-surface rounded-3xl p-8 border border-app-border text-center">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-text-primary mb-2">All Caught Up!</h3>
        <p className="text-text-secondary">No new recommendations at this time.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Smart Recommendations</h2>
          <p className="text-text-secondary">AI-powered insights to optimize your portfolio</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Lightbulb size={16} />
          <span>{activeRecommendations.length} active insights</span>
        </div>
      </div>

      <div className="space-y-4">
        {activeRecommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-2xl border ${getBackgroundColor(recommendation.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(recommendation.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{recommendation.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(recommendation.impact)}`}>
                      {recommendation.impact} impact
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {recommendation.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{recommendation.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {recommendation.action && (
                        <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 transition-colors">
                          {recommendation.action}
                          <ArrowRight size={14} />
                        </button>
                      )}
                      {recommendation.value && (
                        <div className="text-sm font-semibold text-gray-900">
                          {recommendation.value}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => dismissRecommendation(recommendation.id)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {dismissedIds.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => setDismissedIds([])}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Show {dismissedIds.length} dismissed recommendation{dismissedIds.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default SmartRecommendations;