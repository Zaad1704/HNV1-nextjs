import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, DollarSign, Users, Calendar } from 'lucide-react';

interface GlassyAIInsightsWidgetProps {
  properties: any[];
  tenants: any[];
}

const GlassyAIInsightsWidget: React.FC<GlassyAIInsightsWidgetProps> = ({ properties, tenants }) => {
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
      <div className="backdrop-blur-xl border-2 border-white/40 rounded-3xl shadow-2xl p-6 relative overflow-hidden" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)'}}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5"></div>
        <div className="relative flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-xl backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
            <Sparkles size={24} className="text-white" />
          </div>
          <h3 className="font-bold text-white text-2xl drop-shadow-lg">AI Insights</h3>
        </div>
        <p className="text-white/90 text-lg font-medium drop-shadow-md">Add properties and tenants to see insights</p>
      </div>
    );
  }

  const currentInsight = insights[currentSlide];
  const Icon = currentInsight.icon;

  return (
    <div className="backdrop-blur-xl border-2 border-white/40 rounded-2xl shadow-xl overflow-hidden relative group hover:shadow-2xl transition-all duration-300" style={{background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)'}}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Header */}
      <div className="relative px-4 py-3 border-b border-white/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-lg backdrop-blur-sm flex items-center justify-center border border-white/40">
            <Sparkles size={16} className="text-white" />
          </div>
          <h3 className="font-bold text-white text-lg drop-shadow-lg">AI Insights</h3>
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
                <div className="w-20 h-20 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border-2 border-white/40 shadow-xl">
                  <InsightIcon size={32} className="text-white drop-shadow-lg" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white text-xl mb-2 drop-shadow-md">{insight.title}</h4>
                  <p className="text-5xl font-bold text-white mb-3 drop-shadow-lg">
                    {insight.value}
                  </p>
                  <p className="text-base text-white/90 leading-relaxed font-medium drop-shadow-sm">{insight.description}</p>
                </div>
                
                {/* Floating particles */}
                <div className="absolute top-4 right-4 w-1 h-1 bg-white/40 rounded-full animate-ping"></div>
                <div className="absolute bottom-6 right-8 w-1 h-1 bg-white/30 rounded-full animate-ping delay-1000"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Dots */}
      {insights.length > 1 && (
        <div className="relative px-6 py-4 border-t-2 border-white/30 backdrop-blur-sm">
          <div className="flex justify-center gap-4 mb-3">
            {insights.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-3 rounded-full transition-all duration-300 backdrop-blur-sm border-2 border-white/40 ${
                  index === currentSlide 
                    ? 'bg-white w-10 shadow-xl' 
                    : 'bg-white/40 w-3 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-white/90 text-center font-bold drop-shadow-sm">
            {isAutoSliding ? '✨ Auto-sliding' : '👆 Manual mode'}
          </div>
        </div>
      )}

      {/* Slide Indicator */}
      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border-2 border-white/40">
        <span className="text-sm text-white font-bold drop-shadow-sm">
          {currentSlide + 1}/{insights.length}
        </span>
      </div>
    </div>
  );
};

export default GlassyAIInsightsWidget;