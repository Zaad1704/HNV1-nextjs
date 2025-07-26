import React from 'react';
import { Sparkles, Send, MessageCircle, CreditCard } from 'lucide-react';

interface PaymentSmartSuggestionsPanelProps {
  suggestions: Array<{
    title: string;
    description: string;
    action: string;
    icon: string;
  }>;
  onActionClick?: (action: string) => void;
}

const PaymentSmartSuggestionsPanel: React.FC<PaymentSmartSuggestionsPanelProps> = ({ 
  suggestions,
  onActionClick = () => {}
}) => {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="border-2 border-white/20 rounded-3xl shadow-2xl p-6 relative overflow-hidden" 
           style={{backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(0, 0, 0, 0.3)'}}>
        <div className="relative flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400/40 to-pink-400/40 rounded-xl flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <h3 className="font-bold text-white text-lg">Smart Suggestions</h3>
        </div>
        <p className="text-white/80 text-sm">No suggestions available for this payment</p>
      </div>
    );
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Send':
        return Send;
      case 'MessageCircle':
        return MessageCircle;
      case 'CreditCard':
        return CreditCard;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="border-2 border-white/20 rounded-3xl shadow-2xl overflow-hidden" 
         style={{backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', background: 'rgba(0, 0, 0, 0.3)'}}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500/80 to-pink-500/80 rounded-xl flex items-center justify-center shadow-lg border border-white/30">
            <Sparkles size={20} className="text-white" />
          </div>
          <h3 className="font-bold text-white text-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>Smart Suggestions</h3>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="p-4 space-y-4">
        {suggestions.map((suggestion, index) => {
          const IconComponent = getIconComponent(suggestion.icon);
          
          return (
            <div key={index} className="p-4 rounded-xl border border-white/10" 
                 style={{background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)'}}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-pink-500/30">
                  <IconComponent size={18} className="text-purple-300" />
                </div>
                <h4 className="font-semibold text-white">{suggestion.title}</h4>
              </div>
              <p className="text-white/70 text-sm mb-3">{suggestion.description}</p>
              <button 
                onClick={() => onActionClick(suggestion.action)}
                className="w-full py-2 bg-gradient-to-r from-purple-500/50 to-pink-500/50 hover:from-purple-500/70 hover:to-pink-500/70 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {suggestion.action}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentSmartSuggestionsPanel;