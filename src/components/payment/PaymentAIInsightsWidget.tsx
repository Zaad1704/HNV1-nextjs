import React from 'react';
import { Sparkles, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface PaymentAIInsightsWidgetProps {
  insights: Array<{
    title: string;
    description: string;
    type: string;
  }>;
}

const PaymentAIInsightsWidget: React.FC<PaymentAIInsightsWidgetProps> = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="border-2 border-white/20 rounded-3xl shadow-2xl p-6 relative overflow-hidden" 
           style={{backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(0, 0, 0, 0.3)'}}>
        <div className="relative flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400/40 to-blue-400/40 rounded-xl flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <h3 className="font-bold text-white text-lg">AI Insights</h3>
        </div>
        <p className="text-white/80 text-sm">No insights available for this payment</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-white/20 rounded-3xl shadow-2xl overflow-hidden" 
         style={{backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(0, 0, 0, 0.3)'}}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500/80 to-blue-500/80 rounded-xl flex items-center justify-center shadow-lg border border-white/30">
            <Sparkles size={20} className="text-white" />
          </div>
          <h3 className="font-bold text-white text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>AI Insights</h3>
        </div>
      </div>

      {/* Insights List */}
      <div className="p-4 space-y-4">
        {insights.map((insight, index) => {
          // Determine icon based on insight type
          let Icon = Info;
          let bgColor = 'bg-blue-500/30';
          let textColor = 'text-blue-300';
          
          if (insight.type === 'positive') {
            Icon = CheckCircle;
            bgColor = 'bg-green-500/30';
            textColor = 'text-green-300';
          } else if (insight.type === 'warning') {
            Icon = AlertTriangle;
            bgColor = 'bg-yellow-500/30';
            textColor = 'text-yellow-300';
          }
          
          return (
            <div key={index} className="flex gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor}`}>
                <Icon size={18} className={textColor} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">{insight.title}</h4>
                <p className="text-white/70 text-sm">{insight.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentAIInsightsWidget;