import React from 'react';
import { TrendingUp, DollarSign, Calendar, AlertTriangle, CheckCircle, Clock, Users, Building2 } from 'lucide-react';

interface PaymentInsightsPanelProps {
  payments: any[];
  className?: string;
}

const PaymentInsightsPanel: React.FC<PaymentInsightsPanelProps> = ({ payments, className = '' }) => {
  const getInsights = () => {
    if (!payments.length) return null;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = new Date(currentYear, currentMonth - 1);

    // Current month payments
    const thisMonthPayments = payments.filter(p => {
      const date = new Date(p.paymentDate || p.createdAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    // Last month payments
    const lastMonthPayments = payments.filter(p => {
      const date = new Date(p.paymentDate || p.createdAt);
      return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    });

    const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const lastMonthTotal = lastMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const growth = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    // Payment methods analysis
    const methodStats = payments.reduce((acc, p) => {
      const method = p.paymentMethod || 'Unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    const topMethod = Object.entries(methodStats).sort(([,a], [,b]) => b - a)[0];

    // Status analysis
    const completed = payments.filter(p => p.status === 'Completed' || p.status === 'Paid').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const failed = payments.filter(p => p.status === 'failed').length;
    const successRate = payments.length > 0 ? (completed / payments.length) * 100 : 0;

    // Average payment analysis
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const avgPayment = payments.length > 0 ? totalAmount / payments.length : 0;

    // Recent trends (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentPayments = payments.filter(p => {
      const date = new Date(p.paymentDate || p.createdAt);
      return date >= sevenDaysAgo;
    });

    return {
      thisMonthTotal,
      lastMonthTotal,
      growth,
      topMethod,
      successRate,
      avgPayment,
      recentCount: recentPayments.length,
      completed,
      pending,
      failed
    };
  };

  const insights = getInsights();

  if (!insights) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <DollarSign size={24} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">Add payments to see AI insights</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <TrendingUp size={14} className="text-white" />
        </div>
        <h3 className="font-semibold text-gray-900">Payment Insights</h3>
      </div>

      <div className="space-y-3">
        {/* Monthly Growth */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Monthly Growth</span>
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              insights.growth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp size={12} className={insights.growth < 0 ? 'rotate-180' : ''} />
              {Math.abs(insights.growth).toFixed(1)}%
            </div>
          </div>
          <div className="text-xs text-gray-600">
            This month: ${insights.thisMonthTotal.toLocaleString()} vs Last month: ${insights.lastMonthTotal.toLocaleString()}
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Success Rate</span>
            <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
              <CheckCircle size={12} />
              {insights.successRate.toFixed(1)}%
            </div>
          </div>
          <div className="flex gap-2 text-xs text-gray-600">
            <span>✅ {insights.completed} completed</span>
            <span>⏳ {insights.pending} pending</span>
            <span>❌ {insights.failed} failed</span>
          </div>
        </div>

        {/* Average Payment */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Average Payment</span>
            <div className="flex items-center gap-1 text-sm font-semibold text-orange-600">
              <DollarSign size={12} />
              ${Math.round(insights.avgPayment).toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-gray-600">
            Based on {payments.length} total payments
          </div>
        </div>

        {/* Top Payment Method */}
        {insights.topMethod && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Top Method</span>
              <div className="flex items-center gap-1 text-sm font-semibold text-purple-600">
                <Building2 size={12} />
                {insights.topMethod[0]}
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {insights.topMethod[1]} payments ({((insights.topMethod[1] / payments.length) * 100).toFixed(1)}%)
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Recent Activity</span>
            <div className="flex items-center gap-1 text-sm font-semibold text-blue-600">
              <Calendar size={12} />
              {insights.recentCount} payments
            </div>
          </div>
          <div className="text-xs text-gray-600">
            Last 7 days activity
          </div>
        </div>
      </div>

      {/* Quick Recommendations */}
      <div className="border-t pt-3">
        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Recommendations</div>
        <div className="space-y-2">
          {insights.pending > 0 && (
            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded p-2">
              <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
              <span>You have {insights.pending} pending payments that need attention</span>
            </div>
          )}
          {insights.failed > 0 && (
            <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 rounded p-2">
              <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
              <span>Review {insights.failed} failed payments for retry or resolution</span>
            </div>
          )}
          {insights.growth < -10 && (
            <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 rounded p-2">
              <TrendingUp size={12} className="mt-0.5 flex-shrink-0" />
              <span>Payment volume decreased by {Math.abs(insights.growth).toFixed(1)}% - consider follow-up</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentInsightsPanel;