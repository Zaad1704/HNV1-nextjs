import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, DollarSign, Users, Calendar } from 'lucide-react';

interface FixedGlassyAIInsightsWidgetProps {
  properties: any[];
  tenants: any[];
}

const FixedGlassyAIInsightsWidget: React.FC<FixedGlassyAIInsightsWidgetProps> = ({ properties, tenants }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);

  const generateInsights = () => {
    const insights = [];
    
    const totalUnits = properties.reduce((sum, p) => sum + (p.numberOfUnits || 1), 0);
    const occupiedUnits = tenants.filter(t => t.status === 'Active').length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    
    insights.push({
      icon: Users,
      title: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      description: occupancyRate > 85 ? 'Excellent performance!' : 'Room for growth',
    });

    const totalRevenue = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
    insights.push({
      icon: DollarSign,
      title: 'Monthly Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      description: 'Total rental income',
    });

    const expiringLeases = tenants.filter(t => {
      if (!t.leaseEndDate) return false;
      const endDate = new Date(t.leaseEndDate);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      return endDate <= threeMonthsFromNow && endDate >= new Date();
    }).length;

    if (expiringLeases > 0) {
      insights.push({
        icon: Calendar,
        title: 'Expiring Leases',
        value: expiringLeases.toString(),
        description: 'Leases ending in 3 months',
      });
    }

    const avgRent = totalRevenue / Math.max(occupiedUnits, 1);
    insights.push({
      icon: TrendingUp,
      title: 'Average Rent',
      value: `$${Math.round(avgRent).toLocaleString()}`,
      description: 'Per occupied unit',
    });

    return insights;
  };

  const insights = generateInsights();

  useEffect(() => {
    if (isAutoSliding && insights.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % insights.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoSliding, insights.length]);

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
    setIsAutoSliding(false);
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  if (insights.length === 0) {
    return (
      <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-purple-600/80 rounded-xl flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <h3 className="font-bold text-white text-lg">AI Insights</h3>
        </div>
        <p className="text-gray-300 text-sm">Add properties and tenants to see insights</p>
      </div>
    );
  }

  const currentInsight = insights[currentSlide];
  const Icon = currentInsight.icon;

  return (
    <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative group hover:bg-black/30 transition-all duration-300">
      {/* Header */}
      <div className="relative px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600/80 rounded-xl flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <h3 className="font-bold text-white text-xl">AI Insights</h3>
        </div>
      </div>

      {/* Sliding Content */}
      <div className="relative h-40 overflow-hidden">
        <div 
          className="flex transition-transform duration-700 ease-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {insights.map((insight, index) => {
            const InsightIcon = insight.icon;
            return (
              <div key={index} className="w-full flex-shrink-0 p-6 flex items-center gap-5 relative">
                <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
                  <InsightIcon size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-lg mb-1">{insight.title}</h4>
                  <p className="text-4xl font-bold text-white mb-2">
                    {insight.value}
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Dots */}
      {insights.length > 1 && (
        <div className="relative px-6 py-4 border-t border-white/10">
          <div className="flex justify-center gap-3 mb-3">
            {insights.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white w-8' 
                    : 'bg-white/30 w-2 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-400 text-center font-medium">
            {isAutoSliding ? '✨ Auto-sliding' : '👆 Manual mode'}
          </div>
        </div>
      )}

      {/* Slide Indicator */}
      <div className="absolute top-4 right-4 bg-black/40 rounded-full px-3 py-1 border border-white/10">
        <span className="text-xs text-white font-medium">
          {currentSlide + 1}/{insights.length}
        </span>
      </div>
    </div>
  );
};

export default FixedGlassyAIInsightsWidget;