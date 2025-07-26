import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, DollarSign, TrendingUp, Calendar, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

interface OverviewStatsProps {
  stats: any;
  className?: string;
}

const OverviewStats: React.FC<OverviewStatsProps> = ({ stats, className = '' }) => {
  const { user } = useAuthStore();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  const overviewCards = [
    {
      title: 'Total Properties',
      value: stats?.totalProperties || 0,
      icon: Building2,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'from-blue-50 to-purple-50',
      textColor: 'text-blue-600',
      link: '/dashboard/properties',
      description: 'Active properties managed'
    },
    {
      title: 'Total Tenants',
      value: stats?.totalTenants || 0,
      icon: Users,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'from-green-50 to-emerald-50',
      textColor: 'text-green-600',
      link: '/dashboard/tenants',
      description: 'Active tenant relationships'
    },
    {
      title: 'Monthly Revenue',
      value: `$${(stats?.monthlyRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'from-emerald-50 to-green-50',
      textColor: 'text-emerald-600',
      link: '/dashboard/payments',
      description: 'Current month earnings'
    },
    {
      title: 'Occupancy Rate',
      value: `${stats?.occupancyRate || 0}%`,
      icon: TrendingUp,
      color: 'from-orange-500 to-red-600',
      bgColor: 'from-orange-50 to-red-50',
      textColor: 'text-orange-600',
      link: '/dashboard/properties',
      description: 'Units currently occupied'
    }
  ];

  // Filter cards based on user role
  const filteredCards = user?.role === 'Tenant' 
    ? overviewCards.filter(card => ['Monthly Revenue', 'Occupancy Rate'].includes(card.title))
    : overviewCards;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {filteredCards.map((card, index) => (
        <motion.div
          key={card.title}
          variants={cardVariants}
          custom={index}
          initial="hidden"
          animate="visible"
          className="group relative"
        >
          <Link href={card.link} className="block">
            <div className={`bg-gradient-to-br ${card.bgColor} rounded-3xl p-6 border-2 border-transparent hover:border-opacity-30 hover:border-gray-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden`}>
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-all duration-500`}></div>
              
              {/* Icon */}
              <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <card.icon size={28} className="text-white" />
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className={`text-lg font-bold ${card.textColor} mb-2 group-hover:scale-105 transition-transform duration-300`}>
                  {card.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900 mb-2 group-hover:scale-105 transition-transform duration-300">
                  {card.value}
                </p>
                <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                  {card.description}
                </p>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          </Link>
        </motion.div>
      ))}
      
      {/* Additional System Status Card */}
      <motion.div
        variants={cardVariants}
        custom={filteredCards.length}
        initial="hidden"
        animate="visible"
        className="group"
      >
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-6 border-2 border-transparent hover:border-blue-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
          
          {/* Icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <Activity size={28} className="text-white" />
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-blue-600 mb-2 group-hover:scale-105 transition-transform duration-300">
              System Status
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={20} className="text-green-500" />
              <span className="text-xl font-bold text-gray-900">Online</span>
            </div>
            <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
              All systems operational
            </p>
            
            {/* Status Indicators */}
            <div className="mt-4 flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600">API</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600">DB</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-600">Sync</span>
              </div>
            </div>
          </div>
          
          {/* Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      </motion.div>
    </div>
  );
};

export default OverviewStats;