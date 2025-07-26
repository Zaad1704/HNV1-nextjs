import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Building, Calendar } from 'lucide-react';

const AdvancedAnalytics = () => {
  const [timeRange, setTimeRange] = useState('12months');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const revenueData = [
    { month: 'Jan', revenue: 12000, expenses: 8000, profit: 4000 },
    { month: 'Feb', revenue: 13500, expenses: 8200, profit: 5300 },
    { month: 'Mar', revenue: 14200, expenses: 8500, profit: 5700 },
    { month: 'Apr', revenue: 13800, expenses: 8300, profit: 5500 },
    { month: 'May', revenue: 15200, expenses: 8800, profit: 6400 },
    { month: 'Jun', revenue: 16100, expenses: 9200, profit: 6900 }
  ];

  const occupancyData = [
    { month: 'Jan', rate: 92 },
    { month: 'Feb', rate: 94 },
    { month: 'Mar', rate: 96 },
    { month: 'Apr', rate: 93 },
    { month: 'May', rate: 97 },
    { month: 'Jun', rate: 95 }
  ];

  const propertyPerformance = [
    { name: 'Sunset Apartments', value: 35, color: '#1E3A8A' },
    { name: 'Downtown Complex', value: 28, color: '#C2410C' },
    { name: 'Garden View', value: 22, color: '#059669' },
    { name: 'City Heights', value: 15, color: '#7C3AED' }
  ];

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: '$84,800',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Occupancy Rate',
      value: '94.5%',
      change: '+2.1%',
      trend: 'up',
      icon: Building,
      color: 'text-blue-600'
    },
    {
      title: 'Avg. Rent/Unit',
      value: '$1,247',
      change: '+5.8%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Days to Fill',
      value: '12.3',
      change: '-18.2%',
      trend: 'down',
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Advanced Analytics</h1>
          <p className="text-text-secondary mt-1">Deep insights into your property performance</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-app-border rounded-xl bg-app-surface text-text-primary focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
        >
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="12months">Last 12 Months</option>
          <option value="24months">Last 24 Months</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="app-surface rounded-3xl p-6 border border-app-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${kpi.color.replace('text-', 'bg-').replace('-600', '-100')} rounded-2xl flex items-center justify-center`}>
                <kpi.icon size={24} className={kpi.color} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {kpi.change}
              </div>
            </div>
            <div>
              <p className="text-text-secondary text-sm">{kpi.title}</p>
              <p className="text-3xl font-bold text-text-primary">{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="app-surface rounded-3xl p-8 border border-app-border"
        >
          <h3 className="text-xl font-bold text-text-primary mb-6">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--app-surface)', 
                  border: '1px solid var(--app-border)',
                  borderRadius: '12px'
                }}
              />
              <Bar dataKey="revenue" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#C2410C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Occupancy Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="app-surface rounded-3xl p-8 border border-app-border"
        >
          <h3 className="text-xl font-bold text-text-primary mb-6">Occupancy Rate Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" domain={[85, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--app-surface)', 
                  border: '1px solid var(--app-border)',
                  borderRadius: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#059669" 
                strokeWidth={3}
                dot={{ fill: '#059669', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Property Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="app-surface rounded-3xl p-8 border border-app-border"
      >
        <h3 className="text-xl font-bold text-text-primary mb-6">Property Performance Distribution</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={propertyPerformance}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {propertyPerformance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-text-primary">Performance Insights</h4>
            {propertyPerformance.map((property, index) => (
              <div key={property.name} className="flex items-center justify-between p-3 bg-app-bg rounded-xl">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: property.color }}
                  />
                  <span className="font-medium text-text-primary">{property.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-text-primary">{property.value}%</span>
                  <p className="text-xs text-text-secondary">of total revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Predictive Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="app-surface rounded-3xl p-8 border border-app-border"
      >
        <h3 className="text-xl font-bold text-text-primary mb-6">AI-Powered Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-blue-50 rounded-2xl">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h4 className="font-semibold text-blue-900 mb-2">Revenue Forecast</h4>
            <p className="text-blue-800 text-sm mb-3">
              Based on current trends, expect 8.5% revenue growth next quarter.
            </p>
            <div className="text-2xl font-bold text-blue-900">$92,400</div>
            <p className="text-xs text-blue-700">Projected Q2 revenue</p>
          </div>

          <div className="p-6 bg-green-50 rounded-2xl">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
              <Building size={24} className="text-white" />
            </div>
            <h4 className="font-semibold text-green-900 mb-2">Optimal Pricing</h4>
            <p className="text-green-800 text-sm mb-3">
              Market analysis suggests 3-5% rent increase potential for premium units.
            </p>
            <div className="text-2xl font-bold text-green-900">+$47/mo</div>
            <p className="text-xs text-green-700">Average increase potential</p>
          </div>

          <div className="p-6 bg-purple-50 rounded-2xl">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
              <Users size={24} className="text-white" />
            </div>
            <h4 className="font-semibold text-purple-900 mb-2">Tenant Retention</h4>
            <p className="text-purple-800 text-sm mb-3">
              High satisfaction scores indicate 92% retention probability.
            </p>
            <div className="text-2xl font-bold text-purple-900">92%</div>
            <p className="text-xs text-purple-700">Predicted retention rate</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedAnalytics;