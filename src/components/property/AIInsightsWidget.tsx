import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, DollarSign, Users, Calendar } from 'lucide-react';

interface AIInsightsWidgetProps {
  properties: any[];
  tenants: any[];
}

const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({ properties, tenants }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);

  // Generate AI insights based on data
  const generateInsights = () => {
    const insights = [];
    
    // Occupancy insight
    const totalUnits = properties.reduce((sum, p) => sum + (p.numberOfUnits || 1), 0);
    const occupiedUnits = tenants.filter(t => t.status === 'Active').length;
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    
    insights.push({
      icon: Users,
      title: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      description: occupancyRate > 85 ? 'Excellent occupancy!' : 'Room for improvement',
      color: occupancyRate > 85 ? 'text-green-600' : 'text-orange-600',
      bgColor: occupancyRate > 85 ? 'bg-green-50' : 'bg-orange-50'
    });

    // Revenue insight
    const totalRevenue = tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0);
    insights.push({
      icon: DollarSign,
      title: 'Monthly Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      description: 'Total rental income',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    });

    // Lease expiry insight
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
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      });
    }

    // Vacant properties insight
    const vacantProperties = properties.filter(p => {
      const propertyTenants = tenants.filter(t => t.propertyId === p._id && t.status === 'Active');
      return propertyTenants.length === 0;
    }).length;

    if (vacantProperties > 0) {
      insights.push({
        icon: AlertTriangle,
        title: 'Vacant Properties',
        value: vacantProperties.toString(),
        description: 'Properties without tenants',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      });
    }

    // Performance insight
    const avgRent = totalRevenue / Math.max(occupiedUnits, 1);
    insights.push({
      icon: TrendingUp,
      title: 'Average Rent',
      value: `$${Math.round(avgRent).toLocaleString()}`,
      description: 'Per occupied unit',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    });

    return insights;
  };

  const insights = generateInsights();

  // Auto-slide functionality
  useEffect(() => {
    if (isAutoSliding && insights.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % insights.length);
      }, 4000); // Change slide every 4 seconds

      return () => clearInterval(interval);
    }
  }, [isAutoSliding, insights.length]);

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
    setIsAutoSliding(false);
    // Resume auto-sliding after 10 seconds of inactivity
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-purple-600" />
          <h3 className="font-semibold text-gray-900">AI Insights</h3>
        </div>
        <p className="text-gray-500 text-sm">Add properties and tenants to see insights</p>
      </div>
    );
  }

  const currentInsight = insights[currentSlide];
  const Icon = currentInsight.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-purple-600" />
          <h3 className="font-semibold text-gray-900">AI Insights</h3>
        </div>
      </div>

      {/* Sliding Content */}
      <div className="relative h-32 overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {insights.map((insight, index) => {
            const InsightIcon = insight.icon;
            return (
              <div key={index} className="w-full flex-shrink-0 p-6 flex items-center gap-4">
                <div className={`w-12 h-12 ${insight.bgColor} rounded-xl flex items-center justify-center`}>
                  <InsightIcon size={24} className={insight.color} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{insight.value}</p>
                  <p className="text-sm text-gray-600">{insight.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Dots */}
      {insights.length > 1 && (
        <div className="px-6 py-3 border-t border-gray-100">
          <div className="flex justify-center gap-2">
            {insights.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentSlide 
                    ? 'bg-purple-600 w-6' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-400 text-center mt-2">
            {isAutoSliding ? 'Auto-sliding' : 'Manual mode'}
          </div>
        </div>
      )}

      {/* Slide Indicator */}
      <div className="absolute top-4 right-4 bg-black/10 rounded-full px-2 py-1">
        <span className="text-xs text-gray-600">
          {currentSlide + 1}/{insights.length}
        </span>
      </div>
    </div>
  );
};

export default AIInsightsWidget;