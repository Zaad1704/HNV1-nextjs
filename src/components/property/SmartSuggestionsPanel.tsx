import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Clock, Target, Zap } from 'lucide-react';

interface SmartSuggestionsPanelProps {
  properties: any[];
  tenants: any[];
}

const SmartSuggestionsPanel: React.FC<SmartSuggestionsPanelProps> = ({ properties, tenants }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const generateSmartSuggestions = () => {
    const suggestions = [];
    
    // Lease expiry predictions
    const expiringLeases = tenants.filter(t => {
      if (!t.leaseEndDate) return false;
      const endDate = new Date(t.leaseEndDate);
      const twoMonthsFromNow = new Date();
      twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);
      return endDate <= twoMonthsFromNow && endDate >= new Date();
    });

    if (expiringLeases.length > 0) {
      suggestions.push({
        type: 'urgent',
        icon: Clock,
        title: 'Lease Renewals Due',
        description: `${expiringLeases.length} leases expiring soon. Start renewal process now.`,
        action: 'Review Expiring Leases',
        color: 'bg-red-500',
        priority: 'high'
      });
    }

    // Vacant property optimization
    const vacantProperties = properties.filter(p => {
      const propertyTenants = tenants.filter(t => t.propertyId === p._id && t.status === 'Active');
      return propertyTenants.length === 0;
    });

    if (vacantProperties.length > 0) {
      suggestions.push({
        type: 'opportunity',
        icon: Target,
        title: 'Vacant Properties',
        description: `${vacantProperties.length} properties are vacant. Consider marketing strategies.`,
        action: 'View Vacant Properties',
        color: 'bg-orange-500',
        priority: 'medium'
      });
    }

    // Rent optimization suggestions
    const avgRent = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0) / Math.max(tenants.length, 1);
    const lowRentTenants = tenants.filter(t => t.rentAmount < avgRent * 0.8);

    if (lowRentTenants.length > 0) {
      suggestions.push({
        type: 'optimization',
        icon: TrendingUp,
        title: 'Rent Optimization',
        description: `${lowRentTenants.length} properties have below-market rent. Potential increase opportunity.`,
        action: 'Analyze Rent Rates',
        color: 'bg-green-500',
        priority: 'medium'
      });
    }

    // Maintenance predictions
    const oldProperties = properties.filter(p => {
      const createdDate = new Date(p.createdAt || Date.now());
      const yearsOld = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return yearsOld > 5;
    });

    if (oldProperties.length > 0) {
      suggestions.push({
        type: 'maintenance',
        icon: AlertTriangle,
        title: 'Maintenance Planning',
        description: `${oldProperties.length} properties may need maintenance review.`,
        action: 'Schedule Inspections',
        color: 'bg-blue-500',
        priority: 'low'
      });
    }

    // Performance insights
    const totalRevenue = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
    const occupancyRate = (tenants.filter(t => t.status === 'Active').length / Math.max(properties.length, 1)) * 100;

    if (occupancyRate > 90 && totalRevenue > 10000) {
      suggestions.push({
        type: 'success',
        icon: Zap,
        title: 'Portfolio Performance',
        description: 'Excellent performance! Consider expanding your portfolio.',
        action: 'Explore Expansion',
        color: 'bg-purple-500',
        priority: 'low'
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  useEffect(() => {
    const newSuggestions = generateSmartSuggestions();
    setSuggestions(newSuggestions);
    
    if (newSuggestions.length > 0) {
      setIsVisible(true);
      
      // Auto-cycle through suggestions
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % newSuggestions.length);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [properties, tenants]);

  if (suggestions.length === 0 || !isVisible) return null;

  const currentSuggestion = suggestions[currentIndex];
  const Icon = currentSuggestion.icon;

  return (
    <div className={`fixed top-20 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 transform transition-all duration-500 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-purple-600" />
          <h3 className="font-semibold text-gray-900">Smart Suggestion</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
      </div>

      {/* Suggestion Content */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 ${currentSuggestion.color} rounded-xl flex items-center justify-center`}>
            <Icon size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">{currentSuggestion.title}</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{currentSuggestion.description}</p>
          </div>
        </div>

        {/* Action Button */}
        <button className={`w-full py-3 ${currentSuggestion.color} text-white rounded-xl font-medium hover:opacity-90 transition-opacity`}>
          {currentSuggestion.action}
        </button>

        {/* Progress Indicators */}
        {suggestions.length > 1 && (
          <div className="flex justify-center gap-2">
            {suggestions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? `${currentSuggestion.color.replace('bg-', 'bg-')} w-6` 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Priority Badge */}
      <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-medium ${
        currentSuggestion.priority === 'high' ? 'bg-red-500 text-white' :
        currentSuggestion.priority === 'medium' ? 'bg-yellow-500 text-white' :
        'bg-gray-500 text-white'
      }`}>
        {currentSuggestion.priority.toUpperCase()}
      </div>

      {/* Floating Animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-2 right-4 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-100"></div>
        <div className="absolute bottom-4 left-6 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-300"></div>
      </div>
    </div>
  );
};

export default SmartSuggestionsPanel;