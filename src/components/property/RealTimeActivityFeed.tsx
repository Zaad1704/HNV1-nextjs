import React, { useState, useEffect } from 'react';
import { Activity, User, Home, DollarSign, Calendar, Edit, Plus, Trash2 } from 'lucide-react';

interface RealTimeActivityFeedProps {
  properties: any[];
  tenants: any[];
}

const RealTimeActivityFeed: React.FC<RealTimeActivityFeedProps> = ({ properties, tenants }) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [newActivityCount, setNewActivityCount] = useState(0);

  const generateRecentActivities = () => {
    const activities = [];
    const now = new Date();

    // Simulate recent activities based on data changes
    properties.forEach(property => {
      const updatedAt = new Date(property.updatedAt || property.createdAt);
      const hoursAgo = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursAgo < 24) {
        activities.push({
          id: `property-${property._id}`,
          type: 'property_updated',
          icon: Edit,
          title: 'Property Updated',
          description: `${property.name} was recently modified`,
          time: formatTimeAgo(updatedAt),
          color: 'bg-blue-500',
          property: property.name
        });
      }
    });

    tenants.forEach(tenant => {
      const createdAt = new Date(tenant.createdAt);
      const hoursAgo = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursAgo < 48) {
        activities.push({
          id: `tenant-${tenant._id}`,
          type: 'tenant_added',
          icon: User,
          title: 'New Tenant Added',
          description: `${tenant.name} joined as a tenant`,
          time: formatTimeAgo(createdAt),
          color: 'bg-green-500',
          tenant: tenant.name
        });
      }
    });

    // Add some simulated real-time activities
    const simulatedActivities = [
      {
        id: 'payment-1',
        type: 'payment_received',
        icon: DollarSign,
        title: 'Payment Received',
        description: 'Monthly rent payment processed',
        time: '2 minutes ago',
        color: 'bg-green-500'
      },
      {
        id: 'lease-1',
        type: 'lease_expiring',
        icon: Calendar,
        title: 'Lease Expiring Soon',
        description: 'Apartment 3B lease expires in 30 days',
        time: '15 minutes ago',
        color: 'bg-yellow-500'
      },
      {
        id: 'property-view-1',
        type: 'property_viewed',
        icon: Home,
        title: 'Property Viewed',
        description: 'Someone viewed Sunset Villa listing',
        time: '1 hour ago',
        color: 'bg-purple-500'
      }
    ];

    return [...activities, ...simulatedActivities]
      .sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime())
      .slice(0, 10);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  useEffect(() => {
    const newActivities = generateRecentActivities();
    setActivities(newActivities);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      const updatedActivities = generateRecentActivities();
      if (updatedActivities.length > activities.length) {
        setNewActivityCount(prev => prev + 1);
      }
      setActivities(updatedActivities);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [properties, tenants]);

  if (activities.length === 0) return null;

  return (
    <>
      {/* Activity Feed Toggle */}
      <button
        onClick={() => {
          setIsVisible(!isVisible);
          setNewActivityCount(0);
        }}
        className="fixed top-20 left-4 w-12 h-12 backdrop-blur-xl bg-orange-600/20 border-2 border-white/20 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300 z-40"
        style={{backdropFilter: 'blur(20px) saturate(180%)'}}
      >
        <Activity size={20} className="text-white" />
        {newActivityCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">{newActivityCount}</span>
          </div>
        )}
      </button>

      {/* Activity Feed Panel */}
      <div className={`fixed top-20 left-4 w-80 backdrop-blur-xl border-2 border-white/20 rounded-3xl shadow-2xl z-50 transform transition-all duration-500 ${
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
      }`} style={{backdropFilter: 'blur(20px) saturate(180%)', background: 'linear-gradient(to right, #FFDAB9, #ADD8E6)'}}>
        {/* Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-orange-600" />
              <h3 className="font-semibold text-gray-800">Recent Activity</h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-300 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Activity List */}
        <div className="max-h-96 overflow-y-auto">
          {activities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div 
                key={activity.id}
                className="p-4 border-b border-white/10 hover:bg-white/10 transition-colors duration-200"
                style={{
                  animation: `slideInLeft 0.3s ease-out ${index * 50}ms both`
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white text-sm">{activity.title}</h4>
                    <p className="text-sm text-gray-300 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-2">{activity.time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/20">
          <button className="w-full text-sm text-orange-400 hover:text-orange-300 font-medium">
            View All Activities
          </button>
        </div>

        {/* Live Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-300">Live</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default RealTimeActivityFeed;