'use client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users, CreditCard, Calendar, Download } from 'lucide-react';
import apiClient from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fetchBillingData = async () => {
  const { data } = await apiClient.get('/super-admin/billing');
  return data.data;
};

const AdminBillingPage = () => {
  const { data: billing, isLoading } = useQuery({
    queryKey: ['adminBilling'],
    queryFn: fetchBillingData,
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 app-gradient rounded-full animate-pulse"></div>
        <span className="ml-3 text-text-secondary">Loading billing data...</span>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${billing?.totalRevenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Monthly Revenue',
      value: `$${billing?.monthlyRevenue?.toLocaleString() || '0'}`,
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Subscriptions',
      value: billing?.activeSubscriptions?.toLocaleString() || '0',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Churn Rate',
      value: `${billing?.churnRate || '0'}%`,
      icon: CreditCard,
      color: 'bg-red-500'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 lg:space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Billing Overview</h1>
          <p className="text-sm lg:text-base text-text-secondary mt-1">Revenue and subscription analytics</p>
        </div>
        <button className="btn-gradient px-4 py-2 lg:px-6 lg:py-3 rounded-2xl flex items-center gap-2 font-semibold text-sm lg:text-base">
          <Download size={16} className="lg:w-5 lg:h-5" />
          Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="app-surface rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-app-border"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 lg:w-12 lg:h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon size={20} className="lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg lg:text-2xl font-bold text-text-primary">{stat.value}</h3>
            <p className="text-xs lg:text-sm text-text-secondary mt-1">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="app-surface rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-app-border"
      >
        <h2 className="text-lg lg:text-xl font-bold text-text-primary mb-4 lg:mb-6">Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={billing?.revenueChart || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="app-surface rounded-2xl lg:rounded-3xl border border-app-border overflow-hidden"
      >
        <div className="p-4 lg:p-6 border-b border-app-border">
          <h2 className="text-lg lg:text-xl font-bold text-text-primary">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-app-bg">
              <tr>
                <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-semibold text-text-secondary">Organization</th>
                <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-semibold text-text-secondary">Plan</th>
                <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-semibold text-text-secondary">Amount</th>
                <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-semibold text-text-secondary">Date</th>
                <th className="text-left p-3 lg:p-4 text-xs lg:text-sm font-semibold text-text-secondary">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {billing?.recentTransactions?.length > 0 ? (
                billing.recentTransactions.map((transaction: any) => (
                  <tr key={transaction._id} className="hover:bg-app-bg transition-colors">
                    <td className="p-3 lg:p-4 font-medium text-text-primary text-sm lg:text-base">
                      {transaction.organizationName}
                    </td>
                    <td className="p-3 lg:p-4 text-text-secondary text-sm lg:text-base">
                      {transaction.planName}
                    </td>
                    <td className="p-3 lg:p-4 font-semibold text-green-600 text-sm lg:text-base">
                      ${transaction.amount}
                    </td>
                    <td className="p-3 lg:p-4 text-text-secondary text-sm lg:text-base">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="p-3 lg:p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminBillingPage;